import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { FileText, PresentationIcon, Download, Clock } from 'lucide-react';
const TYPE_LABELS = {
    BUSINESS_PLAN: 'Business Plan',
    PITCH_DECK: 'Pitch Deck',
    COVER_LETTER: 'Cover Letter',
    PITCH_SCRIPT: 'Pitch Script',
};
const STATUS_STYLES = {
    COMPLETE: 'bg-green-100 text-green-700',
    GENERATING: 'bg-amber/20 text-amber',
    DRAFT: 'bg-gray-100 text-gray-600',
    ERROR: 'bg-red-100 text-red-600',
};
export default function DocumentHistory() {
    const { profileId } = useParams();
    const { data: profile } = useQuery({
        queryKey: ['profile', profileId],
        queryFn: () => api.get(`/profiles/${profileId}`).then(r => r.data),
        enabled: !!profileId,
    });
    const documents = profile?.documents ?? [];
    const handleExport = async (docId, format) => {
        const { data } = await api.get(`/exports/document/${docId}/${format}`);
        window.open(data.url, '_blank');
    };
    return (_jsxs("div", { className: "max-w-5xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-montserrat font-bold text-2xl text-navy", children: "Document History" }), _jsx("p", { className: "text-steel-grey text-sm mt-1", children: profile?.name })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Link, { to: `/plan/${profileId}`, className: "flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy/90", children: [_jsx(FileText, { size: 15 }), " New Plan"] }), _jsxs(Link, { to: `/deck/${profileId}`, className: "flex items-center gap-2 bg-amber text-navy px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber/90", children: [_jsx(PresentationIcon, { size: 15 }), " New Deck"] })] })] }), documents.length === 0 ? (_jsxs("div", { className: "bg-white rounded-2xl border-2 border-dashed border-gray-200 py-24 text-center", children: [_jsx(FileText, { size: 40, className: "text-navy/20 mx-auto mb-4" }), _jsx("p", { className: "text-steel-grey", children: "No documents generated yet." })] })) : (_jsx("div", { className: "space-y-3", children: documents.map(doc => (_jsxs("div", { className: "bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4", children: [_jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center ${doc.type === 'PITCH_DECK' ? 'bg-amber/10' : 'bg-navy/5'}`, children: doc.type === 'PITCH_DECK'
                                ? _jsx(PresentationIcon, { size: 20, className: "text-amber" })
                                : _jsx(FileText, { size: 20, className: "text-navy" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-semibold text-navy text-sm", children: TYPE_LABELS[doc.type] ?? doc.type }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[doc.status] ?? 'bg-gray-100 text-gray-600'}`, children: doc.status }), _jsxs("span", { className: "text-xs text-steel-grey", children: ["v", doc.version] })] }), _jsxs("div", { className: "flex items-center gap-3 mt-0.5 text-xs text-steel-grey", children: [_jsx("span", { children: doc.audience }), doc.wordCount && _jsxs("span", { children: [doc.wordCount.toLocaleString(), " words"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { size: 10 }), " ", new Date(doc.updatedAt).toLocaleDateString()] })] })] }), doc.status === 'COMPLETE' && (_jsxs("div", { className: "flex gap-2 shrink-0", children: [doc.type !== 'PITCH_DECK' && (_jsxs("button", { onClick: () => handleExport(doc.id, 'DOCX'), className: "flex items-center gap-1.5 text-xs bg-navy/5 text-navy px-3 py-1.5 rounded-lg hover:bg-navy/10 font-medium", children: [_jsx(Download, { size: 12 }), " DOCX"] })), doc.type === 'PITCH_DECK' && (_jsxs("button", { onClick: () => handleExport(doc.id, 'PPTX'), className: "flex items-center gap-1.5 text-xs bg-amber/10 text-amber px-3 py-1.5 rounded-lg hover:bg-amber/20 font-medium", children: [_jsx(Download, { size: 12 }), " PPTX"] }))] }))] }, doc.id))) }))] }));
}
