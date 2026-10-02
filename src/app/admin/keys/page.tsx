import { sql } from 'drizzle-orm';
import { Chip } from '@/components/ui/primitives';
import { getDb } from '@/server/db';
import { getKeyProvider } from '@/server/premium/provider';

export const metadata = { title: 'Keys' };
export const dynamic = 'force-dynamic';

type Row = Record<string, unknown>;

export default async function AdminKeys() {
  const db = await getDb();
  const cfg = getKeyProvider().validateConfig();
  const res = await db.execute(sql`
    SELECT id, state AS status, key_hint, created_at AS verified_at,
           provider_reference AS provider_ref, user_id
    FROM key_verifications ORDER BY created_at DESC NULLS LAST LIMIT 300`);
  const statsRes = await db.execute(sql`
    SELECT state AS status, COUNT(*)::int AS n FROM key_verifications GROUP BY state ORDER BY n DESC`);
  const rows = ((res as { rows?: Row[] }).rows ?? res) as Row[];
  const stats = ((statsRes as { rows?: Row[] }).rows ?? statsRes) as Row[];

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Premium keys</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Verification history and outcome distribution. A key&apos;s value is never persisted — only its SHA-256
          hash (unique, so a key can never be redeemed twice) and a four-character hint.
        </p>
      </header>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Outcomes</h2>
        {stats.length === 0
          ? <p className="faint" style={{ fontSize: '.84rem' }}>No verifications recorded yet.</p>
          : <div className="row gap-2 wrap">
              {stats.map((s, i) => (
                <span key={i} className="chip tnum">
                  {String(s.status)} — <strong>{String(s.n)}</strong>
                </span>
              ))}
            </div>}
        <p className="faint" style={{ fontSize: '.76rem', marginTop: '.8rem' }}>
          Key provider: <Chip tone={cfg.ok ? 'success' : 'danger'}>{cfg.ok ? 'CONFIGURED' : 'MISSING'}</Chip>
          {cfg.missing.length > 0 && <> · missing {cfg.missing.join(', ')}</>}
        </p>
      </div>

      {rows.length > 0 && (
        <div className="table-wrap">
          <table className="data">
            <caption className="sr-only">Key verification log</caption>
            <thead><tr><th scope="col">Hint</th><th scope="col">Status</th><th scope="col">Verified</th><th scope="col">Revoked</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={String(r.id ?? i)}>
                  <td className="tnum">••••{String(r.key_hint ?? '')}</td>
                  <td><Chip tone={r.status === 'VERIFIED' ? 'success' : r.status === 'REVOKED' ? 'danger' : 'warn'}>{String(r.status)}</Chip></td>
                  <td className="tnum faint">{r.verified_at ? new Date(String(r.verified_at)).toLocaleString('en-GB') : '—'}</td>
                  <td className="tnum faint">{r.revoked_at ? new Date(String(r.revoked_at)).toLocaleString('en-GB') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
