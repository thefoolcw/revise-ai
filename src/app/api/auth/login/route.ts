import { z } from 'zod';
import { sql, eq, and, isNull } from 'drizzle-orm';
import { handler, parse, throttle } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { verifyPassword } from '@/server/auth/password';
import { createSession, revokeAllSessions } from '@/server/auth/session';
import { audit } from '@/server/audit';

const Body = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.')
});

export const POST = handler(async (ctx, body) => {
  await throttle('login', ctx.ip ?? 'unknown', ctx.ip);
  const { email, password } = parse(Body, body);
  const db = await getDb();

  const rows = await db.select().from(schema.users)
    .where(and(sql`lower(${schema.users.email}) = ${email}`, isNull(schema.users.deletedAt))).limit(1);
  const user = rows[0];

  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid) {
    await audit({ actorId: user?.id ?? null, action: 'USER_LOGIN_FAILED', target: email, ipHint: ctx.ip });
    // Identical message for unknown email and wrong password.
    const e = new Error('That email and password do not match.'); (e as any).code = 'UNAUTHORIZED'; throw e;
  }
  if (user.status !== 'ACTIVE') {
    const e = new Error('This account is currently restricted.'); (e as any).code = 'FORBIDDEN'; throw e;
  }

  await createSession(user.id, { userAgent: ctx.req.headers.get('user-agent'), ip: ctx.ip });
  await audit({ actorId: user.id, action: 'USER_LOGIN', target: user.id, ipHint: ctx.ip });

  const roles = await db.select({ role: schema.userRoles.role }).from(schema.userRoles).where(eq(schema.userRoles.userId, user.id));
  return { userId: user.id, email: user.email, roles: roles.map((r) => r.role) };
});
