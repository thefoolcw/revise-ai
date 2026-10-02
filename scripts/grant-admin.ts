import { loadEnvFile } from 'node:process';
for (const f of ['.env.local', '.env']) { try { loadEnvFile(f); } catch {} }

/** Dev/ops helper: grant ADMIN and complete onboarding for one account. */
async function main() {
  const email = process.argv[2];
  if (!email) { console.error('usage: grant-admin.ts <email>'); process.exit(1); }

  const { getDb, schema } = await import('../src/server/db');
  const { eq, and } = await import('drizzle-orm');
  const db = await getDb();

  const [user] = await db.select({ id: schema.users.id }).from(schema.users)
    .where(eq(schema.users.email, email)).limit(1);
  if (!user) { console.error('no such user'); process.exit(1); }

  await db.insert(schema.userRoles).values({ userId: user.id, role: 'ADMIN' }).onConflictDoNothing();
  await db.update(schema.profiles).set({ onboardedAt: new Date() }).where(eq(schema.profiles.userId, user.id));

  const [role] = await db.select({ role: schema.userRoles.role }).from(schema.userRoles)
    .where(and(eq(schema.userRoles.userId, user.id), eq(schema.userRoles.role, 'ADMIN'))).limit(1);
  console.log(`admin role present: ${role?.role === 'ADMIN'}`);

  const { closeDb } = await import('../src/server/db');
  await closeDb();
  process.exit(0);
}
main().catch((e) => { console.error('[grant-admin] failed:', e instanceof Error ? e.message : e); process.exit(1); });
