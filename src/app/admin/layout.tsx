import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth/session';
import { AdminShell } from '@/components/app/AdminNav';

export const metadata = { title: { default: 'Admin', template: '%s · Admin' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin');
  // Server-side authorization only — the nav is never the boundary.
  if (!user.roles.includes('ADMIN')) redirect('/app/dashboard');
  return <AdminShell>{children}</AdminShell>;
}
