'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Input, Select, Alert, ProgressBar } from '@/components/ui/primitives';
import { get, post, ApiRequestError } from '@/lib/client';

type Option = { id: string; label: string };
type Q = { id: string; type: string; prompt: string; options: Option[] | null; difficulty: string; topicTitle: string | null };
type Review = { id: string; prompt: string; correct: boolean; given: unknown; expected: unknown; explanation: string | null; topicTitle: string | null };
type Result = { score: number; total: number; accuracyPercent: number | null; review: Review[]; weakTopics: string[] };

export function QuizRunner() {
  const params = useSearchParams();
  const router = useRouter();
  const [view, setView] = useState<'create' | 'loading' | 'take' | 'done' | 'error'>('create');
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ title: '', topicTitle: '', count: '10', difficulty: 'MIXED' });
  const [quiz, setQuiz] = useState<{ id: string; title: string } | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<Result | null>(null);

  const load = useCallback(async (id: string) => {
    setView('loading');
    try {
      const r = await get<{ quiz: { id: string; title: string }; questions: Q[] }>(`/api/quizzes/${id}/attempt`);
      setQuiz(r.quiz); setQuestions(r.questions); setAnswers({}); setResult(null); setView('take');
      router.replace(`/app/quiz?id=${id}`, { scroll: false });
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not load the quiz.'); setView('error'); }
  }, [router]);

  useEffect(() => { const id = params.get('id'); if (id) void load(id); }, [params, load]);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setView('loading'); setErr('');
    try {
      const r = await post<{ quizId: string; questionCount: number; rejected: number }>('/api/quizzes', {
        title: form.title || `Quiz on ${form.topicTitle || 'revision'}`,
        ...(form.topicTitle ? { topicTitle: form.topicTitle } : {}),
        count: Number(form.count), difficulty: form.difficulty
      });
      await load(r.quizId);
    } catch (ex) {
      setErr(ex instanceof ApiRequestError ? ex.message : 'Could not generate a quiz.');
      setView('error');
    }
  };

  const submit = async () => {
    if (!quiz) return;
    try {
      const r = await post<Result>(`/api/quizzes/${quiz.id}/attempt`, { answers });
      setResult(r); setView('done');
    } catch (ex) { setErr(ex instanceof ApiRequestError ? ex.message : 'Could not submit.'); setView('error'); }
  };

  if (view === 'create') {
    return (
      <div className="stack gap-4">
        <header>
          <h1 className="h2">Quizzes</h1>
          <p className="muted" style={{ fontSize: '.88rem', marginTop: '.25rem' }}>
            Generated from your topics, then validated before you see them. Questions with no valid answer are discarded.
          </p>
        </header>
        <form onSubmit={generate} className="card card-pad stack gap-3">
          <Input label="Title" name="title" maxLength={160} value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Optional" />
          <Input label="Topic" name="topicTitle" required maxLength={160} value={form.topicTitle}
            onChange={(e) => setForm({ ...form, topicTitle: e.target.value })} placeholder="e.g. Photosynthesis" />
          <div style={{ display: 'grid', gap: '.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))' }}>
            <Select label="Questions" name="count" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })}>
              {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
            <Select label="Difficulty" name="difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {['MIXED', 'EASY', 'MEDIUM', 'HARD'].map((d) => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
            </Select>
          </div>
          <Button type="submit" block>Generate quiz</Button>
        </form>
      </div>
    );
  }

  if (view === 'loading') {
    return (
      <div className="stack gap-3">
        <h1 className="h2">Preparing…</h1>
        {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 84, borderRadius: 12 }} />)}
      </div>
    );
  }

  if (view === 'error') {
    return (
      <div className="stack gap-3">
        <Alert tone="danger" title="Something went wrong">{err}</Alert>
        <Button variant="outline" onClick={() => { setView('create'); router.replace('/app/quiz'); }}>Back to quizzes</Button>
      </div>
    );
  }

  if (view === 'done' && result) {
    const pct = result.accuracyPercent;
    return (
      <div className="stack gap-4">
        <div className="card card-pad anim-pop" style={{ textAlign: 'center' }}>
          <p className="faint" style={{ fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Result</p>
          <p className="h1 tnum" style={{ margin: '.3rem 0' }}>{result.score} / {result.total}</p>
          {pct === null
            ? <p className="muted" style={{ fontSize: '.86rem' }}>No questions in this quiz.</p>
            : <>
                <ProgressBar value={result.score} max={result.total} label="Score" showValue />
                <p className="muted" style={{ fontSize: '.86rem', marginTop: '.6rem' }}>{pct}% correct</p>
              </>}
        </div>

        {result.weakTopics.length > 0 && (
          <Alert tone="warning" title="Topics to revisit">
            {result.weakTopics.join(', ')}. These will be weighted higher in your next revision plan.
          </Alert>
        )}

        <div className="stack gap-3">
          {result.review.map((r, i) => (
            <div key={r.id} className="card card-pad" style={{ borderLeft: `3px solid ${r.correct ? 'var(--success)' : 'var(--danger)'}` }}>
              <p className="row gap-2" style={{ fontSize: '.82rem', fontWeight: 600 }}>
                <span aria-hidden="true">{r.correct ? '✓' : '✕'}</span>
                <span className="faint" style={{ fontWeight: 400 }}>Question {i + 1}</span>
              </p>
              <p style={{ fontSize: '.92rem', marginTop: '.4rem' }}>{r.prompt}</p>
              {!r.correct && (
                <p style={{ fontSize: '.82rem', marginTop: '.5rem', color: 'var(--danger)' }}>
                  You answered: {String(r.given ?? '(nothing)')} · Correct: {String(r.expected)}
                </p>
              )}
              {r.explanation && <p className="muted" style={{ fontSize: '.82rem', marginTop: '.5rem', lineHeight: 1.6 }}>{r.explanation}</p>}
            </div>
          ))}
        </div>

        <div className="row gap-2">
          <Button variant="outline" onClick={() => { setView('create'); router.replace('/app/quiz'); }}>New quiz</Button>
          <Button onClick={() => router.push('/app/planner')}>Update my plan</Button>
        </div>
      </div>
    );
  }

  const answered = Object.keys(answers).length;
  return (
    <div className="stack gap-4">
      <header className="row spread wrap gap-2">
        <div><h1 className="h2">{quiz?.title}</h1>
          <p className="muted" style={{ fontSize: '.84rem', marginTop: '.2rem' }}>{answered} of {questions.length} answered</p></div>
        <Button onClick={submit} disabled={answered === 0}>Submit answers</Button>
      </header>
      <ProgressBar value={answered} max={questions.length} label="Progress" />

      {questions.map((q, i) => {
        const opts = q.options ?? [];
        const chosen = answers[q.id];
        return (
          <div key={q.id} className="card card-pad anim-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
            <p className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Question {i + 1} · {q.type.replace(/_/g, ' ').toLowerCase()}{q.difficulty ? ` · ${q.difficulty.toLowerCase()}` : ''}
            </p>
            <p style={{ fontSize: '.95rem', marginTop: '.45rem', lineHeight: 1.6 }}>{q.prompt}</p>

            {q.type === 'SHORT' || q.type === 'NUMERIC' ? (
              <input
                value={String(chosen ?? '')} type={q.type === 'NUMERIC' ? 'number' : 'text'}
                onChange={(e) => setAnswers({ ...answers, [q.id]: q.type === 'NUMERIC' ? Number(e.target.value) : e.target.value })}
                placeholder={q.type === 'NUMERIC' ? 'Enter a number' : 'Your answer'}
                style={{ marginTop: '.7rem', width: '100%', maxWidth: 320, padding: '.5rem .65rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '.88rem' }}
              />
            ) : (
              <div className="stack gap-2" style={{ marginTop: '.75rem' }}>
                {opts.map((o) => {
                  const isMulti = q.type === 'MULTI';
                  const selected = isMulti ? Array.isArray(chosen) && chosen.includes(o.id) : chosen === o.id;
                  const pick = () => {
                    if (isMulti) {
                      const cur = Array.isArray(chosen) ? chosen : [];
                      setAnswers({ ...answers, [q.id]: cur.includes(o.id) ? cur.filter((x) => x !== o.id) : [...cur, o.id] });
                    } else setAnswers({ ...answers, [q.id]: o.id });
                  };
                  return (
                    <button key={o.id} type="button" onClick={pick}
                      className="row gap-2"
                      style={{
                        width: '100%', textAlign: 'left', padding: '.6rem .8rem', borderRadius: 9,
                        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                        background: selected ? 'var(--accent-soft)' : 'var(--surface)',
                        cursor: 'pointer', fontSize: '.88rem',
                        transition: 'background-color 160ms linear, border-color 160ms linear, transform 200ms cubic-bezier(.34,1.4,.5,1)'
                      }}>
                      <span aria-hidden="true" style={{
                        width: 18, height: 18, borderRadius: isMulti ? 5 : 99, flexShrink: 0,
                        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border-strong)'}`,
                        background: selected ? 'var(--accent)' : 'transparent'
                      }} />
                      {o.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      <Button onClick={submit} disabled={answered === 0} block>Submit answers</Button>
    </div>
  );
}
