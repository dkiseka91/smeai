import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, getApiBase } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Download, Plus, Trash2, Calculator } from 'lucide-react';

interface ProductLine { id: string; name: string; price: number; unitsPerMonth: number; monthlyGrowthRate: number; }
interface FixedCost { id: string; name: string; monthlyAmount: number; }
interface MonthlyRow { month: number; revenue: number; cogs: number; grossProfit: number; ebitda: number; netProfit: number; netCashFlow: number; cumulativeCash: number; isNegativeCash: boolean; }
interface AnnualSummary { year: number; revenue: number; grossProfit: number; netProfit: number; }
interface FinancialOutputs { monthly: MonthlyRow[]; annual: AnnualSummary[]; breakeven: { breakevenMonth: number | null; monthlyBreakevenRevenue: number }; }

const uid = () => Math.random().toString(36).slice(2);

export default function FinancialModelBuilder() {
  const { profileId } = useParams();
  const [tab, setTab] = useState<'revenue'|'costs'|'results'>('revenue');
  const [products, setProducts] = useState<ProductLine[]>([{ id: uid(), name: 'Product 1', price: 100, unitsPerMonth: 10, monthlyGrowthRate: 5 }]);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([{ id: uid(), name: 'Rent & Utilities', monthlyAmount: 1000 }]);
  const [outputs, setOutputs] = useState<FinancialOutputs | null>(null);
  const [savedModelId, setSavedModelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => api.get(`/profiles/${profileId}`).then(r => r.data),
    enabled: !!profileId,
  });

  const calculate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/financial/calculate', {
        currency: profile?.onboardingData?.currency ?? 'USD',
        startDate: new Date().toISOString().slice(0, 10),
        productLines: products,
        fixedCosts,
        variableCosts: [{ id: uid(), name: 'Variable Costs', type: 'PERCENT_OF_REVENUE', value: 20 }],
      });
      setOutputs(data as FinancialOutputs);
      setSavedModelId(null);
      setTab('results');
    } finally {
      setLoading(false);
    }
  };

  const downloadXlsx = async () => {
    if (!outputs || !profileId) return;
    setDownloading(true);
    try {
      let modelId = savedModelId;
      if (!modelId) {
        const modelIdTemp = `fin_${Date.now()}`;
        const { data } = await api.post(`/financial/${modelIdTemp}/save`, {
          profileId,
          inputs: { productLines: products, fixedCosts },
          outputs,
        });
        modelId = data.id as string;
        setSavedModelId(modelId);
      }
      const token = useAuthStore.getState().accessToken ?? '';
      const resp = await fetch(`${getApiBase()}/exports/financial/${modelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Export failed');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'financial-model.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-navy">Financial Model</h1>
          <p className="text-steel-grey text-sm">{profile?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {outputs && (
            <button onClick={downloadXlsx} disabled={downloading}
              className="flex items-center gap-2 bg-white border border-gray-200 text-navy px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50">
              <Download size={16} className={downloading ? 'animate-spin' : ''} />
              {downloading ? 'Exporting…' : 'Download XLSX'}
            </button>
          )}
          <button onClick={calculate} disabled={loading}
            className="flex items-center gap-2 bg-amber text-navy px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-amber/90 disabled:opacity-50">
            <Calculator size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Calculating…' : 'Calculate'}
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        {(['revenue', 'costs', 'results'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${tab === t ? 'border-amber text-navy' : 'border-transparent text-steel-grey hover:text-navy'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'revenue' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>{['Product / Service', 'Price ($)', 'Units/Month', 'Monthly Growth %', ''].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-4 py-3"><input value={p.name} onChange={e => { const c = [...products]; c[i] = { ...c[i], name: e.target.value }; setProducts(c); }} className="border border-gray-200 rounded px-2 py-1 text-sm w-full" /></td>
                    <td className="px-4 py-3"><input type="number" value={p.price} onChange={e => { const c = [...products]; c[i] = { ...c[i], price: +e.target.value }; setProducts(c); }} className="border border-gray-200 rounded px-2 py-1 text-sm w-24" /></td>
                    <td className="px-4 py-3"><input type="number" value={p.unitsPerMonth} onChange={e => { const c = [...products]; c[i] = { ...c[i], unitsPerMonth: +e.target.value }; setProducts(c); }} className="border border-gray-200 rounded px-2 py-1 text-sm w-24" /></td>
                    <td className="px-4 py-3"><input type="number" value={p.monthlyGrowthRate} onChange={e => { const c = [...products]; c[i] = { ...c[i], monthlyGrowthRate: +e.target.value }; setProducts(c); }} className="border border-gray-200 rounded px-2 py-1 text-sm w-24" /></td>
                    <td className="px-4 py-3"><button onClick={() => setProducts(products.filter(x => x.id !== p.id))} className="text-steel-grey hover:text-error"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100">
            <button onClick={() => setProducts([...products, { id: uid(), name: `Product ${products.length + 1}`, price: 100, unitsPerMonth: 10, monthlyGrowthRate: 5 }])}
              className="flex items-center gap-2 text-navy text-sm font-medium hover:underline"><Plus size={14} /> Add Product Line</button>
          </div>
        </div>
      )}

      {tab === 'costs' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>{['Cost Item', 'Monthly Amount ($)', ''].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {fixedCosts.map((c, i) => (
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="px-4 py-3"><input value={c.name} onChange={e => { const fc = [...fixedCosts]; fc[i] = { ...fc[i], name: e.target.value }; setFixedCosts(fc); }} className="border border-gray-200 rounded px-2 py-1 text-sm w-full" /></td>
                    <td className="px-4 py-3"><input type="number" value={c.monthlyAmount} onChange={e => { const fc = [...fixedCosts]; fc[i] = { ...fc[i], monthlyAmount: +e.target.value }; setFixedCosts(fc); }} className="border border-gray-200 rounded px-2 py-1 text-sm w-32" /></td>
                    <td className="px-4 py-3"><button onClick={() => setFixedCosts(fixedCosts.filter(x => x.id !== c.id))} className="text-steel-grey hover:text-error"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100">
            <button onClick={() => setFixedCosts([...fixedCosts, { id: uid(), name: 'New Cost', monthlyAmount: 500 }])}
              className="flex items-center gap-2 text-navy text-sm font-medium hover:underline"><Plus size={14} /> Add Cost Item</button>
          </div>
        </div>
      )}

      {tab === 'results' && outputs && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Year 1 Revenue',    value: fmt(outputs.annual[0]?.revenue ?? 0) },
              { label: 'Year 3 Revenue',    value: fmt(outputs.annual[2]?.revenue ?? 0) },
              { label: 'Break-even Month',  value: outputs.breakeven.breakevenMonth ? `Month ${outputs.breakeven.breakevenMonth}` : 'Not reached' },
              { label: 'Year 3 Net Profit', value: fmt(outputs.annual[2]?.netProfit ?? 0) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl p-5 border border-gray-100">
                <p className="text-steel-grey text-xs mb-1">{label}</p>
                <p className="font-montserrat font-bold text-navy text-xl">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="font-montserrat font-bold text-navy mb-4">Revenue vs Total Costs (Monthly)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={outputs.monthly.slice(0, 24)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${((v as number)/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#1A2744" strokeWidth={2} dot={false} name="Revenue" />
                <Line type="monotone" dataKey="cogs" stroke="#F5A623" strokeWidth={2} dot={false} name="COGS" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="font-montserrat font-bold text-navy mb-4">Cumulative Cash Flow</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={outputs.monthly.slice(0, 24)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${((v as number)/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Bar dataKey="cumulativeCash" name="Cumulative Cash" fill="#1A2744" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'results' && !outputs && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-24 text-center">
          <p className="text-steel-grey">Click Calculate to see your financial projections</p>
        </div>
      )}
    </div>
  );
}
