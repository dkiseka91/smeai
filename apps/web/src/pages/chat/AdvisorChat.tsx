import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, getApiBase } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { Send } from 'lucide-react';
import { PLAN_LIMITS } from '@sme-pitch-ai/shared';

const SUGGESTED = [
  'What are the biggest risks to my business?',
  'How should I price my product for the Ugandan market?',
  'What metrics should I track in my first 6 months?',
  'How do I find my first 100 customers?',
  'What should I include in my pitch to a Ugandan bank?',
  'How do I calculate my break-even point?',
];

interface Message { role: 'user' | 'assistant'; content: string; }

export default function AdvisorChat() {
  const { profileId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const planTier = (user?.planTier ?? 'FREE') as keyof typeof PLAN_LIMITS;
  const chatLimit = PLAN_LIMITS[planTier].chatQueries;
  const queriesRemaining = chatLimit === -1 ? null : Math.max(0, chatLimit - queryCount);

  const { data: profile } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => api.get(`/profiles/${profileId}`).then(r => r.data),
    enabled: !!profileId,
  });

  useEffect(() => {
    if (!profileId) return;
    api.get(`/chat/${profileId}/history`).then(({ data }) => {
      if (Array.isArray(data)) setMessages(data as Message[]);
    });
  }, [profileId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setStreaming(true);
    setMessages(m => [...m, { role: 'assistant', content: '' }]);

    const resp = await fetch(`${getApiBase()}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAuthStore.getState().accessToken ?? ''}` },
      body: JSON.stringify({ profileId, message: text }),
    });

    if (!resp.body) { setStreaming(false); return; }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        const data = JSON.parse(line.slice(6)) as { type: string; text?: string };
        if (data.type === 'chunk' && data.text) {
          setMessages(m => { const updated = [...m]; updated[updated.length - 1] = { role: 'assistant', content: (updated[updated.length - 1]?.content ?? '') + data.text }; return updated; });
        }
        if (data.type === 'complete') { setQueryCount(c => c + 1); }
      }
    }
    setStreaming(false);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-navy">AI Business Advisor</h1>
          <p className="text-steel-grey text-sm">{profile?.name}</p>
        </div>
        {queriesRemaining !== null && (
          <span className="text-sm font-medium text-steel-grey bg-light-grey px-3 py-1.5 rounded-full">
            {queriesRemaining} / {chatLimit} queries remaining
          </span>
        )}
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-amber font-montserrat font-bold text-xl">AI</span>
            </div>
            <h3 className="font-montserrat font-bold text-navy mb-2">Your AI Business Advisor</h3>
            <p className="text-steel-grey text-sm mb-8 max-w-sm mx-auto">Ask me anything about your business — strategy, pricing, funding, operations, or growth.</p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => sendMessage(s)} className="text-left p-3 rounded-lg border border-gray-200 text-xs text-dark-grey hover:border-amber/50 hover:bg-amber/5 transition-colors">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-amber text-navy font-medium rounded-br-sm' : 'bg-light-grey text-dark-grey rounded-bl-sm'}`}>
              {m.content || (streaming && i === messages.length - 1 ? <span className="animate-pulse">…</span> : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="mt-4 flex gap-3">
        <input value={input} onChange={e => setInput(e.target.value)} disabled={streaming || queriesRemaining === 0}
          placeholder={queriesRemaining === 0 ? 'Upgrade to continue chatting' : 'Ask your AI advisor anything…'}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-navy disabled:opacity-50 disabled:bg-light-grey" />
        <button type="submit" disabled={streaming || !input.trim() || queriesRemaining === 0}
          className="bg-navy text-white px-5 py-3 rounded-xl hover:bg-navy/90 disabled:opacity-50 transition-colors" aria-label="Send">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
