import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Download, FileText, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
const FUNDERS = [
    'Stanbic Bank Uganda', 'Centenary Bank', 'DFCU Bank', 'KCB Uganda', 'Equity Bank Uganda',
    'Uganda Development Bank', 'NSSF Uganda', 'African Development Bank', 'World Bank IFC',
    'UNCDF', 'FSD Uganda', 'Mastercard Foundation', 'Other',
];
export default function LoanApplicationToolkit() {
    const { profileId } = useParams();
    const { user } = useAuthStore();
    const [funderName, setFunderName] = useState('');
    const [customFunder, setCustomFunder] = useState('');
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [coverLetterContent, setCoverLetterContent] = useState('');
    const [generating, setGenerating] = useState(false);
    const [documentId, setDocumentId] = useState(null);
    const [error, setError] = useState('');
    const { data: profile } = useQuery({
        queryKey: ['profile', profileId],
        queryFn: () => api.get(`/profiles/${profileId}`).then(r => r.data),
        enabled: !!profileId,
    });
    const effectiveFunder = funderName === 'Other' ? customFunder : funderName;
    const handleGenerate = async () => {
        if (!effectiveFunder || !amount || !purpose) {
            setError('Please fill in funder name, amount, and purpose.');
            return;
        }
        setError('');
        setGenerating(true);
        setCoverLetterContent('');
        setDocumentId(null);
        try {
            const token = useAuthStore.getState().accessToken ?? '';
            const resp = await fetch('/api/documents/cover-letter/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ profileId, funderName: effectiveFunder, amount: parseFloat(amount), purpose }),
            });
            const data = await resp.json();
            if (!resp.ok)
                throw new Error(data.error?.message ?? 'Generation failed');
            setCoverLetterContent(data.content ?? '');
            setDocumentId(data.documentId ?? null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Generation failed');
        }
        finally {
            setGenerating(false);
        }
    };
    const handleExport = async (format) => {
        if (!documentId)
            return;
        const { data } = await api.get(`/exports/document/${documentId}/${format}`);
        window.open(data.url, '_blank');
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-montserrat font-bold text-2xl text-navy", children: "Loan Application Toolkit" }), _jsx("p", { className: "text-steel-grey text-sm mt-1", children: profile?.name })] }), coverLetterContent && documentId && (_jsxs("button", { onClick: () => handleExport('DOCX'), className: "flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy/90", children: [_jsx(Download, { size: 15 }), " Export DOCX"] }))] }), !profile?.isComplete && (_jsx("div", { className: "bg-amber/10 border border-amber/30 rounded-xl p-4 mb-6 text-sm text-amber font-medium", children: "Complete your business profile before generating application documents." })), _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-xl border border-gray-100 p-6 space-y-4", children: [_jsx("h2", { className: "font-montserrat font-bold text-navy", children: "Cover Letter Details" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-dark-grey mb-1", children: "Funder / Institution" }), _jsxs("select", { value: funderName, onChange: e => setFunderName(e.target.value), className: "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy", children: [_jsx("option", { value: "", children: "Select funder\u2026" }), FUNDERS.map(f => _jsx("option", { value: f, children: f }, f))] })] }), funderName === 'Other' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-dark-grey mb-1", children: "Funder Name" }), _jsx("input", { value: customFunder, onChange: e => setCustomFunder(e.target.value), placeholder: "Enter institution name", className: "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy" })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-dark-grey mb-1", children: "Amount Requested (USD)" }), _jsx("input", { type: "number", value: amount, onChange: e => setAmount(e.target.value), placeholder: "e.g. 50000", className: "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-dark-grey mb-1", children: "Purpose of Funds" }), _jsx("textarea", { rows: 4, value: purpose, onChange: e => setPurpose(e.target.value), placeholder: "Describe specifically what you will use the funds for\u2026", className: "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy resize-none" })] }), error && _jsx("p", { className: "text-error text-sm", children: error }), _jsxs("button", { onClick: handleGenerate, disabled: generating || !profile?.isComplete, className: "w-full flex items-center justify-center gap-2 bg-amber text-navy py-3 rounded-lg font-montserrat font-bold text-sm hover:bg-amber/90 disabled:opacity-50 transition-colors", children: [_jsx(RefreshCw, { size: 16, className: generating ? 'animate-spin' : '' }), generating ? 'Generating…' : 'Generate Cover Letter'] })] }), _jsxs("div", { className: "bg-white rounded-xl border border-gray-100 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "font-montserrat font-bold text-navy", children: "Preview" }), coverLetterContent && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-success font-medium", children: [_jsx(FileText, { size: 12 }), " Ready to export"] }))] }), coverLetterContent ? (_jsx("div", { className: "text-sm text-dark-grey leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto", children: coverLetterContent })) : (_jsxs("div", { className: "flex flex-col items-center justify-center h-64 text-center", children: [_jsx(FileText, { size: 36, className: "text-navy/15 mb-3" }), _jsx("p", { className: "text-steel-grey text-sm", children: "Fill in the details and click Generate to create your cover letter." }), _jsx("p", { className: "text-steel-grey/60 text-xs mt-2", children: "Calibrated for East African banks and development finance institutions." })] }))] })] }), _jsx("div", { className: "mt-8 grid md:grid-cols-3 gap-4", children: [
                    { title: 'What to include', items: ['Business registration certificate', 'Audited financial statements', 'Business plan (generated above)', 'Collateral documentation', 'Management CVs'] },
                    { title: 'Tips for banks', items: ['Show 2+ years of cash flow projections', 'Highlight collateral clearly', 'Demonstrate repayment capacity', 'Include personal guarantee terms', 'Reference existing banking relationship'] },
                    { title: 'Tips for grants', items: ['Emphasise social/economic impact', 'Quantify beneficiaries clearly', 'Show matching funds if available', 'Align with funder\'s stated priorities', 'Include monitoring & evaluation plan'] },
                ].map(({ title, items }) => (_jsxs("div", { className: "bg-light-grey rounded-xl p-5", children: [_jsx("h3", { className: "font-montserrat font-bold text-navy text-sm mb-3", children: title }), _jsx("ul", { className: "space-y-1.5", children: items.map(item => (_jsxs("li", { className: "text-xs text-dark-grey flex items-start gap-2", children: [_jsx("span", { className: "text-amber mt-0.5", children: "\u2022" }), " ", item] }, item))) })] }, title))) })] }));
}
