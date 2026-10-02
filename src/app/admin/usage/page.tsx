import { sql } from 'drizzle-orm';
import { getDb } from '@/server/db';

export const metadata = { title: 'Usage' };
export const dynamic = 'force-dynamic';

type Row = Record<string, unknown>;
const rows = (r: unknown): Row[] => ((r as { rows?: Row[] }).rows ?? r) as Row[];

export default async function AdminUsage() {
  const db = await getDb();
  const since = new Date(Date.now() - 29 * 864e5);

  const [byFeatureRes, byModelRes, topUsersRes, peakRes] = await Promise.all([
    db.execute(sql`SELECT feature, COUNT(*)::int AS n, COALESCE(SUM(amount),0)::int AS amount
      FROM usage_ledger WHERE created_at >= ${since} GROUP BY feature ORDER BY n DESC`),
    db.execute(sql`SELECT COALESCE(model_id,'(unknown)') AS model, COUNT(*)::int AS n,
      COALESCE(SUM(amount) FILTER (WHERE metric = 'input_tokens'),0)::int AS input_tokens,
      COALESCE(SUM(amount) FILTER (WHERE metric = 'output_tokens'),0)::int AS output_tokens
      FROM usage_ledger WHERE created_at >= ${since} GROUP BY 1 ORDER BY n DESC LIMIT 20`),
    db.execute(sql`SELECT u.email, COUNT(*)::int AS n FROM usage_ledger ul
      JOIN users u ON u.id = ul.user_id WHERE ul.created_at >= ${since}
      GROUP BY u.email ORDER BY n DESC LIMIT 15`),
    db.execute(sql`SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::int AS n
      FROM usage_ledger WHERE created_at >= ${since} GROUP BY 1 ORDER BY 1`)
  ]);

  const peak = rows(peakRes);
  const maxDay = peak.reduce((m, r) => Math.max(m, Number(r.n ?? 0)), 0) || 1;

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Usage analytics</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Last 30 days from the append-only usage ledger.
        </p>
      </header>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '1rem' }}>Requests per day</h2>
        {peak.length === 0
          ? <p className="faint" style={{ fontSize: '.84rem' }}>No usage recorded yet.</p>
          : <div className="row gap-1" style={{ alignItems: 'flex-end', height: 140 }}>
              {peak.map((r, i) => {
                const n = Number(r.n ?? 0);
                return (
                  <div key={i} title={`${String(r.day)}: ${n}`}
                    style={{
                      flex: 1, minWidth: 6, borderRadius: '3px 3px 0 0', background: 'var(--accent)',
                      height: `${Math.max(2, (n / maxDay) * 100)}%`,
                      transition: 'height 500ms cubic-bezier(.22,.9,.28,1)'
                    }} />
                );
              })}
            </div>}
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', alignItems: 'start' }}>
        <div className="card card-pad">
          <h2 className="h3" style={{ marginBottom: '.8rem' }}>By feature</h2>
          <div className="table-wrap"><table className="data">
            <caption className="sr-only">Usage by feature</caption>
            <thead><tr><th scope="col">Feature</th><th scope="col">Calls</th><th scope="col">Units</th></tr></thead>
            <tbody>{rows(byFeatureRes).map((r, i) => (
              <tr key={i}><td style={{ fontWeight: 560 }}>{String(r.feature)}</td><td className="tnum">{String(r.n)}</td><td className="tnum faint">{String(r.amount)}</td></tr>
            ))}</tbody>
          </table></div>
        </div>

        <div className="card card-pad">
          <h2 className="h3" style={{ marginBottom: '.8rem' }}>By model</h2>
          <div className="table-wrap"><table className="data">
            <caption className="sr-only">Usage by model</caption>
            <thead><tr><th scope="col">Model</th><th scope="col">Calls</th><th scope="col">Tokens in</th><th scope="col">Tokens out</th></tr></thead>
            <tbody>{rows(byModelRes).map((r, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '.78rem' }}>{String(r.model)}</td>
                <td className="tnum">{String(r.n)}</td><td className="tnum faint">{String(r.input_tokens)}</td><td className="tnum faint">{String(r.output_tokens)}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>

        <div className="card card-pad">
          <h2 className="h3" style={{ marginBottom: '.8rem' }}>Heaviest accounts</h2>
          <div className="table-wrap"><table className="data">
            <caption className="sr-only">Top accounts by usage</caption>
            <thead><tr><th scope="col">Account</th><th scope="col">Calls</th></tr></thead>
            <tbody>{rows(topUsersRes).map((r, i) => (
              <tr key={i}><td>{String(r.email)}</td><td className="tnum">{String(r.n)}</td></tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}
