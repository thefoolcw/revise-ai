'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Textarea, Alert, Select } from '@/components/ui/primitives';
import { ModelSelect } from './ModelSelect';
import { renderMarkdown } from '@/lib/markdown';
import { useToast } from './Toaster';

const MODES: [string, string][] = [
  ['EXPLAIN', 'Explain'], ['TEACH_FROM_BASICS', 'Teach from basics'], ['STEP_BY_STEP', 'Step-by-step'],
  ['HINT', 'Hint only'], ['PRACTICE', 'Practice'], ['CHECK', 'Check my answer'], ['MARK', 'Mark my answer'],
  ['MAKE_FLASHCARDS', 'Make flashcards'], ['CREATE_QUIZ', 'Create quiz'], ['SUMMARISE', 'Summarize'],
  ['COMPARE', 'Compare'], ['MEMORISE', 'Memorize'], ['EXAM_MODE', 'Exam mode'], ['CODING_HELP', 'Coding help'],
  ['PROBLEM_SOLVING', 'Problem-solving'], ['REVISION_PLAN', 'Revision plan']
];

type Msg = { role: 'user' | 'assistant'; content: string; model?: string; error?: string };

export function TutorChat() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const [conversationId, setConversationId] = useState<string | null>(params.get('c'));
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('EXPLAIN');
  const [modelId, setModelId] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!conversationId) return;
    let live = true;
    (async () => {
      try {
        const res = await fetch(`/api/tutor?conversationId=${encodeURIComponent(conversationId)}`, { credentials: 'same-origin' });
        const json = await res.json();
        if (!live || !json?.ok) return;
        setMessages((json.data.messages ?? []).map((m: Msg) => ({ role: m.role, content: m.content })));
      } catch { /* a missing conversation simply starts a new one */ }
    })();
    return () => { live = false; };
  }, [conversationId]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(async (text: string) => {
    const message = text.trim();
    if (!message || streaming) return;
    setFailure(null);
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setStreaming(true);

    const ac = new AbortController();
    abortRef.current = ac;
    setMessages((m) => [...m, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ conversationId, message, mode, ...(modelId ? { modelId } : {}) }),
        signal: ac.signal
      });

      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => null);
        const msg = j?.error?.message ?? 'The tutor could not be reached.';
        setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: 'assistant', content: '', error: msg }; return c; });
        setFailure(j?.error?.code === 'USAGE_LIMIT' ? msg : null);
        if (j?.error?.code === 'USAGE_LIMIT') toast.push(msg, 'warning');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let model = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() ?? '';
        for (const part of parts) {
          const ev = /^event: (.+)$/m.exec(part)?.[1];
          const dataRaw = /^data: (.*)$/m.exec(part)?.[1];
          if (!dataRaw) continue;
          let data: { text?: string; model?: string; conversationId?: string; message?: string } = {};
          try { data = JSON.parse(dataRaw); } catch { continue; }
          if (ev === 'start' && data.conversationId) {
            setConversationId(data.conversationId);
            router.replace(`/app/tutor?c=${data.conversationId}`, { scroll: false });
          }
          if (ev === 'model' && data.model) model = data.model;
          if (ev === 'delta' && data.text) {
            setMessages((m) => { const c = [...m]; const last = c[c.length - 1]!; c[c.length - 1] = { ...last, content: last.content + data.text, model }; return c; });
          }
          if (ev === 'error') {
            setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: 'assistant', content: '', error: data.message ?? 'The model did not respond.' }; return c; });
          }
        }
      }
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') {
        setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: 'assistant', content: '', error: 'The connection dropped. Your question was not lost.' }; return c; });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [conversationId, mode, modelId, streaming, router, toast]);

  const stop = () => abortRef.current?.abort();

  const quickPrompts = [
    'Explain this topic from the basics',
    'Give me a hint, not the answer',
    'Make 5 flashcards on this',
    'Set me an exam-style question'
  ];

  return (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateRows: 'auto 1fr auto', minHeight: 'calc(100dvh - 14rem)' }}>
      <header className="row spread wrap gap-2">
        <div>
          <h1 className="h2">AI Tutor</h1>
          <p className="muted" style={{ fontSize: '.86rem', marginTop: '.2rem' }}>
            Sixteen teaching modes. The tutor says when it is unsure rather than inventing requirements.
          </p>
        </div>
        <div style={{ minWidth: 220 }}>
          <ModelSelect task="CHAT" value={modelId} onChange={setModelId} />
        </div>
      </header>

      {failure && <Alert tone="warning" title="Daily limit reached">{failure}</Alert>}

      {/* Mode chips */}
      <div style={{ display: 'flex', gap: '.4rem', overflowX: 'auto', paddingBottom: '.35rem' }}>
        {MODES.map(([id, label]) => (
          <button key={id} className="mode-chip" aria-pressed={mode === id} onClick={() => setMode(id)}>{label}</button>
        ))}
      </div>

      {/* Transcript */}
      <div ref={scrollerRef} className="chat-scroll card" style={{ overflowY: 'auto', padding: '1rem', display: 'grid', gap: '.8rem', alignContent: 'start', maxHeight: '58vh' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <p className="h3" style={{ marginBottom: '.5rem' }}>Ask anything</p>
            <p className="muted" style={{ fontSize: '.88rem', maxWidth: 420, marginInline: 'auto' }}>
              Pick a mode above, then ask. Your answers adapt to the level, board and subject set on your profile.
            </p>
            <div className="row gap-2 wrap" style={{ justifyContent: 'center', marginTop: '1.25rem' }}>
              {quickPrompts.map((q) => (
                <button key={q} className="mode-chip" onClick={() => void send(q)} disabled={streaming}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const isLast = i === messages.length - 1;
          const live = isLast && streaming;
          return (
            <div key={i} className={m.role === 'user' ? 'msg msg-user' : 'msg msg-ai'}
              style={{ padding: '.85rem 1rem', borderRadius: 12, maxWidth: '92%', justifySelf: m.role === 'user' ? 'end' : 'start' }}>
              {m.error ? (
                <p style={{ color: 'var(--danger)', fontSize: '.88rem' }}>{m.error}</p>
              ) : m.role === 'assistant' ? (
                <div className="prose-ai" style={{ fontSize: '.9rem' }} dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
              ) : (
                <p style={{ fontSize: '.9rem', whiteSpace: 'pre-wrap' }}>{m.content}</p>
              )}
              {live && !m.error && (
                m.content
                  ? <span className="stream-cursor" aria-hidden="true" />
                  : <span className="row gap-1" aria-label="Thinking" style={{ padding: '.2rem 0' }}>
                      <span className="thinking-dot" /><span className="thinking-dot" /><span className="thinking-dot" />
                    </span>
              )}
              {!live && m.role === 'assistant' && m.model && (
                <p className="faint" style={{ fontSize: '.7rem', marginTop: '.5rem' }}>{m.model}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); void send(input); }}
        className="card" style={{ padding: '.8rem', display: 'grid', gap: '.6rem' }}
      >
        <Textarea
          label="" name="message" value={input} rows={3} maxLength={20000}
          placeholder={mode === 'HINT' ? 'Paste the problem and ask for a hint…' : 'Ask a question…'}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void send(input); } }}
        />
        <div className="row spread wrap gap-2">
          <p className="faint" style={{ fontSize: '.74rem' }}>⌘/Ctrl + Enter to send. AI output can be wrong — verify important facts.</p>
          <div className="row gap-2">
            {streaming && <Button type="button" variant="outline" onClick={stop}>Stop</Button>}
            <Button type="submit" disabled={streaming || !input.trim()}>{streaming ? 'Answering…' : 'Send'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
