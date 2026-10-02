import { z } from 'zod';
import { handler, parse, needUser, throttle } from '@/server/api/route';
import { redeemPremiumKey } from '@/server/premium/redeem';
import { EntitlementService } from '@/server/premium/entitlements';
import { getDb, schema } from '@/server/db';
import { eq } from 'drizzle-orm';

const Body = z.object({ key: z.string().min(1).max(256) });

/**
 * The ONLY path to Premium. The browser sends a candidate key; the server
 * verifies it with JNKIE and persists the entitlement. Nothing here can be
 * satisfied by client state.
 */
export const POST = handler(async (ctx, body) => {
  const u = needUser(ctx);
  await throttle('keyVerify', u.id, ctx.ip);
  const { key } = parse(Body, body);

  const result = await redeemPremiumKey({ userId: u.id, rawKey: key, ipHint: ctx.ip });

  // Re-read from the server so the client never trusts its own optimistic state.
  const access = await EntitlementService.hasPremium(u.id);
  let entitlement = null;
  if (result.entitlementId) {
    const db = await getDb();
    const [row] = await db.select().from(schema.entitlements).where(eq(schema.entitlements.id, result.entitlementId)).limit(1);
    entitlement = row ? { id: row.id, status: row.status, source: row.source, grantedAt: row.grantedAt, expiresAt: row.expiresAt } : null;
  }

  return {
    state: result.state,
    message: result.message,
    retryable: result.retryable,
    keyHint: result.keyHint ?? null,
    entitlement,
    premium: {
      active: access.hasPremium,
      source: access.hasPremium ? (access as any).source : null,
      expiresAt: access.hasPremium ? (access as any).expiresAt : null
    }
  };
});
