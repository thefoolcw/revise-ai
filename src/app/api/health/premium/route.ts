import { handler } from '@/server/api/route';
import { getPremiumProduct } from '@/server/premium/product';
import { getDb, schema } from '@/server/db';
import { eq } from 'drizzle-orm';
export const GET = handler(async () => {
  const product = getPremiumProduct();
  const db = await getDb();
  const [active] = await db.select({ n: schema.entitlements.id }).from(schema.entitlements).where(eq(schema.entitlements.status, 'ACTIVE')).limit(1);
  return {
    status: 'operational' as const,
    product: { slug: product.slug, displayPrice: product.displayPrice, currency: product.currency, enabled: product.enabled },
    discordConfigured: product.discord.configured
  };
});
