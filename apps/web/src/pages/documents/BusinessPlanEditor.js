import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Download, RefreshCw } from 'lucide-react';
const SECTIONS = [
    { id: 'executive_summary', title: 'Executive Summary' },
    { id: 'company_overview', title: 'Company Overview' },
    { id: 'market_analysis', title: 'Market Analysis' },
    { id: 'products_services', title: 'Products & Services' },
    { id: 'marketing_strategy', title: 'Marketing Strategy' },
    { id: 'operations_plan', title: 'Operations Plan' },
    { id: 'management_team', title: 'Management Team' },
    { id: 'financial_projections', title: 'Financial Projections' },
    { id: 'funding_request', title: 'Funding Request' },
    { id: 'appendix', title: 'Appendix' },
];
const AUDIENCES = ['BANK', 'INVESTOR', 'GRANT', 'ACCELERATOR'];
export default function BusinessPlanEditor() {
    const { profileId } = useParams();
    const [audience, setAudience] = useState('INVESTOR');
    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
    const [sections, setSections] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentSection, setCurrentSection] = useState('');
    const [documentId, setDocumentId] = useState(null);
    const { data: profile } = useQuery({
        queryKey: ['profile', profileId],
        queryFn: () => api.get(`/profiles/${profileId}`).then(r => r.data),
        enabled: !!profileId,
    });
    const generate = async () => {
        setIsGenerating(true);
        setSections({});
        setProgress(0);
        const resp = await fetch('/api/documents/plan/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` },
            body: JSON.stringify({ profileId, audience }),
        });
        if (!resp.body)
            return;
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '));
            for (const line of lines) {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'section_complete' && data.sectionId && data.content) {
                    setSections(prev => ({ ...prev, [data.sectionId]: data.content }));
                    setCurrentSection(data.sectionId);
                    setProgress(data.progress ?? 0);
                }
                if (data.type === 'complete') {
                    setIsGenerating(false);
                    setDocumentId(data.documentId ?? null);
                }
            }
        }
    };
    const exportDoc = async (format) => {
        if (!documentId)
            return;
        const { data } = await api.get(`/exports/document/${documentId}/${format}`);
        window.open(data.url, '_blank');
    };
    const activeContent = sections[activeSection] ?? '';
    const activeSectionData = SECTIONS.find(s => s.id === activeSection);
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-montserrat font-bold text-2xl text-navy", children: "Business Plan" }), _jsx("p", { className: "text-steel-grey text-sm", children: profile?.name })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold", children: AUDIENCES.map(a => (_jsx("button", { onClick: () => setAudience(a), className: `px-4 py-2 transition-colors ${audience === a ? 'bg-navy text-white' : 'text-steel-grey hover:bg-light-grey'}`, children: a }, a))) }), _jsxs("button", { onClick: generate, disabled: isGenerating || !profile?.isComplete, className: "flex items-center gap-2 bg-amber text-navy px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber/90 disabled:opacity-50", children: [_jsx(RefreshCw, { size: 16, className: isGenerating ? 'animate-spin' : '' }), isGenerating ? `Generating… ${progress}%` : 'Generate Plan'] }), documentId && (_jsxs("button", { onClick: () => exportDoc('DOCX'), className: "flex items-center gap-1.5 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy/90", children: [_jsx(Download, { size: 16 }), " DOCX"] }))] })] }), isGenerating && (_jsxs("div", { className: "bg-white rounded-xl p-4 mb-6 border border-amber/20", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-amber border-t-transparent rounded-full animate-spin" }), _jsxs("span", { className: "text-sm font-medium text-navy", children: ["Writing ", SECTIONS.find(s => s.id === currentSection)?.title ?? '…'] })] }), _jsx("div", { className: "h-2 bg-gray-100 rounded-full", children: _jsx("div", { className: "h-2 bg-amber rounded-full transition-all", style: { width: `${progress}%` } }) })] })), _jsxs("div", { className: "flex gap-6", children: [_jsx("aside", { className: "w-56 shrink-0 space-y-1", children: SECTIONS.map(s => (_jsxs("button", { onClick: () => setActiveSection(s.id), className: `w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${activeSection === s.id ? 'bg-navy text-white font-semibold' : 'text-dark-grey hover:bg-light-grey'}`, children: [_jsx("span", { children: s.title }), sections[s.id] && _jsx("span", { className: "w-2 h-2 rounded-full bg-success shrink-0" })] }, s.id))) }), _jsxs("div", { className: "flex-1 bg-white rounded-xl border border-gray-100 p-6 min-h-96", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "font-montserrat font-bold text-navy", children: activeSectionData?.title }), sections[activeSection] && (_jsxs("span", { className: "text-xs text-steel-grey", children: [sections[activeSection].split(/\s+/).length, " words"] }))] }), activeContent ? (_jsx("div", { className: "text-dark-grey text-sm leading-relaxed whitespace-pre-wrap", children: activeContent })) : (_jsx("div", { className: "text-steel-grey text-sm text-center py-16", children: isGenerating ? 'Generating this section…' : 'Generate your plan to see content here' }))] })] })] }));
}
