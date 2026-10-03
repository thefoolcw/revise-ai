'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/client';
import { Button, Alert } from '@/components/ui/primitives';
import type { PracticeQuestion } from '@/server/curriculum/types';

export function LessonPractice({ lessonId, questions, completed }: {
  lessonId: string; questions: PracticeQuestion[]; completed: boolean;
}) {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Record<string, 'REVIEW' | 'CONFIDENT'>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    let active = true;
    post('/api/lessons/progress', { lessonId }).catch(() => { if (active) setError('Visit could not be saved. Use Save practice to retry.'); });
    return () => { active = false; };
  }, [lessonId]);
  async function save(markCompleted: boolean) {
    setBusy(true); setError(''); setSaved(false);
    try {
      await post('/api/lessons/progress', { lessonId, completed: markCompleted, assessments });
      setSaved(true); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save progress.'); }
    finally { setBusy(false); }
  }
  return <section className="card card-pad stack gap-3">
    <h2 className="h3">Practise & reflect</h2>
    <p className="muted">Try before revealing the answer. These open-ended activities are self-assessed, or assessed with a trusted adult—not automatically marked exam answers. Your typed notes stay on this page and are not saved.</p>
    {questions.map((q, i) => <div key={q.id} className="stack gap-2">
      <label htmlFor={q.id}><strong>{i + 1}. {q.question}</strong></label>
      <textarea id={q.id} className="input" rows={3} placeholder="Write your answer or describe what you tried…" />
      <details><summary>Reveal answer & explanation</summary><div className="card card-pad"><p>{q.answer}</p>{q.explanation !== q.answer && <p>{q.explanation}</p>}</div></details>
      <fieldset className="row wrap gap-3"><legend>Your reflection</legend>
        <label><input type="radio" name={`${q.id}-rating`} checked={assessments[q.id] === 'REVIEW'} onChange={() => setAssessments(a => ({ ...a, [q.id]: 'REVIEW' }))} /> Needs another try</label>
        <label><input type="radio" name={`${q.id}-rating`} checked={assessments[q.id] === 'CONFIDENT'} onChange={() => setAssessments(a => ({ ...a, [q.id]: 'CONFIDENT' }))} /> I can explain or demonstrate this</label>
      </fieldset>
    </div>)}
    {error && <Alert tone="danger" title="Progress not saved">{error}</Alert>}
    {saved && <p role="status">Progress saved.</p>}
    <div className="row wrap gap-2">
      <Button variant="outline" loading={busy} onClick={() => void save(false)}>Save practice</Button>
      <Button loading={busy} onClick={() => void save(true)}>{completed ? 'Completed — save review' : 'Mark lesson completed'}</Button>
    </div>
  </section>;
}
