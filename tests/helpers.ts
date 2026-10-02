import { getDb, schema } from '../src/server/db';
import { hashPassword } from '../src/server/auth/password';

export async function makeUser(email = `u${Math.random().toString(36).slice(2, 9)}@example.com`, roles: string[] = ['STUDENT']) {
  const db = await getDb();
  const [user] = await db.insert(schema.users).values({
    email, passwordHash: await hashPassword('correct-horse-battery-9')
  }).returning();
  await db.insert(schema.profiles).values({ userId: user!.id, displayName: 'Test Learner' });
  for (const role of roles) await db.insert(schema.userRoles).values({ userId: user!.id, role });
  return user!;
}

export async function activeEntitlementCount(userId: string): Promise<number> {
  const db = await getDb();
  const rows = await db.select().from(schema.entitlements).where((await import('drizzle-orm')).eq(schema.entitlements.userId, userId));
  return rows.filter((r) => r.status === 'ACTIVE').length;
}

export async function entitlementCount(userId: string): Promise<number> {
  const db = await getDb();
  const { eq } = await import('drizzle-orm');
  const rows = await db.select().from(schema.entitlements).where(eq(schema.entitlements.userId, userId));
  return rows.length;
}
