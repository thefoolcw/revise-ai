import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { EmptyState, Chip } from '@/components/ui/primitives';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';

export const metadata = { title: 'History' };
export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await getDb();

  const [sessions, attempts, convs] = await Promise.all([
    db.select().from(schema.studySessions).where(eq(schema.studySessions.userId, user.id))
      .orderBy(desc(schema.studySessions.startedAt)).limit(40),
    db.select({ id: schema.questionAttempts.id, correct: schema.questionAttempts.correct, createdAt: schema.questionAttempts.createdAt,
      prompt: schema.questions.prompt, topic: schema.questions.topicTitle })
      .from(schema.questionAttempts)
      .innerJoin(schema.questions, eq(schema.questions.id, schema.questionAttempts.questionId))
      .where(eq(schema.questionAttempts.userId, user.id))
      .orderBy(desc(schema.questionAttempts.createdAt)).limit(40),
    db.select().from(schema.aiConversations).where(eq(schema.aiConversations.userId, user.id))
      .orderBy(desc(schema.aiConversations.updatedAt)).limit(40)
  ]);

  const empty = sessions.length + attempts.length + convs.length === 0;

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">History</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Your recent sessions, answers and conversations, newest first.
        </p>
      </header>

      {empty && <EmptyState title="No history yet" body="Study sessions, question attempts and conversations will appear here." />}

      {!empty && (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
          <section className="card card-pad">
            <h2 className="h3" style={{ marginBottom: '.8rem' }}>Study sessions</h2>
            {sessions.length === 0 ? <p className="faint" style={{ fontSize: '.84rem' }}>None yet.</p>
              : <ul className="stack gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {sessions.map((s) => (
                    <li key={s.id} className="row spread gap-2" style={{ fontSize: '.86rem' }}>
                      <span>{new Date(s.startedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="faint tnum">{s.actualMinutes ?? 0} min</span>
                    </li>
                  ))}
                </ul>}
          </section>

          <section className="card card-pad">
            <h2 className="h3" style={{ marginBottom: '.8rem' }}>Question attempts</h2>
            {attempts.length === 0 ? <p className="faint" style={{ fontSize: '.84rem' }}>None yet.</p>
              : <ul className="stack gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {attempts.map((a) => (
                    <li key={a.id} className="row gap-2" style={{ fontSize: '.84rem', alignItems: 'flex-start' }}>
                      <Chip tone={a.correct ? 'success' : 'danger'}>{a.correct ? '✓' : '✕'}</Chip>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.prompt.slice(0, 70)}{a.prompt.length > 70 ? '…' : ''}
                      </span>
                    </li>
                  ))}
                </ul>}
          </section>

          <section className="card card-pad">
            <h2 className="h3" style={{ marginBottom: '.8rem' }}>Conversations</h2>
            {convs.length === 0 ? <p className="faint" style={{ fontSize: '.84rem' }}>None yet.</p>
              : <ul className="stack gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {convs.map((c) => (
                    <li key={c.id} className="row spread gap-2" style={{ fontSize: '.86rem' }}>
                      <Link href={`/app/tutor?c=${c.id}`} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title || 'Untitled'}</Link>
                      <span className="faint" style={{ fontSize: '.74rem', flexShrink: 0 }}>{new Date(c.updatedAt).toLocaleDateString('en-GB')}</span>
                    </li>
                  ))}
                </ul>}
          </section>
        </div>
      )}
    </div>
  );
}
