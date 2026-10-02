import type { Metadata } from 'next';
import Link from 'next/link';
import { RedeemWidget } from '@/components/app/RedeemWidget';
import { Brand } from '@/components/app/Brand';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { getPremiumProduct } from '@/server/premium/product';
import { getCurrentUser } from '@/server/auth/session';
import { EntitlementService } from '@/server/premium/entitlements';

export const metadata: Metadata = { title: 'Redeem Premium Key', description: 'Enter your Revise AI Premium key to activate Premium.' };
export const dynamic = 'force-dynamic';

export default async function RedeemPage() {
  const product = getPremiumProduct();
  const user = await getCurrentUser();
  const access = user ? await EntitlementService.hasPremium(user.id) : null;

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '2rem 1.25rem', position: 'relative', overflow: 'hidden' }}>
      <div className="ambient" aria-hidden="true" />
      <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', right: '1.25rem', zIndex: 2 }}>
        <div className="row spread">
          <Link href="/" style={{ textDecoration: 'none' }}><Brand /></Link>
          <ThemeToggle />
        </div>
      </div>
      <main id="main" className="anim-fade-up" style={{ width: '100%', maxWidth: 470, position: 'relative', zIndex: 1 }}>
        {access?.hasPremium && (
          <div className="card card-pad anim-success" style={{ marginBottom: '1rem', borderColor: 'var(--success)', textAlign: 'center' }}>
            <p style={{ fontWeight: 680, color: 'var(--success)', fontSize: '1.05rem' }}>Premium Active</p>
            <p className="muted" style={{ fontSize: '.84rem', marginTop: '.3rem' }}>
              Your account already has Premium. Redeeming another key would not change anything.
            </p>
            <Link href="/app" className="btn btn-outline btn-sm" style={{ marginTop: '.9rem' }}>Go to your dashboard</Link>
          </div>
        )}
        <RedeemWidget product={product} authed={!!user} />
      </main>
    </div>
  );
}
