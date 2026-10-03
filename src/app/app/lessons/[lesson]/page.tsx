import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';
import { getLessonAccess } from '@/server/curriculum/access';
import { getYearMeta, type LessonSection, type WorkedExample, type MemoryTip, type CommonMistake, type QuickRecallItem, type PracticeQuestion } from '@/server/curriculum/types';
import { PremiumLessonLock } from '@/components/app/PremiumLessonLock';
import { FreeTierAdBanner } from '@/components/app/FreeTierAdBanner';
import { LessonPractice } from '@/components/app/LessonPractice';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Lesson', robots: { index: false } };
export default async function LessonPage({ params }: { params: Promise<{ lesson: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { lesson: slug } = await params;
  const access = await getLessonAccess(user.id, slug);
  if (!access) notFound();
  const { metadata: meta } = access;
  const breadcrumb = <p className="faint"><Link href="/app/learn">Curriculum</Link> / {getYearMeta(meta.yearGroup)?.fullLabel} / <Link href={`/app/subjects/${meta.subjectId}?year=${meta.yearGroup}`}>{meta.subjectId}</Link> / <Link href={`/app/topics/${meta.topicSlug}`}>{meta.topicTitle}</Link></p>;
  if (access.locked) return <div className="stack gap-4">{breadcrumb}<h1 className="h2">{meta.title}</h1><p>{meta.description}</p><PremiumLessonLock /></div>;
  const lesson = access.lesson;
  const db = await getDb();
  const [progress] = await db.select().from(schema.lessonProgress).where(and(eq(schema.lessonProgress.userId, user.id), eq(schema.lessonProgress.lessonId, lesson.id))).limit(1);
  const sections = lesson.content as LessonSection[];
  const examples = lesson.examples as WorkedExample[];
  const memories = lesson.memoryTips as MemoryTip[];
  const mistakes = lesson.commonMistakes as CommonMistake[];
  const recall = lesson.quickRecall as QuickRecallItem[];
  return <article className="stack gap-4" style={{ maxWidth: 900, marginInline: 'auto' }}>
    {breadcrumb}
    <header className="stack gap-2"><h1 className="h2">{lesson.title}</h1><p>{lesson.description}</p>
      <p className="muted">{lesson.difficulty} · {lesson.estimatedMinutes} minutes · {progress?.status === 'COMPLETED' ? 'Completed' : progress ? 'In Progress' : 'Not Started'}</p>
      {lesson.isPremium && <span className="chip chip-gold">Premium lesson</span>}
    </header>
    <section className="card card-pad"><h2 className="h3">You will learn to</h2><ul>{lesson.learningObjectives.map(o => <li key={o}>{o}</li>)}</ul></section>
    {(lesson.priorKnowledgeCheck as QuickRecallItem[]).map((q, i) => <details className="card card-pad" key={`prior-${i}`}><summary>Before you start: {q.prompt}</summary><p>{q.answer}</p></details>)}
    {sections.map((s, i) => <section key={i} className="card card-pad stack gap-2"><h2 className="h3">{s.heading}</h2><p style={{ whiteSpace: 'pre-line' }}>{s.body}</p>{s.analogy && <p><strong>Think of it this way: </strong>{s.analogy}</p>}{s.keyFacts && <ul>{s.keyFacts.map(f => <li key={f}>{f}</li>)}</ul>}</section>)}
    {examples.map((e, i) => <section key={i} className="card card-pad stack gap-2"><h2 className="h3">{e.title}</h2><p>{e.problem}</p><ol>{e.steps.map((s, j) => <li key={j}>{s}</li>)}</ol><p><strong>Result: </strong>{e.finalAnswer}</p>{e.whyItWorks && <p>{e.whyItWorks}</p>}</section>)}
    <section className="card card-pad stack gap-2"><h2 className="h3">Memory aids</h2>{memories.map((m, i) => <div key={i}><strong>{m.mnemonicOrRule}</strong><p>{m.explanation}</p></div>)}</section>
    <section className="card card-pad stack gap-2"><h2 className="h3">Mistakes to watch for</h2>{mistakes.map((m, i) => <div key={i}><strong>{m.mistake}</strong><p>{m.correction}</p></div>)}</section>
    <section className="card card-pad stack gap-2"><h2 className="h3">Quick recall</h2>{recall.map((q, i) => <details key={i}><summary>{q.prompt}</summary><p>{q.answer}</p></details>)}</section>
    <LessonPractice key={lesson.id} lessonId={lesson.id} questions={lesson.practiceQuestions as PracticeQuestion[]} completed={progress?.status === 'COMPLETED'} />
    <section className="card card-pad stack gap-2"><h2 className="h3">Recap & next review</h2><ul>{lesson.recap.map((r, i) => <li key={i}>{r}</li>)}</ul><p>{lesson.spacedRevisionSuggestion}</p></section>
    <FreeTierAdBanner />
  </article>;
}
