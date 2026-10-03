import { getSubjectAvailability } from '@/server/curriculum/availability';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from '@/components/app/OnboardingWizard';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';
import { eq } from 'drizzle-orm';

export const metadata = { title: 'Set up Revise AI', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.onboardedAt) redirect('/app/dashboard');

  const db = await getDb();
  const availability = await getSubjectAvailability();
  const [boards, quals, subjects] = await Promise.all([
    db.select().from(schema.examBoards).where(eq(schema.examBoards.status, 'ACTIVE')),
    db.select().from(schema.qualifications),
    db.select({ id: schema.subjects.id, name: schema.subjects.name, category: schema.subjects.category }).from(schema.subjects)
  ]);

  return (
    <OnboardingWizard
      displayName={user.displayName}
      boards={boards.map((b) => ({ id: b.id, name: b.name, shortName: b.shortName, country: b.country }))}
      quals={quals.map((q) => ({ id: q.id, name: q.name, level: q.level, boards: (q.boards as string[]) ?? [] }))}
      subjects={subjects}
      availability={availability}
    />
  );
}
