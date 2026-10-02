import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { Chip } from '@/components/ui/primitives';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';

export const dynamic = 'force-dynamic';

export default async function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await getDb();

  const [session] = await db.select().from(schema.studySessions)
    .where(and(eq(schema.studySessions.id, sessionId), eq(schema.studySessions.userId, user.id))).limit(1);
  if (!session) notFound();

  const durationMin = session.endedAt
    ? Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 60000)
    : null;

  return (
    <div className="stack gap-4">
      <header>
        <p className="faint" style={{ fontSize: '.78rem' }}><Link href="/app/history">History</Link> / Session</p>
        <h1 className="h2" style={{ marginTop: '.2rem' }}>Focus session</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          {new Date(session.startedAt).toLocaleString('en-GB')}
        </p>
      </header>

      <div style={{ display: 'grid', gap: '.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))' }}>
        <div className="card card-pad">
          <p className="faint" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Logged</p>
          <p className="h2 tnum" style={{ marginTop: '.25rem' }}>{session.actualMinutes ?? 0} min</p>
        </div>
        <div className="card card-pad">
          <p className="faint" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Elapsed</p>
          <p className="h2 tnum" style={{ marginTop: '.25rem' }}>{durationMin === null ? '—' : `${durationMin} min`}</p>
        </div>
        <div className="card card-pad">
          <p className="faint" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Status</p>
          <p style={{ marginTop: '.45rem' }}><Chip tone={session.endedAt ? 'success' : 'warn'}>{session.endedAt ? 'ENDED' : 'OPEN'}</Chip></p>
        </div>
      </div>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.6rem' }}>Session detail</h2>
        <div className="table-wrap"><table className="data">
          <caption className="sr-only">Session detail</caption>
          <tbody>
            <tr><td>Started</td><td className="tnum">{new Date(session.startedAt).toLocaleString('en-GB')}</td></tr>
            <tr><td>Ended</td><td className="tnum">{session.endedAt ? new Date(session.endedAt).toLocaleString('en-GB') : 'still open'}</td></tr>
            <tr><td>Kind</td><td>{session.kind.replace(/_/g, ' ').toLowerCase()}</td></tr>
            {session.plannedMinutes !== null && <tr><td>Planned</td><td className="tnum">{session.plannedMinutes} min</td></tr>}
            {session.summary && <tr><td>Summary</td><td>{session.summary}</td></tr>}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
