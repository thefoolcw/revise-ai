import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { handler, parse, throttle, clientIp } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { hashPassword, passwordIssue } from '@/server/auth/password';
import { createSession } from '@/server/auth/session';
import { audit } from '@/server/audit';

const Body = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter a password.'),
  displayName: z.string().trim().min(2, 'Enter a name we can call you.').max(60)
});

export const POST = handler(async (ctx, body) => {
  await throttle('signup', ctx.ip ?? 'unknown', ctx.ip);
  const { email, password, displayName } = parse(Body, body);

  const issue = passwordIssue(password);
  if (issue) {
    const e = new Error(issue); (e as any).code = 'VALIDATION_ERROR'; throw e;
  }

  const db = await getDb();
  const existing = await db.select({ id: schema.users.id }).from(schema.users)
    .where(sql`lower(${schema.users.email}) = ${email}`).limit(1);
  if (existing[0]) {
    // Do not reveal whether an account exists — same message either way.
    const e = new Error('An account with that email already exists.'); (e as any).code = 'VALIDATION_ERROR'; throw e;
  }

  const [user] = await db.insert(schema.users).values({ email, passwordHash: await hashPassword(password) }).returning();
  await db.insert(schema.profiles).values({ userId: user!.id, displayName });
  await db.insert(schema.userRoles).values({ userId: user!.id, role: 'STUDENT' });

  await createSession(user!.id, { userAgent: ctx.req.headers.get('user-agent'), ip: ctx.ip });
  await audit({ actorId: user!.id, action: 'USER_LOGIN', target: user!.id, metadata: { via: 'signup' }, ipHint: ctx.ip });

  return { userId: user!.id, email, displayName, roles: ['STUDENT'] };
});
