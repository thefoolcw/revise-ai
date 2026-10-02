import { sql } from 'drizzle-orm';
import { Chip } from '@/components/ui/primitives';
import { getDb } from '@/server/db';

export const metadata = { title: 'Purchases' };
export const dynamic = 'force-dynamic';

type Row = Record<string, unknown>;

export default async function AdminPurchases() {
  const db = await getDb();
  const res = await db.execute(sql`
    SELECT kv.id, kv.state AS status, kv.key_hint, kv.created_at AS verified_at,
           kv.provider_reference AS provider_ref,
           e.product_slug, e.status AS entitlement_status,
           u.email
    FROM key_verifications kv
    LEFT JOIN entitlements e ON e.id = kv.granted_entitlement_id
    LEFT JOIN users u ON u.id = kv.user_id
    ORDER BY kv.created_at DESC NULLS LAST
    LIMIT 200`);
  const rows = ((res as { rows?: Row[] }).rows ?? res) as Row[];

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Purchases &amp; fulfilment</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Every key verification attempt, successful or not. Key values are never stored or displayed — only a
          hash and a four-character hint.
        </p>
      </header>

      {rows.length === 0
        ? <p className="faint" style={{ fontSize: '.84rem' }}>No verification records yet.</p>
        : <div className="table-wrap">
            <table className="data">
              <caption className="sr-only">Key verification and fulfilment records</caption>
              <thead><tr><th scope="col">User</th><th scope="col">Key hint</th><th scope="col">Verification</th><th scope="col">Entitlement</th><th scope="col">When</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={String(r.id ?? i)}>
                    <td style={{ fontWeight: 560 }}>{String(r.email ?? '—')}</td>
                    <td className="tnum faint">••••{String(r.key_hint ?? '')}</td>
                    <td><Chip tone={r.status === 'VERIFIED' ? 'success' : r.status === 'INVALID' || r.status === 'EXPIRED' ? 'danger' : 'warn'}>{String(r.status)}</Chip></td>
                    <td className="faint">{r.entitlement_status ? String(r.entitlement_status) : '—'}</td>
                    <td className="tnum faint">{r.verified_at ? new Date(String(r.verified_at)).toLocaleString('en-GB') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
    </div>
  );
}
