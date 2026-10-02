import { MarketingNav } from '@/components/app/MarketingNav';
import { MarketingFooter } from '@/components/app/MarketingFooter';
import { getCurrentUser } from '@/server/auth/session';
import { getPremiumProduct } from '@/server/premium/product';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const product = getPremiumProduct();
  return (
    <>
      <MarketingNav authed={!!user} displayName={user?.displayName} />
      <main id="main">{children}</main>
      <MarketingFooter discordUrl={product.discord.inviteUrl} />
    </>
  );
}
