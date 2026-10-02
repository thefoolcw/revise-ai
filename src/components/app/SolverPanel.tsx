'use client';

import { useState } from 'react';
import { Button, Textarea, Input, Alert, Select } from '@/components/ui/primitives';
import { ModelSelect } from './ModelSelect';
import { renderMarkdown } from '@/lib/markdown';
import { post, ApiRequestError } from '@/lib/client';

type SolveResult = {
  questionId: string; answer: string; modelUsed: string;
  fallbackUsed: boolean; fallbackNotice: string | null;
  arithmeticCheck: { expression: string; value: number } | null;
};

export function SolverPanel() {
  const [question, setQuestion] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [modelId, setModelId] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [error, setError] = useState<{ title: string; body: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageNote, setImageNote] = useState<string | null>(null);

  const onFile = async (f: File | null) => {
    setFile(f);
    setImageNote(null);
    if (!f) return;
    if (!f.type.startsWith('image/')) { setImageNote('Only image files can be attached here.'); setFile(null); return; }
    // The question text is transcribed by the learner; we never claim OCR we have not performed.
    setImageNote('Image attached. Vision models are selected by the router only when the registry confirms a VISION-capable model is enabled — otherwise type the question in.');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const r = await post<SolveResult>('/api/solve', {
        question, ...(topicTitle ? { topicTitle } : {}), ...(modelId ? { modelId } : {})
      });
      setResult(r);
    } catch (ex) {
      const err = ex instanceof ApiRequestError ? ex : null;
      setResult(null);
      setError({
        title: err?.code === 'USAGE_LIMIT' ? 'Daily AI limit reached' : 'Could not solve that question',
        body: err?.message ?? 'Something went wrong. Please try again.'
      });
    } finally { setBusy(false); }
  };

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Solve a question</h1>
        <p className="muted" style={{ fontSize: '.88rem', marginTop: '.25rem' }}>
          Type or paste a question from any subject. Answers are structured: question, method, worked steps,
          answer, check, common mistake, exam tip and a practice question.
        </p>
      </header>

      <form onSubmit={submit} className="card card-pad stack gap-3">
        <Textarea label="Question" name="question" required minLength={3} maxLength={20000} rows={6}
          value={question} onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. A 1.5 kg ball is dropped from 12 m. Ignoring air resistance, find its speed on impact. Take g = 9.81 m/s²." />

        <div style={{ display: 'grid', gap: '.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <Input label="Topic (optional)" name="topicTitle" maxLength={160} value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)} placeholder="e.g. Energy transfers" />
          <div><ModelSelect task="SOLVE_MATHS" value={modelId} onChange={setModelId} /></div>
        </div>

        <div className="dropzone" data-over="false" onClick={() => document.getElementById('solve-image')?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('solve-image')?.click(); }}
          role="button" tabIndex={0} aria-label="Attach an image of the question">
          <input id="solve-image" type="file" accept="image/*" style={{ display: 'none' }}
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)} />
          <p style={{ fontSize: '.88rem' }}>{file ? file.name : 'Attach an image of the question (optional)'}</p>
          <p className="faint" style={{ fontSize: '.76rem', marginTop: '.3rem' }}>PNG, JPG or WebP, up to 10 MB.</p>
        </div>
        {imageNote && <p className="faint" style={{ fontSize: '.76rem' }}>{imageNote}</p>}

        <div className="row spread wrap gap-2">
          <p className="faint" style={{ fontSize: '.74rem' }}>Arithmetic is checked by a calculator, not by the model.</p>
          <Button type="submit" loading={busy} disabled={!question.trim()}>Solve</Button>
        </div>
      </form>

      {error && <Alert tone={error.title.includes('limit') ? 'warning' : 'danger'} title={error.title}>{error.body}</Alert>}

      {result && (
        <div className="card card-pad anim-fade-up">
          <div className="row spread wrap gap-2" style={{ marginBottom: '.8rem' }}>
            <h2 className="h3">Worked solution</h2>
            <span className="chip">{result.modelUsed}</span>
          </div>
          {result.arithmeticCheck && (
            <Alert tone="info" title="Calculator check">
              <code className="tnum">{result.arithmeticCheck.expression} = {result.arithmeticCheck.value}</code>
              <p style={{ fontSize: '.82rem', marginTop: '.35rem' }}>
                This value was computed deterministically and supplied to the model, so the arithmetic in the
                working should match it exactly.
              </p>
            </Alert>
          )}
          <div className="prose-ai" style={{ marginTop: '.9rem' }} dangerouslySetInnerHTML={{ __html: renderMarkdown(result.answer) }} />
          {result.fallbackUsed && result.fallbackNotice && (
            <p className="faint" style={{ fontSize: '.76rem', marginTop: '1rem' }}>Note: {result.fallbackNotice}</p>
          )}
        </div>
      )}
    </div>
  );
}
