import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/ui/primitives';
import { PremiumOffer } from '@/components/app/PremiumOffer';
import { getPremiumProduct, FREE_LIMITS } from '@/server/premium/product';
import { getCurrentUser } from '@/server/auth/session';
import { EntitlementService } from '@/server/premium/entitlements';

export const metadata: Metadata = { title: 'Pricing', description: 'Premium is £3.99 as a one-time key, bought in the Revise AI Discord.' };

export default async function PricingPage() {
  const product = getPremiumProduct();
  const user = await getCurrentUser();
  const access = user ? await EntitlementService.hasPremium(user.id) : null;

  const rows: [string, string, string][] = [
    ['AI requests per day', `${FREE_LIMITS.aiRequestsPerDay}`, `${product.limits.aiRequestsPerDay}`],
    ['Quiz generations per day', `${FREE_LIMITS.quizGenerationsPerDay}`, `${product.limits.quizGenerationsPerDay}`],
    ['Flashcard generations per day', `${FREE_LIMITS.flashcardGenerationsPerDay}`, `${product.limits.flashcardGenerationsPerDay}`],
    ['Document pages per day', `${FREE_LIMITS.documentPagesPerDay}`, `${product.limits.documentPagesPerDay}`],
    ['Storage', `${Math.round(FREE_LIMITS.storageBytes / 1048576)} MB`, `${Math.round(product.limits.storageBytes / 1048576)} MB`],
    ['AI tutor, solver, planner, notes', 'Included', 'Included'],
    ['Every enabled model', 'Standard set', 'All enabled models']
  ];

  return (
    <div className="container-x" style={{ paddingBlock: '3.5rem' }}>
      <Reveal><SectionHeading eyebrow="Pricing" title="One price. No subscription." align="center" lede="Free covers a full study session every day. Premium lifts the limits for £3.99, once." /></Reveal>

      {access?.hasPremium && (
        <Reveal delay={60}>
          <div style={{ marginTop: '2rem', maxWidth: 640, marginInline: 'auto' }}>
            <div className="card card-pad anim-success" style={{ borderColor: 'var(--success)', textAlign: 'center' }}>
              <p style={{ fontWeight: 650, color: 'var(--success)' }}>Premium Active</p>
              <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
                Source: {(access as any).source.replace(/_/g, ' ').toLowerCase()}
                {(access as any).expiresAt ? ` · expires ${new Date((access as any).expiresAt).toLocaleDateString('en-GB')}` : ' · no expiry'}
              </p>
            </div>
          </div>
        </Reveal>
      )}

      <div style={{ marginTop: '2.75rem', maxWidth: 620, marginInline: 'auto' }}>
        <Reveal delay={80}><PremiumOffer product={product} authed={!!user} /></Reveal>
      </div>

      <Reveal delay={140}>
        <div style={{ marginTop: '3rem' }}>
          <h2 className="h2" style={{ marginBottom: '1rem', textAlign: 'center' }}>Free vs Premium</h2>
          <div className="table-wrap">
            <table className="data">
              <caption className="sr-only">Comparison of free and premium limits</caption>
              <thead><tr><th scope="col">Limit</th><th scope="col">Free</th><th scope="col">Premium</th></tr></thead>
              <tbody>
                {rows.map(([a, b, c]) => (
                  <tr key={a}><td style={{ fontWeight: 560 }}>{a}</td><td className="muted tnum">{b}</td><td className="tnum" style={{ color: 'var(--accent)', fontWeight: 620 }}>{c}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="faint" style={{ fontSize: '.78rem', marginTop: '.8rem' }}>
            Limits reset at midnight UTC and are enforced server-side. Prices are held in integer minor units
            ({product.priceMinor} {product.currency}) so they never drift.
          </p>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="card card-pad" style={{ marginTop: '2.5rem', maxWidth: 620, marginInline: 'auto' }}>
          <h2 className="h3" style={{ marginBottom: '.5rem' }}>How buying works</h2>
          <ol className="stack gap-2" style={{ paddingLeft: '1.15rem', fontSize: '.9rem', lineHeight: 1.65, color: 'var(--text-muted)' }}>
            <li>Join the official Revise AI Discord.</li>
            <li>Read {product.discord.pricingChannel} and {product.discord.buyChannel}.</li>
            <li>Follow the current purchase and fulfilment instructions there.</li>
            <li>Receive your Premium key privately.</li>
            <li>Return to Revise AI, open <Link href="/redeem" style={{ color: 'var(--accent)' }}>Redeem</Link>, and submit the key.</li>
            <li>The server verifies it with the key provider and activates Premium on your account.</li>
          </ol>
          <p className="faint" style={{ fontSize: '.78rem', marginTop: '.9rem' }}>
            The website does not process card payments and has no second purchase provider.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
