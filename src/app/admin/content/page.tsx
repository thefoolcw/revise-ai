import { sql } from 'drizzle-orm';
import { Alert, Chip } from '@/components/ui/primitives';
import { getDb } from '@/server/db';

export const metadata = { title: 'Content' };
export const dynamic = 'force-dynamic';

type Row = Record<string, unknown>;
const rows = (r: unknown): Row[] => ((r as { rows?: Row[] }).rows ?? r) as Row[];

export default async function AdminContent() {
  const db = await getDb();
  const [provRes, specsRes, docsRes] = await Promise.all([
    db.execute(sql`SELECT provenance, status, COUNT(*)::int AS n FROM topics GROUP BY 1,2 ORDER BY n DESC`),
    db.execute(sql`SELECT id, code, title, board_id, qualification_id, content_version AS version, verified_at, source_url
      FROM specifications ORDER BY verified_at DESC NULLS LAST LIMIT 100`),
    db.execute(sql`SELECT status, COUNT(*)::int AS n FROM documents GROUP BY 1 ORDER BY n DESC`)
  ]);
  const specs = rows(specsRes);
  const prov = rows(provRes);
  const illustrative = prov.filter((p) => String(p.provenance) === 'ILLUSTRATIVE').reduce((a, b) => a + Number(b.n ?? 0), 0);

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Content &amp; provenance</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          What is verified against an official source, and what is still illustrative. The learner-facing UI
          states which one it is showing.
        </p>
      </header>

      {specs.length === 0 && (
        <Alert tone="warning" title={`${illustrative} topics are illustrative`}>
          No verified specifications have been attached. Every topic tree in the catalogue is marked{' '}
          <code>ILLUSTRATIVE</code> and the API returns a provenance note saying so. Board and qualification
          names remain accurate.
        </Alert>
      )}

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Topic provenance</h2>
        <div className="table-wrap"><table className="data">
          <caption className="sr-only">Topics grouped by provenance and status</caption>
          <thead><tr><th scope="col">Provenance</th><th scope="col">Status</th><th scope="col">Count</th></tr></thead>
          <tbody>{prov.map((r, i) => (
            <tr key={i}>
              <td><Chip tone={String(r.provenance) === 'VERIFIED' ? 'success' : 'warn'}>{String(r.provenance)}</Chip></td>
              <td className="faint">{String(r.status)}</td>
              <td className="tnum">{String(r.n)}</td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Verified specifications</h2>
        {specs.length === 0
          ? <p className="faint" style={{ fontSize: '.84rem' }}>
              None. Add a specification only when you can cite an official source and version.
            </p>
          : <div className="table-wrap"><table className="data">
              <caption className="sr-only">Verified specifications</caption>
              <thead><tr><th scope="col">Code</th><th scope="col">Title</th><th scope="col">Board</th><th scope="col">Version</th><th scope="col">Verified</th></tr></thead>
              <tbody>{specs.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '.78rem' }}>{String(s.code)}</td>
                  <td>{String(s.title)}</td>
                  <td className="faint">{String(s.board_id ?? '—')}</td>
                  <td className="faint">{String(s.version ?? '—')}</td>
                  <td className="tnum faint">{s.verified_at ? new Date(String(s.verified_at)).toLocaleDateString('en-GB') : '—'}</td>
                </tr>
              ))}</tbody>
            </table></div>}
      </div>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Uploaded documents</h2>
        {rows(docsRes).length === 0
          ? <p className="faint" style={{ fontSize: '.84rem' }}>No documents uploaded yet.</p>
          : <div className="row gap-2 wrap">
              {rows(docsRes).map((r, i) => <span key={i} className="chip tnum">{String(r.status)} — <strong>{String(r.n)}</strong></span>)}
            </div>}
        <p className="faint" style={{ fontSize: '.76rem', marginTop: '.8rem' }}>
          Uploaded material stays owned by the learner and is scoped to their account.
        </p>
      </div>
    </div>
  );
}
