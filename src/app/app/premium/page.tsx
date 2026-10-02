import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';
import { ProgressBar, Chip } from '@/components/ui/primitives';
import { PremiumOffer } from '@/components/app/PremiumOffer';
import { getPremiumProduct } from '@/server/premium/product';
import { getCurrentUser } from '@/server/auth/session';
import { EntitlementService } from '@/server/premium/entitlements';
import { getUsageSnapshot } from '@/server/usage/ledger';

export const metadata = { title: 'Premium' };
export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'success' | 'warn' | 'danger' | 'default'> = {
  ACTIVE: 'success', PENDING: 'warn', REVOKED: 'danger', EXPIRED: 'danger'
};

export default async function PremiumPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [product, access, usage, entitlements] = await Promise.all([
    getPremiumProduct(), EntitlementService.hasPremium(user.id),
    getUsageSnapshot(user.id), EntitlementService.getUserEntitlements(user.id)
  ]);

  return (
    <div className="stack gap-5">
      <Reveal>
        <header>
          <h1 className="h2">Premium</h1>
          <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
            Premium status is decided on the server after key verification. Nothing in your browser can grant it.
          </p>
        </header>
      </Reveal>

      <Reveal delay={60}>
        <div className="card card-pad">
          <div className="row spread wrap gap-2">
            <div>
              <p style={{ fontWeight: 660, fontSize: '1rem' }}>{access.hasPremium ? 'Premium Active' : 'Free plan'}</p>
              <p className="faint" style={{ fontSize: '.8rem', marginTop: '.3rem' }}>
                {access.hasPremium
                  ? `Verified server-side · source ${(access as { source?: string }).source?.replace(/_/g, ' ').toLowerCase() ?? 'premium'}`
                  : 'Redeem a Premium key to lift your daily limits.'}
              </p>
            </div>
            <Chip tone={access.hasPremium ? 'success' : 'default'}>{access.hasPremium ? 'ACTIVE' : 'FREE'}</Chip>
          </div>
          <div style={{ marginTop: '1.1rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))' }}>
            {([
              ['AI requests', usage.aiRequests], ['Quiz generations', usage.quizGeneration],
              ['Flashcard generations', usage.flashcardGeneration], ['Document pages', usage.documentPages]
            ] as [string, { used: number; limit: number; remaining: number }][]).map(([label, m]) => (
              <div key={label}>
                <div className="row spread" style={{ fontSize: '.82rem' }}>
                  <span>{label}</span><span className="tnum faint">{m.used} / {m.limit}</span>
                </div>
                <div style={{ marginTop: '.3rem' }}><ProgressBar value={m.used} max={m.limit} label={`${label} used today`} /></div>
              </div>
            ))}
          </div>
          <p className="faint" style={{ fontSize: '.74rem', marginTop: '1rem' }}>
            Limits reset at midnight UTC. Enforced server-side.
          </p>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="card card-pad">
          <h2 className="h3" style={{ marginBottom: '.8rem' }}>Your entitlements</h2>
          {entitlements.length === 0
            ? <p className="muted" style={{ fontSize: '.86rem' }}>
                No entitlements on this account yet.{' '}
                <Link href="/redeem" style={{ color: 'var(--accent)', fontWeight: 600 }}>Redeem a key</Link>.
              </p>
            : <div className="table-wrap">
                <table className="data">
                  <caption className="sr-only">Entitlement history</caption>
                  <thead><tr><th scope="col">Product</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Granted</th><th scope="col">Expires</th></tr></thead>
                  <tbody>
                    {entitlements.map((e) => (
                      <tr key={e.id}>
                        <td style={{ fontWeight: 560 }}>{e.productSlug}</td>
                        <td className="faint">{e.source.replace(/_/g, ' ').toLowerCase()}</td>
                        <td><Chip tone={STATUS_TONE[e.status] ?? 'default'}>{e.status}</Chip></td>
                        <td className="tnum faint">{new Date(e.grantedAt).toLocaleDateString('en-GB')}</td>
                        <td className="tnum faint">{e.expiresAt ? new Date(e.expiresAt).toLocaleDateString('en-GB') : 'No expiry'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}
          <p className="faint" style={{ fontSize: '.74rem', marginTop: '.9rem' }}>
            Premium keys are never stored here — only a hash and the last four characters. Full key values never
            appear in this interface.
          </p>
        </div>
      </Reveal>

      {!access.hasPremium && (
        <Reveal delay={180}>
          <PremiumOffer product={product} authed compact />
        </Reveal>
      )}
    </div>
  );
}
