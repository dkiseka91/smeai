import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Download, RefreshCw, Plus, Trash2, Save } from 'lucide-react';

const FRAMEWORKS = ['INVESTOR', 'BANK', 'GRANT', 'ACCELERATOR', 'COMPETITION', 'GENERAL'] as const;

interface Slide { id: string; slideNumber: number; title: string; type: string; headline: string; bodyPoints: string[]; speakerNotes?: string; }
interface DeckContent { framework: string; slides: Slide[]; pitchScript?: string; }

export default function PitchDeckEditor() {
  const { profileId } = useParams();
  const [framework, setFramework] = useState<typeof FRAMEWORKS[number]>('INVESTOR');
  const [deck, setDeck] = useState<DeckContent | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => api.get(`/profiles/${profileId}`).then(r => r.data),
    enabled: !!profileId,
  });

  const generate = async () => {
    setIsGenerating(true);
    try {
      const { data } = await api.post('/documents/deck/generate', { profileId, framework });
      setDeck(data.content as DeckContent);
      setDocumentId(data.document.id as string);
      setActiveSlide(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDeck = async () => {
    if (!documentId || !deck) return;
    setIsSaving(true);
    try {
      await api.put(`/documents/${documentId}`, { content: deck });
    } finally {
      setIsSaving(false);
    }
  };

  const exportDeck = async () => {
    if (!documentId) return;
    const { data } = await api.get(`/exports/document/${documentId}/PPTX`);
    window.open(data.url, '_blank');
  };

  const slide = deck?.slides[activeSlide];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-navy">Pitch Deck</h1>
          <p className="text-steel-grey text-sm">{profile?.name}</p>
        </div>
        <div className="flex gap-3">
          <select value={framework} onChange={e => setFramework(e.target.value as typeof FRAMEWORKS[number])}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy">
            {FRAMEWORKS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <button onClick={generate} disabled={isGenerating || !profile?.isComplete}
            className="flex items-center gap-2 bg-amber text-navy px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber/90 disabled:opacity-50">
            <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'Generating…' : 'Generate Deck'}
          </button>
          {documentId && (
            <button onClick={saveDeck} disabled={isSaving}
              className="flex items-center gap-1.5 bg-white border border-gray-200 text-navy px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
              <Save size={16} className={isSaving ? 'animate-spin' : ''} />
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          )}
          {documentId && (
            <button onClick={exportDeck} className="flex items-center gap-1.5 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy/90">
              <Download size={16} /> PPTX
            </button>
          )}
        </div>
      </div>

      {!deck ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-24 text-center">
          <p className="text-steel-grey">Generate your pitch deck to start editing slides</p>
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="w-48 shrink-0 space-y-2 max-h-[70vh] overflow-y-auto">
            {deck.slides.map((s, i) => (
              <button key={s.id} onClick={() => setActiveSlide(i)}
                className={`w-full p-3 rounded-lg text-left border-2 transition-all ${i === activeSlide ? 'border-amber bg-amber/5' : 'border-transparent bg-white hover:border-gray-200'}`}>
                <div className="bg-navy rounded w-full h-16 flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">{s.slideNumber}</span>
                </div>
                <p className="text-xs text-dark-grey font-medium truncate">{s.headline || s.title}</p>
                <p className="text-xs text-steel-grey">{s.type}</p>
              </button>
            ))}
          </div>

          {slide && (
            <div className="flex-1 bg-white rounded-xl border border-gray-100 p-6">
              <div className="bg-navy rounded-xl p-6 mb-6 aspect-video flex flex-col justify-between">
                <div className="border-b border-amber/50 pb-3 mb-3">
                  <h2 className="font-montserrat font-bold text-white text-xl">{slide.headline}</h2>
                </div>
                <ul className="space-y-2">
                  {slide.bodyPoints.slice(0, 5).map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                      <span className="text-amber mt-0.5">•</span>{p}
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-white/30 text-xs">{slide.type}</span>
                  <span className="text-white/30 text-xs">{slide.slideNumber}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-1">Headline</label>
                  <input value={slide.headline} onChange={e => {
                    const updated = [...deck.slides];
                    updated[activeSlide] = { ...updated[activeSlide], headline: e.target.value };
                    setDeck({ ...deck, slides: updated });
                  }} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-navy" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-grey mb-1">Bullet Points</label>
                  {slide.bodyPoints.map((pt, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={pt} onChange={e => {
                        const updated = [...deck.slides];
                        const points = [...updated[activeSlide].bodyPoints];
                        points[i] = e.target.value;
                        updated[activeSlide] = { ...updated[activeSlide], bodyPoints: points };
                        setDeck({ ...deck, slides: updated });
                      }} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy" />
                      <button onClick={() => {
                        const updated = [...deck.slides];
                        updated[activeSlide] = { ...updated[activeSlide], bodyPoints: slide.bodyPoints.filter((_, j) => j !== i) };
                        setDeck({ ...deck, slides: updated });
                      }} className="text-steel-grey hover:text-error p-2"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const updated = [...deck.slides];
                    updated[activeSlide] = { ...updated[activeSlide], bodyPoints: [...slide.bodyPoints, ''] };
                    setDeck({ ...deck, slides: updated });
                  }} className="flex items-center gap-1 text-sm text-navy hover:underline"><Plus size={14} /> Add point</button>
                </div>
                {slide.speakerNotes !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-dark-grey mb-1">Speaker Notes</label>
                    <textarea rows={3} value={slide.speakerNotes ?? ''} onChange={e => {
                      const updated = [...deck.slides];
                      updated[activeSlide] = { ...updated[activeSlide], speakerNotes: e.target.value };
                      setDeck({ ...deck, slides: updated });
                    }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy resize-none" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
