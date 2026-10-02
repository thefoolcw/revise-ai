import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { ToastProvider } from '@/components/app/Toaster';
import { getCurrentUser } from '@/server/auth/session';
import { EntitlementService } from '@/server/premium/entitlements';

export const metadata: Metadata = { title: { default: 'Revise AI', template: '%s · Revise AI' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const access = await EntitlementService.hasPremium(user.id);
  const isAdmin = user.roles.includes('ADMIN');

  return (
    <ToastProvider>
      <AppShell
        user={{ displayName: user.displayName, email: user.email, onboarded: !!user.onboardedAt }}
        premiumActive={access.hasPremium}
        isAdmin={isAdmin}
      >
        {children}
      </AppShell>
    </ToastProvider>
  );
}
