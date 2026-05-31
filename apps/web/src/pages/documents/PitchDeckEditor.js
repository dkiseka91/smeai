import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Download, RefreshCw, Plus, Trash2 } from 'lucide-react';
const FRAMEWORKS = ['INVESTOR', 'BANK', 'GRANT', 'ACCELERATOR', 'COMPETITION', 'GENERAL'];
export default function PitchDeckEditor() {
    const { profileId } = useParams();
    const [framework, setFramework] = useState('INVESTOR');
    const [deck, setDeck] = useState(null);
    const [activeSlide, setActiveSlide] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [documentId, setDocumentId] = useState(null);
    const { data: profile } = useQuery({
        queryKey: ['profile', profileId],
        queryFn: () => api.get(`/profiles/${profileId}`).then(r => r.data),
        enabled: !!profileId,
    });
    const generate = async () => {
        setIsGenerating(true);
        try {
            const { data } = await api.post('/documents/deck/generate', { profileId, framework });
            setDeck(data.content);
            setDocumentId(data.document.id);
            setActiveSlide(0);
        }
        finally {
            setIsGenerating(false);
        }
    };
    const exportDeck = async () => {
        if (!documentId)
            return;
        const { data } = await api.get(`/exports/document/${documentId}/PPTX`);
        window.open(data.url, '_blank');
    };
    const slide = deck?.slides[activeSlide];
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-montserrat font-bold text-2xl text-navy", children: "Pitch Deck" }), _jsx("p", { className: "text-steel-grey text-sm", children: profile?.name })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("select", { value: framework, onChange: e => setFramework(e.target.value), className: "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy", children: FRAMEWORKS.map(f => _jsx("option", { value: f, children: f }, f)) }), _jsxs("button", { onClick: generate, disabled: isGenerating || !profile?.isComplete, className: "flex items-center gap-2 bg-amber text-navy px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber/90 disabled:opacity-50", children: [_jsx(RefreshCw, { size: 16, className: isGenerating ? 'animate-spin' : '' }), isGenerating ? 'Generating…' : 'Generate Deck'] }), documentId && (_jsxs("button", { onClick: exportDeck, className: "flex items-center gap-1.5 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy/90", children: [_jsx(Download, { size: 16 }), " PPTX"] }))] })] }), !deck ? (_jsx("div", { className: "bg-white rounded-2xl border-2 border-dashed border-gray-200 py-24 text-center", children: _jsx("p", { className: "text-steel-grey", children: "Generate your pitch deck to start editing slides" }) })) : (_jsxs("div", { className: "flex gap-6", children: [_jsx("div", { className: "w-48 shrink-0 space-y-2 max-h-[70vh] overflow-y-auto", children: deck.slides.map((s, i) => (_jsxs("button", { onClick: () => setActiveSlide(i), className: `w-full p-3 rounded-lg text-left border-2 transition-all ${i === activeSlide ? 'border-amber bg-amber/5' : 'border-transparent bg-white hover:border-gray-200'}`, children: [_jsx("div", { className: "bg-navy rounded w-full h-16 flex items-center justify-center mb-1", children: _jsx("span", { className: "text-white text-xs font-bold", children: s.slideNumber }) }), _jsx("p", { className: "text-xs text-dark-grey font-medium truncate", children: s.headline || s.title }), _jsx("p", { className: "text-xs text-steel-grey", children: s.type })] }, s.id))) }), slide && (_jsxs("div", { className: "flex-1 bg-white rounded-xl border border-gray-100 p-6", children: [_jsxs("div", { className: "bg-navy rounded-xl p-6 mb-6 aspect-video flex flex-col justify-between", children: [_jsx("div", { className: "border-b border-amber/50 pb-3 mb-3", children: _jsx("h2", { className: "font-montserrat font-bold text-white text-xl", children: slide.headline }) }), _jsx("ul", { className: "space-y-2", children: slide.bodyPoints.slice(0, 5).map((p, i) => (_jsxs("li", { className: "flex items-start gap-2 text-white/80 text-sm", children: [_jsx("span", { className: "text-amber mt-0.5", children: "\u2022" }), p] }, i))) }), _jsxs("div", { className: "flex justify-between items-end mt-4", children: [_jsx("span", { className: "text-white/30 text-xs", children: slide.type }), _jsx("span", { className: "text-white/30 text-xs", children: slide.slideNumber })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-dark-grey mb-1", children: "Headline" }), _jsx("input", { value: slide.headline, onChange: e => {
                                                    const updated = [...deck.slides];
                                                    updated[activeSlide] = { ...updated[activeSlide], headline: e.target.value };
                                                    setDeck({ ...deck, slides: updated });
                                                }, className: "w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-navy" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-dark-grey mb-1", children: "Bullet Points" }), slide.bodyPoints.map((pt, i) => (_jsxs("div", { className: "flex gap-2 mb-2", children: [_jsx("input", { value: pt, onChange: e => {
                                                            const updated = [...deck.slides];
                                                            const points = [...updated[activeSlide].bodyPoints];
                                                            points[i] = e.target.value;
                                                            updated[activeSlide] = { ...updated[activeSlide], bodyPoints: points };
                                                            setDeck({ ...deck, slides: updated });
                                                        }, className: "flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy" }), _jsx("button", { onClick: () => {
                                                            const updated = [...deck.slides];
                                                            updated[activeSlide] = { ...updated[activeSlide], bodyPoints: slide.bodyPoints.filter((_, j) => j !== i) };
                                                            setDeck({ ...deck, slides: updated });
                                                        }, className: "text-steel-grey hover:text-error p-2", children: _jsx(Trash2, { size: 14 }) })] }, i))), _jsxs("button", { onClick: () => {
                                                    const updated = [...deck.slides];
                                                    updated[activeSlide] = { ...updated[activeSlide], bodyPoints: [...slide.bodyPoints, ''] };
                                                    setDeck({ ...deck, slides: updated });
                                                }, className: "flex items-center gap-1 text-sm text-navy hover:underline", children: [_jsx(Plus, { size: 14 }), " Add point"] })] }), slide.speakerNotes !== undefined && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-dark-grey mb-1", children: "Speaker Notes" }), _jsx("textarea", { rows: 3, value: slide.speakerNotes ?? '', onChange: e => {
                                                    const updated = [...deck.slides];
                                                    updated[activeSlide] = { ...updated[activeSlide], speakerNotes: e.target.value };
                                                    setDeck({ ...deck, slides: updated });
                                                }, className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy resize-none" })] }))] })] }))] }))] }));
}
