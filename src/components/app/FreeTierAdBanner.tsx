import Link from 'next/link';
import { getCurrentUser } from '@/server/auth/session';
import { EntitlementService } from '@/server/premium/entitlements';

/** Server-only decision: no ad markup or ad request is sent to Premium users. */
export async function FreeTierAdBanner() {
  const user = await getCurrentUser();
  if (!user || (await EntitlementService.hasPremium(user.id)).hasPremium) return null;
  return <aside className="card card-pad stack gap-1" aria-label="Free-tier support message">
    <p className="faint">REVise is free to use. Ads help us keep it running.</p>
    <Link href="/app/premium">Want no ads? REVise Premium — £3.99.</Link>
  </aside>;
}
