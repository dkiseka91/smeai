import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { FileText, PresentationIcon, Download, Clock } from 'lucide-react';

interface Document {
  id: string;
  type: 'BUSINESS_PLAN' | 'PITCH_DECK' | 'COVER_LETTER' | 'PITCH_SCRIPT';
  status: 'DRAFT' | 'GENERATING' | 'COMPLETE' | 'ERROR';
  audience: string;
  version: number;
  wordCount: number | null;
  createdAt: string;
  updatedAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  BUSINESS_PLAN: 'Business Plan',
  PITCH_DECK: 'Pitch Deck',
  COVER_LETTER: 'Cover Letter',
  PITCH_SCRIPT: 'Pitch Script',
};

const STATUS_STYLES: Record<string, string> = {
  COMPLETE: 'bg-green-100 text-green-700',
  GENERATING: 'bg-amber/20 text-amber',
  DRAFT: 'bg-gray-100 text-gray-600',
  ERROR: 'bg-red-100 text-red-600',
};

export default function DocumentHistory() {
  const { profileId } = useParams();

  const { data: profile } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => api.get(`/profiles/${profileId}`).then(r => r.data as { name: string; documents?: Document[] }),
    enabled: !!profileId,
  });

  const documents: Document[] = (profile?.documents as Document[] | undefined) ?? [];

  const handleExport = async (docId: string, format: 'DOCX' | 'PPTX') => {
    const { data } = await api.get(`/exports/document/${docId}/${format}`);
    window.open((data as { url: string }).url, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-navy">Document History</h1>
          <p className="text-steel-grey text-sm mt-1">{profile?.name}</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/plan/${profileId}`}
            className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy/90">
            <FileText size={15} /> New Plan
          </Link>
          <Link to={`/deck/${profileId}`}
            className="flex items-center gap-2 bg-amber text-navy px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber/90">
            <PresentationIcon size={15} /> New Deck
          </Link>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-24 text-center">
          <FileText size={40} className="text-navy/20 mx-auto mb-4" />
          <p className="text-steel-grey">No documents generated yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.type === 'PITCH_DECK' ? 'bg-amber/10' : 'bg-navy/5'}`}>
                {doc.type === 'PITCH_DECK'
                  ? <PresentationIcon size={20} className="text-amber" />
                  : <FileText size={20} className="text-navy" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-navy text-sm">{TYPE_LABELS[doc.type] ?? doc.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[doc.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {doc.status}
                  </span>
                  <span className="text-xs text-steel-grey">v{doc.version}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-steel-grey">
                  <span>{doc.audience}</span>
                  {doc.wordCount && <span>{doc.wordCount.toLocaleString()} words</span>}
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {doc.status === 'COMPLETE' && (
                <div className="flex gap-2 shrink-0">
                  {doc.type !== 'PITCH_DECK' && (
                    <button onClick={() => handleExport(doc.id, 'DOCX')}
                      className="flex items-center gap-1.5 text-xs bg-navy/5 text-navy px-3 py-1.5 rounded-lg hover:bg-navy/10 font-medium">
                      <Download size={12} /> DOCX
                    </button>
                  )}
                  {doc.type === 'PITCH_DECK' && (
                    <button onClick={() => handleExport(doc.id, 'PPTX')}
                      className="flex items-center gap-1.5 text-xs bg-amber/10 text-amber px-3 py-1.5 rounded-lg hover:bg-amber/20 font-medium">
                      <Download size={12} /> PPTX
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
