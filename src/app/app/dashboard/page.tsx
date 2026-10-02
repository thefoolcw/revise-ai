import Link from 'next/link';
import { sql, eq, desc, and, gte, lte } from 'drizzle-orm';
import { Reveal } from '@/components/motion/Reveal';
import { CountUp } from '@/components/motion/CountUp';
import { EmptyState, ProgressBar } from '@/components/ui/primitives';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';
import { getUsageSnapshot } from '@/server/usage/ledger';
import { EntitlementService } from '@/server/premium/entitlements';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await getDb();
  const since = new Date(Date.now() - 29 * 864e5);

  const [usage, access, dueRows, planRows, recentNotes, sessRows, recentConvs, quizRows] = await Promise.all([
    getUsageSnapshot(user.id),
    EntitlementService.hasPremium(user.id),
    db.select({ n: sql<number>`count(*)::int` }).from(schema.flashcards)
      .where(and(eq(schema.flashcards.userId, user.id), lte(schema.flashcards.dueAt, new Date()))),
    db.select().from(schema.studyPlans).where(and(eq(schema.studyPlans.userId, user.id), eq(schema.studyPlans.status, 'ACTIVE')))
      .orderBy(desc(schema.studyPlans.createdAt)).limit(1),
    db.select({ id: schema.notes.id, title: schema.notes.title }).from(schema.notes)
      .where(eq(schema.notes.userId, user.id)).orderBy(desc(schema.notes.updatedAt)).limit(4),
    db.select({ n: sql<number>`count(*)::int`, mins: sql<number>`coalesce(sum(extract(epoch from (ended_at - started_at)) / 60), 0)::int` })
      .from(schema.studySessions).where(and(eq(schema.studySessions.userId, user.id), gte(schema.studySessions.startedAt, since))),
    db.select({ id: schema.aiConversations.id, title: schema.aiConversations.title, updatedAt: schema.aiConversations.updatedAt })
      .from(schema.aiConversations).where(eq(schema.aiConversations.userId, user.id)).orderBy(desc(schema.aiConversations.updatedAt)).limit(4),
    db.select({ id: schema.quizAttempts.id, score: schema.quizAttempts.score, total: schema.quizAttempts.total, submittedAt: schema.quizAttempts.submittedAt })
      .from(schema.quizAttempts).where(eq(schema.quizAttempts.userId, user.id)).orderBy(desc(schema.quizAttempts.submittedAt)).limit(3)
  ]);

  const plan = planRows[0] ?? null;
  const planItems = plan
    ? await db.select({ status: schema.studyPlanItems.status, n: sql<number>`count(*)::int` })
        .from(schema.studyPlanItems).where(eq(schema.studyPlanItems.planId, plan.id)).groupBy(schema.studyPlanItems.status)
    : [];
  const done = planItems.find((i) => i.status === 'COMPLETED')?.n ?? 0;
  const total = planItems.reduce((a, b) => a + b.n, 0);
  const dueCards = dueRows[0]?.n ?? 0;
  const minutes = sessRows[0]?.mins ?? 0;
  const sessionCount = sessRows[0]?.n ?? 0;

  return (
    <div className="stack gap-5">
      <Reveal>
        <header>
          <p className="faint" style={{ fontSize: '.82rem' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="h1" style={{ marginTop: '.2rem' }}>Hello, {user.displayName.split(' ')[0]}</h1>
        </header>
      </Reveal>

      <Reveal delay={60}>
        <div style={{ display: 'grid', gap: '.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))' }}>
          <div className="card card-pad">
            <p className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>AI requests today</p>
            <p className="h2 tnum" style={{ marginTop: '.25rem' }}>
              <CountUp value={usage.aiRequests.used} />
              <span className="faint" style={{ fontSize: '.9rem' }}> / {usage.aiRequests.limit}</span>
            </p>
            <div style={{ marginTop: '.55rem' }}>
              <ProgressBar value={usage.aiRequests.used} max={usage.aiRequests.limit} label="AI requests used today" />
            </div>
          </div>

          <div className="card card-pad">
            <p className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Study minutes (30d)</p>
            <p className="h2 tnum" style={{ marginTop: '.25rem' }}><CountUp value={minutes} /></p>
            <p className="faint" style={{ fontSize: '.74rem', marginTop: '.35rem' }}>{sessionCount} logged {sessionCount === 1 ? 'session' : 'sessions'}</p>
          </div>

          <div className="card card-pad">
            <p className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Cards due</p>
            <p className="h2 tnum" style={{ marginTop: '.25rem' }}><CountUp value={dueCards} /></p>
            {dueCards > 0
              ? <Link href="/app/flashcards" style={{ fontSize: '.76rem' }}>Review now →</Link>
              : <p className="faint" style={{ fontSize: '.74rem', marginTop: '.35rem' }}>Nothing due</p>}
          </div>

          <div className="card card-pad">
            <p className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Active plan</p>
            <p className="h2 tnum" style={{ marginTop: '.25rem' }}>
              {total > 0 ? <><CountUp value={done} /><span className="faint" style={{ fontSize: '.9rem' }}> / {total}</span></> : '—'}
            </p>
            {total > 0
              ? <div style={{ marginTop: '.55rem' }}><ProgressBar value={done} max={total} label="Plan items completed" /></div>
              : <Link href="/app/planner" style={{ fontSize: '.76rem' }}>Create a plan</Link>}
          </div>
        </div>
      </Reveal>

      <Reveal delay={110}>
        <div className="card card-pad">
          <h2 className="h3" style={{ marginBottom: '.9rem' }}>Quick actions</h2>
          <div style={{ display: 'grid', gap: '.55rem', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))' }}>
            {([['/app/tutor', 'Ask the tutor', '◈'], ['/app/solve', 'Solve a question', '⌁'], ['/app/quiz', 'Build a quiz', '◑'], ['/app/planner', 'Plan revision', '▤'], ['/app/notes', 'Write a note', '✎']] as [string, string, string][])
              .map(([href, label, icon]) => (
                <Link key={href} href={href} className="card card-pad" style={{ textDecoration: 'none', textAlign: 'center', padding: '1rem .6rem' }}>
                  <span aria-hidden="true" style={{ fontSize: '1.35rem', color: 'var(--accent)' }}>{icon}</span>
                  <p style={{ fontSize: '.82rem', marginTop: '.3rem' }}>{label}</p>
                </Link>
              ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={160}>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div className="card card-pad">
            <h2 className="h3" style={{ marginBottom: '.8rem' }}>Recent conversations</h2>
            {recentConvs.length === 0
              ? <EmptyState title="No conversations yet" body="Ask the tutor anything — explanations, worked examples, feedback on your answers." />
              : <ul className="stack gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {recentConvs.map((c) => (
                    <li key={c.id}>
                      <Link href={`/app/tutor?c=${c.id}`} style={{ fontSize: '.88rem' }}>{c.title || 'Untitled conversation'}</Link>
                      <span className="faint" style={{ fontSize: '.72rem', marginLeft: '.5rem' }}>{new Date(c.updatedAt).toLocaleDateString('en-GB')}</span>
                    </li>
                  ))}
                </ul>}
          </div>

          <div className="card card-pad">
            <h2 className="h3" style={{ marginBottom: '.8rem' }}>Recent notes</h2>
            {recentNotes.length === 0
              ? <EmptyState title="No notes yet" body="AI actions create a new version — they never overwrite what you wrote." />
              : <ul className="stack gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {recentNotes.map((n) => <li key={n.id}><Link href={`/app/notes?id=${n.id}`} style={{ fontSize: '.88rem' }}>{n.title || 'Untitled'}</Link></li>)}
                </ul>}
          </div>
        </div>
      </Reveal>

      {quizRows.length > 0 && (
        <Reveal delay={200}>
          <div className="card card-pad">
            <h2 className="h3" style={{ marginBottom: '.8rem' }}>Latest quizzes</h2>
            <div className="row gap-3 wrap">
              {quizRows.map((q) => {
                const pct = q.total ? Math.round((q.score / q.total) * 100) : null;
                return (
                  <div key={q.id} className="chip" style={{ fontSize: '.82rem' }}>
                    <span className="tnum" style={{ fontWeight: 650 }}>{pct === null ? 'Not submitted' : `${pct}%`}</span>
                    {q.submittedAt && <span className="faint" style={{ fontSize: '.72rem' }}>{new Date(q.submittedAt).toLocaleDateString('en-GB')}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      )}

      <Reveal delay={240}>
        <div className="card card-pad row spread wrap gap-3">
          <div>
            <p style={{ fontWeight: 620, fontSize: '.92rem' }}>{access.hasPremium ? 'Premium Active' : 'Revise AI Free'}</p>
            <p className="faint" style={{ fontSize: '.8rem', marginTop: '.25rem' }}>
              {access.hasPremium
                ? `Source: ${(access as { source?: string }).source?.replace(/_/g, ' ').toLowerCase() ?? 'premium'}`
                : `${usage.aiRequests.limit} AI requests a day, resetting at midnight UTC.`}
            </p>
          </div>
          {!access.hasPremium && <Link href="/app/premium" className="btn btn-outline btn-sm">See Premium</Link>}
        </div>
      </Reveal>
    </div>
  );
}
