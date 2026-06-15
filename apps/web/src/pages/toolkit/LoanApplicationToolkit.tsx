import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, getApiBase } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { Download, RefreshCw, CheckSquare, Square, FileText, Building2 } from 'lucide-react';

interface Profile { id: string; name: string; isComplete: boolean; }

const FUNDERS = [
  'Stanbic Bank Uganda', 'Centenary Bank', 'DFCU Bank', 'KCB Uganda', 'Equity Bank Uganda',
  'Uganda Development Bank', 'NSSF Uganda', 'African Development Bank', 'World Bank IFC',
  'Enterprise Uganda', 'PSFU Uganda', 'Mastercard Foundation', 'Other',
];

const UGANDAN_BANKS = [
  'Stanbic Bank Uganda', 'Centenary Bank', 'DFCU Bank', 'KCB Uganda', 'Equity Bank Uganda',
  'Standard Chartered Uganda', 'Absa Bank Uganda', 'Housing Finance Bank', 'Cairo Bank Uganda',
];

const BASE_CHECKLIST = [
  { id: 'reg', label: 'Business registration certificate (URSB)' },
  { id: 'tin', label: 'Tax Identification Number (TIN) certificate' },
  { id: 'id', label: 'Director / owner national ID or passport' },
  { id: 'stmt', label: '6-month bank statements (certified)' },
  { id: 'plan', label: 'Business plan (you can use your generated plan)' },
  { id: 'fin', label: '3-year financial statements or projections' },
  { id: 'photo', label: 'Passport-size photographs (2 per director)' },
  { id: 'lease', label: 'Premises lease/tenancy agreement or land title' },
  { id: 'ref', label: 'Two business references (suppliers or clients)' },
];

const BANK_EXTRA: Record<string, { id: string; label: string }[]> = {
  'Stanbic Bank Uganda': [
    { id: 'stanbic_collateral', label: 'Collateral valuation report (if using property)' },
    { id: 'stanbic_cr12', label: 'Company CR12 search (URSB) — for limited companies' },
  ],
  'DFCU Bank': [
    { id: 'dfcu_cashflow', label: 'Projected cash flow statement (24 months)' },
    { id: 'dfcu_insurance', label: 'Insurance policy for collateral assets' },
  ],
  'Centenary Bank': [
    { id: 'centy_group', label: 'Group guarantee forms (if applying as a group)' },
    { id: 'centy_savings', label: 'Proof of savings account with Centenary Bank' },
  ],
  'KCB Uganda': [
    { id: 'kcb_invoice', label: 'LPO or invoices (for invoice discounting)' },
    { id: 'kcb_agri', label: 'Land title or crop assessment (for agri-loans)' },
  ],
  'Equity Bank Uganda': [
    { id: 'eq_kyc', label: 'KYC form (completed and signed)' },
    { id: 'eq_mobile', label: 'MTN/Airtel Mobile Money statement (6 months)' },
  ],
};

type TabId = 'cover' | 'loan' | 'checklist';

function storageKey(profileId: string | undefined) {
  return `checklist:${profileId ?? 'default'}`;
}

function loadChecked(profileId: string | undefined): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(profileId));
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
  return new Set();
}

