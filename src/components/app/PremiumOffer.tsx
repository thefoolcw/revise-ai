import Link from 'next/link';
import type { PremiumProduct } from '@/server/premium/product';

/**
 * The one Premium offer, rendered from server-side product configuration.
 * Price, currency and Discord link all come from the server — never the client.
 */
export function PremiumOffer({ product, authed, compact = false }: { product: PremiumProduct; authed: boolean; compact?: boolean }) {
  const discordReady = product.discord.configured;
  return (
    <div className="card" style={{ padding: compact ? '1.25rem' : '2rem', position: 'relative', overflow: 'hidden' }}>
      <div className="ambient" aria-hidden="true" style={{ opacity: compact ? .3 : .55 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="row spread wrap gap-2">
          <div>
            <p className="eyebrow" style={{ marginBottom: '.35rem' }}>Premium</p>
            <p className="h1 tnum" style={{ letterSpacing: '-.03em' }}>Premium — {product.displayPrice}</p>
          </div>
          <span className="chip chip-accent">One-time key</span>
        </div>

        <p className="muted" style={{ marginTop: '.7rem', fontSize: '.95rem', lineHeight: 1.6 }}>
          Join our Discord to buy a premium key for {product.displayPrice}.
        </p>

        {!compact && (
          <ul className="stack gap-2" style={{ listStyle: 'none', padding: 0, margin: '1.25rem 0 0' }}>
            {product.features.map((f) => (
              <li key={f} className="row gap-2" style={{ alignItems: 'flex-start', fontSize: '.9rem', lineHeight: 1.55 }}>
                <span aria-hidden="true" style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>{f}
              </li>
            ))}
          </ul>
        )}

        <div className="row gap-2 wrap" style={{ marginTop: '1.4rem' }}>
          {discordReady ? (
            <a href={product.discord.inviteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Join Discord
            </a>
          ) : (
            <span className="btn btn-outline" aria-disabled="true" title="The Discord invite link is not configured on this server.">
              Join Discord (not configured)
            </span>
          )}
          <Link href={authed ? '/redeem' : '/login?next=/redeem'} className="btn btn-outline">Redeem Premium Key</Link>
        </div>

        {discordReady && (
          <p className="faint" style={{ fontSize: '.78rem', marginTop: '1rem', lineHeight: 1.6 }}>
            In the Discord, read <strong>{product.discord.pricingChannel}</strong> and <strong>{product.discord.buyChannel}</strong>,
            then follow the current purchase instructions. Your key is sent to you privately. Come back here and redeem it.
            Payment is handled in Discord — this website never takes card details.
          </p>
        )}
      </div>
    </div>
  );
}
