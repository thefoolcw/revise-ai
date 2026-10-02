import type { Metadata } from 'next';
import { LegalPage } from '@/components/app/LegalPage';
import { getPremiumProduct } from '@/server/premium/product';
export const metadata: Metadata = { title: 'Refunds' };

export default async function Refunds() {
  const p = getPremiumProduct();
  return (
    <LegalPage title="Refunds" updated="2 October 2026">
      <h2>How Premium is sold</h2>
      <p>Premium is {p.displayPrice} as a one-time key. The purchase happens in our Discord, not on this website, so the payment is handled by whatever provider the Discord purchase flow uses.</p>
      <h2>If something goes wrong</h2>
      <p>If you paid but your key does not work, contact us through the support form with your order reference — never your key itself in a public channel. We can check the verification record and reissue or refund.</p>
      <h2>If Premium is revoked</h2>
      <p>Where access is revoked, the reason is recorded in the audit trail. Your study data is never deleted because an entitlement changed.</p>
      <h2>Digital goods</h2>
      <p>Because Premium is activated immediately on redemption, it is not normally refundable once used. Unused keys can be discussed with us directly.</p>
    </LegalPage>
  );
}