export default function LoanApplicationToolkit() {
  const { profileId } = useParams();
  const [tab, setTab] = useState<TabId>('cover');

  // Cover letter state
  const [funderName, setFunderName] = useState('');
  const [customFunder, setCustomFunder] = useState('');
  const [coverAmount, setCoverAmount] = useState('');
  const [coverPurpose, setCoverPurpose] = useState('');
  const [coverContent, setCoverContent] = useState('');
  const [coverDocId, setCoverDocId] = useState<string | null>(null);
  const [coverGenerating, setCoverGenerating] = useState(false);
  const [coverError, setCoverError] = useState('');

  // Bank loan writer state
  const [bankName, setBankName] = useState('Stanbic Bank Uganda');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanTenure, setLoanTenure] = useState('36');
  const [loanContent, setLoanContent] = useState('');
  const [loanDocId, setLoanDocId] = useState<string | null>(null);
  const [loanGenerating, setLoanGenerating] = useState(false);
  const [loanError, setLoanError] = useState('');

  // Checklist state
  const [checked, setChecked] = useState<Set<string>>(() => loadChecked(profileId));
  const [checklistBank, setChecklistBank] = useState('Stanbic Bank Uganda');

  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile', profileId],
    queryFn: () => api.get(`/profiles/${profileId}`).then(r => r.data as Profile),
    enabled: !!profileId,
  });

  const effectiveFunder = funderName === 'Other' ? customFunder : funderName;

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(storageKey(profileId), JSON.stringify([...next]));
      return next;
    });
  };

  const handleCoverGenerate = async () => {
    if (!effectiveFunder || !coverAmount || !coverPurpose) {
      setCoverError('Please fill in funder, amount, and purpose.');
      return;
    }
    setCoverError(''); setCoverGenerating(true); setCoverContent(''); setCoverDocId(null);
    try {
      const token = useAuthStore.getState().accessToken ?? '';
      const resp = await fetch(`${getApiBase()}/documents/cover-letter/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profileId, funderName: effectiveFunder, amount: parseFloat(coverAmount), purpose: coverPurpose }),
      });
      const data = await resp.json() as { content?: string; documentId?: string; error?: { message?: string } };
      if (!resp.ok) throw new Error(data.error?.message ?? 'Generation failed');
      setCoverContent(data.content ?? '');
      setCoverDocId(data.documentId ?? null);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setCoverGenerating(false);
    }
  };

  const handleLoanGenerate = async () => {
    if (!loanAmount || !loanPurpose) {
      setLoanError('Please fill in loan amount and purpose.');
      return;
    }
    setLoanError(''); setLoanGenerating(true); setLoanContent(''); setLoanDocId(null);
    try {
      const token = useAuthStore.getState().accessToken ?? '';
      const resp = await fetch(`${getApiBase()}/documents/bank-loan/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profileId, bankName, loanAmount: parseFloat(loanAmount), purpose: loanPurpose, tenureMonths: parseInt(loanTenure) }),
      });
      const data = await resp.json() as { content?: string; documentId?: string; error?: { message?: string } };
      if (!resp.ok) throw new Error(data.error?.message ?? 'Generation failed');
      setLoanContent(data.content ?? '');
      setLoanDocId(data.documentId ?? null);
    } catch (err) {
      setLoanError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoanGenerating(false);
    }
  };

  const handleExport = async (docId: string) => {
    const { data } = await api.get(`/exports/document/${docId}/DOCX`);
    window.open((data as { url: string }).url, '_blank');
  };

  const allItems = [
    ...BASE_CHECKLIST,
    ...(BANK_EXTRA[checklistBank] ?? []),
  ];
  const doneCount = allItems.filter(i => checked.has(i.id)).length;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'cover', label: 'Cover Letter', icon: <FileText size={16} /> },
    { id: 'loan', label: 'Bank Loan Writer', icon: <Building2 size={16} /> },
    { id: 'checklist', label: 'Document Checklist', icon: <CheckSquare size={16} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-montserrat font-bold text-2xl text-navy">Loan Application Toolkit</h1>
        <p className="text-steel-grey text-sm mt-1">{profile?.name}</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === t.id ? 'border-amber text-navy' : 'border-transparent text-steel-grey hover:text-navy'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── Cover Letter ─────────────────────────────────────────── */}
      {tab === 'cover' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
            <h2 className="font-montserrat font-bold text-navy">Cover Letter Generator</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-grey mb-1">Funder / Institution</label>
                <select value={funderName} onChange={e => setFunderName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy">
                  <option value="">Select funder…</option>
                  {FUNDERS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              {funderName === 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-1">Custom Funder Name</label>
                  <input value={customFunder} onChange={e => setCustomFunder(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy" placeholder="Enter institution name" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-dark-grey mb-1">Funding Amount (USD)</label>
                <input type="number" value={coverAmount} onChange={e => setCoverAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy" placeholder="e.g. 50000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-grey mb-1">Purpose of Funding</label>
              <textarea rows={3} value={coverPurpose} onChange={e => setCoverPurpose(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy resize-none"
                placeholder="Describe how you will use the funds — e.g. equipment purchase, working capital, expansion…" />
            </div>
            {coverError && <p className="text-red-600 text-sm">{coverError}</p>}
            <div className="flex gap-3">
              <button onClick={handleCoverGenerate} disabled={coverGenerating || !profile?.isComplete}
                className="flex items-center gap-2 bg-amber text-navy px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-amber/90 disabled:opacity-50">
                <RefreshCw size={15} className={coverGenerating ? 'animate-spin' : ''} />
                {coverGenerating ? 'Generating…' : 'Generate Cover Letter'}
              </button>
              {coverDocId && (
                <button onClick={() => handleExport(coverDocId)}
                  className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy/90">
                  <Download size={15} /> Export DOCX
                </button>
              )}
            </div>
            {!profile?.isComplete && (
              <p className="text-xs text-steel-grey">Complete your business profile in Onboarding first.</p>
            )}
          </div>
          {coverContent && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="font-montserrat font-bold text-navy mb-4">Generated Cover Letter</h3>
              <div className="text-sm text-dark-grey leading-relaxed whitespace-pre-wrap font-opensans border border-gray-100 rounded-lg p-4 bg-gray-50 max-h-[60vh] overflow-y-auto">
                {coverContent}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bank Loan Writer ──────────────────────────────────────── */}
      {tab === 'loan' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
            <h2 className="font-montserrat font-bold text-navy">Bank Loan Application Writer</h2>
            <p className="text-steel-grey text-sm">Generates a full bank-formatted loan application narrative (750–1,000 words) tailored to the specific lender's requirements.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-grey mb-1">Target Bank</label>
                <select value={bankName} onChange={e => setBankName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy">
                  {UGANDAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-grey mb-1">Loan Amount (USD)</label>
                <input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy" placeholder="e.g. 100000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-grey mb-1">Repayment Tenure (months)</label>
                <select value={loanTenure} onChange={e => setLoanTenure(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy">
                  {[12, 24, 36, 48, 60, 72, 84, 120].map(m => <option key={m} value={m}>{m} months ({(m/12).toFixed(1)} years)</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-grey mb-1">Loan Purpose</label>
              <textarea rows={3} value={loanPurpose} onChange={e => setLoanPurpose(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy resize-none"
                placeholder="Describe exactly how the loan will be used — specific assets, working capital, expansion plans…" />
            </div>
            {loanError && <p className="text-red-600 text-sm">{loanError}</p>}
            <div className="flex gap-3">
              <button onClick={handleLoanGenerate} disabled={loanGenerating || !profile?.isComplete}
                className="flex items-center gap-2 bg-amber text-navy px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-amber/90 disabled:opacity-50">
                <RefreshCw size={15} className={loanGenerating ? 'animate-spin' : ''} />
                {loanGenerating ? 'Writing Application…' : 'Generate Loan Application'}
              </button>
              {loanDocId && (
                <button onClick={() => handleExport(loanDocId)}
                  className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy/90">
                  <Download size={15} /> Export DOCX
                </button>
              )}
            </div>
            {!profile?.isComplete && (
              <p className="text-xs text-steel-grey">Complete your business profile in Onboarding first.</p>
            )}
          </div>
          {loanContent && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="font-montserrat font-bold text-navy mb-4">Loan Application — {bankName}</h3>
              <div className="text-sm text-dark-grey leading-relaxed whitespace-pre-wrap font-opensans border border-gray-100 rounded-lg p-4 bg-gray-50 max-h-[60vh] overflow-y-auto">
                {loanContent}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Document Checklist ───────────────────────────────────── */}
      {tab === 'checklist' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-montserrat font-bold text-navy">Document Checklist</h2>
              <span className="text-sm font-semibold text-amber">{doneCount} / {allItems.length} ready</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark-grey mb-1">Customise for bank</label>
              <select value={checklistBank} onChange={e => setChecklistBank(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy">
                {UGANDAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="h-2 bg-gray-100 rounded-full mb-6">
              <div className="h-2 bg-amber rounded-full transition-all" style={{ width: `${(doneCount / allItems.length) * 100}%` }} />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-steel-grey uppercase tracking-wider">Standard Requirements</p>
              {BASE_CHECKLIST.map(item => (
                <button key={item.id} onClick={() => toggleCheck(item.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-amber/30 hover:bg-amber/5 transition-colors text-left">
                  {checked.has(item.id)
                    ? <CheckSquare size={18} className="text-amber shrink-0" />
                    : <Square size={18} className="text-gray-300 shrink-0" />}
                  <span className={`text-sm ${checked.has(item.id) ? 'text-steel-grey line-through' : 'text-dark-grey'}`}>{item.label}</span>
                </button>
              ))}
              {(BANK_EXTRA[checklistBank] ?? []).length > 0 && (
                <>
                  <p className="text-xs font-semibold text-steel-grey uppercase tracking-wider pt-2">{checklistBank} — Additional Requirements</p>
                  {(BANK_EXTRA[checklistBank] ?? []).map(item => (
                    <button key={item.id} onClick={() => toggleCheck(item.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-amber/20 bg-amber/5 hover:bg-amber/10 transition-colors text-left">
                      {checked.has(item.id)
                        ? <CheckSquare size={18} className="text-amber shrink-0" />
                        : <Square size={18} className="text-amber/40 shrink-0" />}
                      <span className={`text-sm ${checked.has(item.id) ? 'text-steel-grey line-through' : 'text-dark-grey'}`}>{item.label}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="bg-navy/5 rounded-xl p-4 text-xs text-steel-grey leading-relaxed">
            <strong className="text-navy">Tip:</strong> Your progress is saved automatically in this browser. Generate your Business Plan and Financial Model first — both will be needed as supporting documents.
          </div>
        </div>
      )}
    </div>
  );
}
