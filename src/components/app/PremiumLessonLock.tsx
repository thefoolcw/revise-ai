import Link from 'next/link';
import { getPremiumProduct } from '@/server/premium/product';

export function PremiumLessonLock() {
  const product = getPremiumProduct();
  return <section className="card card-pad stack gap-3" style={{ borderColor: 'var(--gold)' }}>
    <span className="chip chip-gold">Premium Locked</span>
    <h2 className="h3">This lesson is part of REVise Premium.</h2>
    <p>Get access to Premium content and study without ads for £3.99.</p>
    <p>Join our Discord to purchase Premium.</p>
    {product.discord.configured
      ? <a className="btn btn-gold" href={product.discord.inviteUrl} target="_blank" rel="noopener noreferrer">Join our Discord to purchase Premium</a>
      : <Link className="btn btn-gold" href="/app/premium">Premium purchase information</Link>}
    <Link href="/app/premium">Already have a Premium key? Redeem it here.</Link>
  </section>;
}
