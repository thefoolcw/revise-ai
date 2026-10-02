import { desc } from 'drizzle-orm';
import { Chip } from '@/components/ui/primitives';
import { getDb, schema } from '@/server/db';

export const metadata = { title: 'Audit log' };
export const dynamic = 'force-dynamic';

export default async function AdminAudit() {
  const db = await getDb();
  const events = await db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.createdAt)).limit(300);

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Audit log</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Append-only record of privileged actions. No admin action can bypass it, and metadata is stored
          secret-free by construction.
        </p>
      </header>

      {events.length === 0
        ? <p className="faint" style={{ fontSize: '.84rem' }}>No audited actions yet.</p>
        : <div className="table-wrap">
            <table className="data">
              <caption className="sr-only">Audited administrative actions</caption>
              <thead><tr><th scope="col">When</th><th scope="col">Action</th><th scope="col">Target</th><th scope="col">Reason</th></tr></thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td className="tnum faint" style={{ whiteSpace: 'nowrap' }}>{new Date(e.createdAt).toLocaleString('en-GB')}</td>
                    <td><Chip tone={e.action.includes('REVOKED') || e.action.includes('FAILED') ? 'danger' : 'accent'}>{e.action}</Chip></td>
                    <td className="tnum faint">{e.target ? `${e.target.slice(0, 8)}…` : '—'}</td>
                    <td className="muted" style={{ fontSize: '.82rem' }}>{e.reason ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
      <p className="faint" style={{ fontSize: '.76rem' }}>Showing the 300 most recent entries.</p>
    </div>
  );
}
