import { SettingsForm } from '@/components/app/SettingsForm';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';
import { eq } from 'drizzle-orm';

export const metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await getDb();
  const [board, qual] = await Promise.all([
    user.examBoardId ? db.select({ name: schema.examBoards.name }).from(schema.examBoards).where(eq(schema.examBoards.id, user.examBoardId)).limit(1) : Promise.resolve([]),
    user.qualificationId ? db.select({ name: schema.qualifications.name }).from(schema.qualifications).where(eq(schema.qualifications.id, user.qualificationId)).limit(1) : Promise.resolve([])
  ]);

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Settings</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Your profile, your data, and the controls that end access.
        </p>
      </header>
      <SettingsForm
        profile={{ displayName: user.displayName, explainLevel: user.explainLevel, defaultModelId: user.defaultModelId }}
        boardName={board[0]?.name ?? null}
        qualName={qual[0]?.name ?? null}
      />
    </div>
  );
}
