import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq, sql } from 'drizzle-orm';
import { Alert, Chip } from '@/components/ui/primitives';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';

export const dynamic = 'force-dynamic';

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await getDb();

  const [t] = await db.select().from(schema.topics).where(eq(schema.topics.id, topic)).limit(1);
  if (!t) notFound();

  const [subject, children, parent] = await Promise.all([
    t.subjectId ? db.select({ id: schema.subjects.id, name: schema.subjects.name }).from(schema.subjects).where(eq(schema.subjects.id, t.subjectId)).limit(1) : Promise.resolve([]),
    db.select({ id: schema.topics.id, title: schema.topics.title, provenance: schema.topics.provenance }).from(schema.topics)
      .where(eq(schema.topics.parentId, t.id)).orderBy(schema.topics.orderIndex),
    t.parentId ? db.select({ id: schema.topics.id, title: schema.topics.title }).from(schema.topics).where(eq(schema.topics.id, t.parentId)).limit(1) : Promise.resolve([])
  ]);

  const [stat] = await db.execute(sql`
    SELECT COUNT(*)::int AS n, COUNT(*) FILTER (WHERE qa.correct)::int AS correct
    FROM question_attempts qa JOIN questions q ON q.id = qa.question_id
    WHERE qa.user_id = ${user.id} AND q.topic_id = ${t.id}`) as unknown as { n: number; correct: number }[] ?? [];
  const n = Number(stat?.n ?? 0), correct = Number(stat?.correct ?? 0);
  const pct = n >= 3 ? Math.round((correct / n) * 100) : null;

  const cards = await db.select({ n: sql<number>`count(*)::int`, due: sql<number>`count(*) filter (where due_at <= now())::int` })
    .from(schema.flashcards).where(and(eq(schema.flashcards.userId, user.id), sql`tags @> to_jsonb(array[${t.title}]::text[])`)).limit(1);

  return (
    <div className="stack gap-4">
      <header>
        <p className="faint" style={{ fontSize: '.78rem' }}>
          <Link href="/app/learn">Curriculum</Link>
          {subject?.[0] && <> / <Link href={`/app/subjects/${subject[0].id}`}>{subject[0].name}</Link></>}
          {parent?.[0] && <> / <Link href={`/app/topics/${parent[0].id}`}>{parent[0].title}</Link></>}
        </p>
        <h1 className="h2" style={{ marginTop: '.2rem' }}>{t.title}</h1>
        <div className="row gap-2 wrap" style={{ marginTop: '.5rem' }}>
          <Chip tone={t.provenance === 'VERIFIED' ? 'success' : 'warn'}>{t.provenance}</Chip>
          <Chip>{t.status}</Chip>
        </div>
      </header>

      {t.provenance === 'ILLUSTRATIVE' && (
        <Alert tone="info" title="Illustrative topic">
          This topic has not been checked against a verified specification. Board and qualification names are
          accurate; this breakdown is a study scaffold.
        </Alert>
      )}

      <div style={{ display: 'grid', gap: '.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))' }}>
        <div className="card card-pad">
          <p className="faint" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Your accuracy</p>
          <p className="h2 tnum" style={{ marginTop: '.25rem' }}>{pct === null ? '—' : `${pct}%`}</p>
          <p className="faint" style={{ fontSize: '.74rem', marginTop: '.3rem' }}>
            {n < 3 ? `Needs 3+ attempts (you have ${n})` : `${correct}/${n} correct`}
          </p>
        </div>
        <div className="card card-pad">
          <p className="faint" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Flashcards</p>
          <p className="h2 tnum" style={{ marginTop: '.25rem' }}>{cards[0]?.n ?? 0}</p>
          <p className="faint" style={{ fontSize: '.74rem', marginTop: '.3rem' }}>{cards[0]?.due ?? 0} due now</p>
        </div>
      </div>

      <div className="row gap-2 wrap">
        <Link href="/app/tutor" className="btn btn-primary btn-sm">Ask the tutor about this</Link>
        <Link href="/app/quiz" className="btn btn-outline btn-sm">Quiz me</Link>
        <Link href="/app/solve" className="btn btn-outline btn-sm">Solve a question</Link>
        <Link href="/app/planner" className="btn btn-outline btn-sm">Plan revision</Link>
      </div>

      {children.length > 0 && (
        <div className="card card-pad">
          <h2 className="h3" style={{ marginBottom: '.8rem' }}>Subtopics</h2>
          <div style={{ display: 'grid', gap: '.4rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))' }}>
            {children.map((c) => (
              <Link key={c.id} href={`/app/topics/${c.id}`} className="card" style={{ padding: '.6rem .75rem', textDecoration: 'none', fontSize: '.86rem' }}>
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
