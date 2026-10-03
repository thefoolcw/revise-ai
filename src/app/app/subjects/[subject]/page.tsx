import { getYearMeta } from '@/server/curriculum/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq, inArray, sql, isNull } from 'drizzle-orm';
import { Alert, Chip, EmptyState } from '@/components/ui/primitives';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const db = await getDb();
  const [row] = await db.select({ name: schema.subjects.name }).from(schema.subjects).where(eq(schema.subjects.id, subject)).limit(1);
  return { title: row?.name ?? 'Subject', robots: { index: false } };
}

export default async function SubjectPage({ params, searchParams }: { params: Promise<{ subject: string }>; searchParams: Promise<{ year?: string }> }) {
  const { subject } = await params;
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await getDb();
  const query = await searchParams;
  const year = getYearMeta(query.year ?? user.yearGroup);
  if (!year) return <p>Choose a year in <Link href="/app/settings">Settings</Link> to view your subjects.</p>;
  if (!year.subjectIds.includes(subject)) notFound();

  const [subj] = await db.select().from(schema.subjects).where(eq(schema.subjects.id, subject)).limit(1);
  if (!subj) notFound();

  const topics = await db.select().from(schema.topics)
    .where(and(eq(schema.topics.subjectId, subject), eq(schema.topics.status, 'PUBLISHED'), eq(schema.topics.yearGroup, year.id), isNull(schema.topics.parentId)))
    .orderBy(schema.topics.orderIndex);

  const specRows = await db.select().from(schema.specifications).where(eq(schema.specifications.subjectId, subject)).limit(1);
  const spec = specRows[0] ?? null;
  const illustrative = topics.every((t) => t.provenance === 'ILLUSTRATIVE');

  const attempts = topics.length === 0 ? [] : await db.select({
    topicId: schema.questions.topicId, n: sql<number>`count(*)::int`,
    correct: sql<number>`count(*) filter (where ${schema.questionAttempts.correct})::int`
  }).from(schema.questionAttempts)
    .innerJoin(schema.questions, eq(schema.questions.id, schema.questionAttempts.questionId))
    .where(and(eq(schema.questionAttempts.userId, user.id), inArray(schema.questions.topicId, topics.map((t) => t.id))))
    .groupBy(schema.questions.topicId);
  const statOf = (id: string) => attempts.find((a) => a.topicId === id);

  return (
    <div className="stack gap-4">
      <header>
        <p className="faint" style={{ fontSize: '.78rem' }}><Link href="/app/learn">Curriculum</Link> / Subjects</p>
        <h1 className="h2" style={{ marginTop: '.2rem' }}>{subj.name}</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>{year.fullLabel} · {subj.category} · {topics.length} topics</p>
      </header>

      {illustrative && topics.length > 0 && (
        <Alert tone="info" title="Topic list is illustrative">
          No verified specification has been attached to this subject yet, so this breakdown has not been checked
          against an official source. Treat it as a study scaffold, not an authoritative syllabus.
        </Alert>
      )}

      <div className="row gap-2 wrap">
        <Link href={`/app/tutor`} className="btn btn-primary btn-sm">Ask the tutor</Link>
        <Link href={`/app/quiz`} className="btn btn-outline btn-sm">Build a quiz</Link>
        <Link href={`/app/flashcards`} className="btn btn-outline btn-sm">Flashcards</Link>
      </div>

      {topics.length === 0
        ? <EmptyState title="No topics yet" body="Topic entries for this subject have not been added." />
        : <div style={{ display: 'grid', gap: '.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))' }}>
            {topics.map((t) => {
              const s = statOf(t.id);
              const pct = s && s.n >= 3 ? Math.round((s.correct / s.n) * 100) : null;
              return (
                <Link key={t.id} href={`/app/topics/${t.id}`} className="card card-pad" style={{ textDecoration: 'none' }}>
                  <div className="row spread gap-2">
                    <span style={{ fontSize: '.88rem', fontWeight: 540 }}>{t.title}</span>
                    {pct === null
                      ? <span className="faint" style={{ fontSize: '.72rem' }}>{s ? `${s.n} attempts` : 'not attempted'}</span>
                      : <Chip tone={pct >= 70 ? 'success' : pct >= 40 ? 'warn' : 'danger'}>{pct}%</Chip>}
                  </div>
                  {pct !== null && <p className="faint" style={{ fontSize: '.72rem', marginTop: '.2rem' }}>{s!.correct}/{s!.n} correct</p>}
                </Link>
              );
            })}
          </div>}

      {spec && (
        <p className="faint" style={{ fontSize: '.76rem' }}>
          Specification on record: {spec.code ?? spec.title} · {spec.contentVersion ?? 'version not recorded'}
          {spec.sourceUrl ? <> · <a href={spec.sourceUrl} target="_blank" rel="noopener noreferrer">source</a></> : null}
        </p>
      )}
    </div>
  );
}