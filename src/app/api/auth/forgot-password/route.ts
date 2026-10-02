import { z } from 'zod';
import { randomBytes, createHash } from 'node:crypto';
import { sql, eq } from 'drizzle-orm';
import { handler, parse, throttle } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { audit } from '@/server/audit';
import { env } from '@/server/config/env';

const Body = z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email address.') });

/**
 * Always responds the same way, whether or not the account exists, so the
 * endpoint cannot be used to enumerate users.
 *
 * Email delivery requires a configured provider. Until one is set, the reset
 * link is surfaced to the server log ONLY in development, and the response
 * still does not reveal whether the address exists.
 */
export const POST = handler(async (ctx, body) => {
  await throttle('passwordReset', ctx.ip ?? 'unknown', ctx.ip);
  const { email } = parse(Body, body);
  const db = await getDb();

  const rows = await db.select({ id: schema.users.id }).from(schema.users)
    .where(sql`lower(${schema.users.email}) = ${email}`).limit(1);
  const user = rows[0];

  const response = { sent: true, message: 'If that address has an account, a reset link is on its way.' };
  if (!user) return response;

  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  await db.insert(schema.passwordResets).values({
    userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60 * 1000)
  });
  await audit({ actorId: user.id, action: 'PASSWORD_RESET_REQUESTED', target: user.id, ipHint: ctx.ip });

  const link = `${env.APP_URL}/reset-password?token=${token}`;
  if (env.NODE_ENV !== 'production') {
    // Dev-only convenience. In production this must go through an email provider.
    console.warn(`[auth] password reset link for ${email}: ${link}`);
  }
  return response;
});
