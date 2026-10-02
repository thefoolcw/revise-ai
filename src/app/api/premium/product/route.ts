import { handler } from '@/server/api/route';
import { getPremiumProduct } from '@/server/premium/product';

/** Public, credential-free product configuration. */
export const GET = handler(async () => {
  const p = getPremiumProduct();
  return {
    slug: p.slug, name: p.name, description: p.description,
    displayPrice: p.displayPrice, priceMinor: p.priceMinor, currency: p.currency,
    purchaseChannel: p.purchaseChannel, fulfilment: p.fulfilment,
    features: p.features, limits: p.limits, discord: p.discord, enabled: p.enabled
  };
});
