import { useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
export function useDocumentGeneration() {
    const [state, setState] = useState({
        sections: {},
        currentSection: null,
        isGenerating: false,
        progress: 0,
        documentId: null,
        error: null,
    });
    const generate = useCallback(async (profileId, audience) => {
        setState(s => ({ ...s, isGenerating: true, sections: {}, progress: 0, error: null, documentId: null }));
        const token = useAuthStore.getState().accessToken ?? '';
        const resp = await fetch('/api/documents/plan/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ profileId, audience }),
        });
        if (!resp.ok) {
            const body = await resp.json().catch(() => ({}));
            setState(s => ({ ...s, isGenerating: false, error: body?.error?.message ?? 'Generation failed' }));
            return;
        }
        if (!resp.body) {
            setState(s => ({ ...s, isGenerating: false, error: 'No response body' }));
            return;
        }
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '));
                for (const line of lines) {
                    const data = JSON.parse(line.slice(6));
                    if (data.type === 'section_start') {
                        setState(s => ({ ...s, currentSection: data.sectionId ?? null }));
                    }
                    if (data.type === 'section_complete' && data.sectionId && data.content !== undefined) {
                        setState(s => ({
                            ...s,
                            sections: { ...s.sections, [data.sectionId]: data.content },
                            currentSection: data.sectionId ?? null,
                            progress: data.progress ?? s.progress,
                        }));
                    }
                    if (data.type === 'complete') {
                        setState(s => ({ ...s, isGenerating: false, progress: 100, documentId: data.documentId ?? null }));
                    }
                    if (data.type === 'error') {
                        setState(s => ({ ...s, isGenerating: false, error: data.message ?? 'Generation error' }));
                    }
                }
            }
        }
        catch (err) {
            setState(s => ({ ...s, isGenerating: false, error: String(err) }));
        }
    }, []);
    const reset = useCallback(() => {
        setState({ sections: {}, currentSection: null, isGenerating: false, progress: 0, documentId: null, error: null });
    }, []);
    return { ...state, generate, reset };
}
