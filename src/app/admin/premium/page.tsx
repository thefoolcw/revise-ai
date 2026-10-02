import { desc, eq } from 'drizzle-orm';
import { Chip } from '@/components/ui/primitives';
import { RevokeControl } from '@/components/admin/RevokeControl';
import { getDb, schema } from '@/server/db';
import { getPremiumProduct } from '@/server/premium/product';

export const metadata = { title: 'Premium' };
export const dynamic = 'force-dynamic';

export default async function AdminPremium() {
  const db = await getDb();
  const product = getPremiumProduct();
  const entitlements = await db.select({
    id: schema.entitlements.id, userId: schema.entitlements.userId, productSlug: schema.entitlements.productSlug,
    source: schema.entitlements.source, status: schema.entitlements.status, grantedAt: schema.entitlements.grantedAt,
    expiresAt: schema.entitlements.expiresAt, revokedAt: schema.entitlements.revokedAt, revokeReason: schema.entitlements.revokeReason,
    email: schema.users.email
  }).from(schema.entitlements).innerJoin(schema.users, eq(schema.users.id, schema.entitlements.userId))
    .orderBy(desc(schema.entitlements.grantedAt)).limit(200);

  const active = entitlements.filter((e) => e.status === 'ACTIVE');

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Premium</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Single product: <strong>{product.slug}</strong> at {product.displayPrice}, purchased in Discord and
          fulfilled by key. No card checkout exists anywhere in this system.
        </p>
      </header>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Product configuration</h2>
        <div className="table-wrap">
          <table className="data">
            <caption className="sr-only">Premium product configuration</caption>
            <tbody>
              <tr><td>Slug</td><td style={{ fontFamily: 'var(--font-mono, monospace)' }}>{product.slug}</td></tr>
              <tr><td>Price</td><td className="tnum">{product.displayPrice} ({product.priceMinor} {product.currency} in minor units)</td></tr>
              <tr><td>Purchase channel</td><td>{product.discord.configured ? 'Discord' : 'Discord (invite not configured)'}</td></tr>
              <tr><td>Fulfilment</td><td>Premium key, verified server-side</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Entitlements ({active.length} active)</h2>
        {entitlements.length === 0
          ? <p className="faint" style={{ fontSize: '.84rem' }}>No entitlements granted yet.</p>
          : <div className="table-wrap">
              <table className="data">
                <caption className="sr-only">Premium entitlements</caption>
                <thead><tr><th scope="col">User</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Granted</th><th scope="col">Expires</th><th scope="col">Action</th></tr></thead>
                <tbody>
                  {entitlements.map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 560 }}>{e.email}</td>
                      <td className="faint">{e.source.replace(/_/g, ' ').toLowerCase()}</td>
                      <td><Chip tone={e.status === 'ACTIVE' ? 'success' : e.status === 'PENDING' ? 'warn' : 'danger'}>{e.status}</Chip></td>
                      <td className="tnum faint">{new Date(e.grantedAt).toLocaleDateString('en-GB')}</td>
                      <td className="tnum faint">{e.expiresAt ? new Date(e.expiresAt).toLocaleDateString('en-GB') : 'No expiry'}</td>
                      <td>{e.status === 'ACTIVE' ? <RevokeControl entitlementId={e.id} /> : e.revokeReason ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
        <p className="faint" style={{ fontSize: '.76rem', marginTop: '.8rem' }}>
          Revocation is audited. Study data is never deleted because an entitlement changed.
        </p>
      </div>
    </div>
  );
}
