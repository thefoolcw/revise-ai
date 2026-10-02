import { z } from 'zod';
import { createHash } from 'node:crypto';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { handler, parse, throttle } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { hashPassword, passwordIssue } from '@/server/auth/password';
import { revokeAllSessions } from '@/server/auth/session';
import { audit } from '@/server/audit';

const Body = z.object({ token: z.string().min(20).max(200), password: z.string().min(1) });

export const POST = handler(async (ctx, body) => {
  await throttle('passwordReset', ctx.ip ?? 'unknown', ctx.ip);
  const { token, password } = parse(Body, body);

  const issue = passwordIssue(password);
  if (issue) { const e = new Error(issue); (e as any).code = 'VALIDATION_ERROR'; throw e; }

  const db = await getDb();
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const rows = await db.select().from(schema.passwordResets)
    .where(and(eq(schema.passwordResets.tokenHash, tokenHash), isNull(schema.passwordResets.usedAt), gt(schema.passwordResets.expiresAt, new Date())))
    .limit(1);
  const reset = rows[0];
  if (!reset) { const e = new Error('That reset link is invalid or has expired.'); (e as any).code = 'VALIDATION_ERROR'; throw e; }

  await db.update(schema.users).set({ passwordHash: await hashPassword(password), updatedAt: new Date() })
    .where(eq(schema.users.id, reset.userId));
  await db.update(schema.passwordResets).set({ usedAt: new Date() }).where(eq(schema.passwordResets.id, reset.id));
  await revokeAllSessions(reset.userId);
  await audit({ actorId: reset.userId, action: 'PASSWORD_RESET_COMPLETED', target: reset.userId, ipHint: ctx.ip });

  return { reset: true };
});
