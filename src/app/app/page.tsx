import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth/session';
export default async function AppIndex() {
  const u = await getCurrentUser();
  redirect(!u ? '/login' : u.onboardedAt ? '/app/dashboard' : '/onboarding');
}
