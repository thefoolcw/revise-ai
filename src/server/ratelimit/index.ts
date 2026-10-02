import { sql } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { env } from '../config/env';

export type RouteLimit = { limit: number; windowSeconds: number };

export const LIMITS = {
  login: { limit: 8, windowSeconds: 300 },
  signup: { limit: 5, windowSeconds: 900 },
  passwordReset: { limit: 5, windowSeconds: 900 },
  aiChat: { limit: 30, windowSeconds: 300 },
  aiSolve: { limit: 20, windowSeconds: 300 },
  keyVerify: { limit: 6, windowSeconds: 600 },
  upload: { limit: 10, windowSeconds: 900 },
  generic: { limit: 120, windowSeconds: 60 }
} as const satisfies Record<string, RouteLimit>;

/**
 * Fixed-window counter persisted in the database, so limits hold across
 * instances and survive restarts. Rate limiting is a throttle, never an
 * authorisation check.
 */
export async function checkRateLimit(
  route: keyof typeof LIMITS,
  identity: string,
  ip: string | null
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const cfg = LIMITS[route];
  const scale = env.RATE_LIMIT_SCALE;
  const limit = Math.max(1, Math.round(cfg.limit * scale));
  const bucket = `rl:${route}:${identity}`;
  const db = await getDb();
  const now = new Date();
  const windowMs = cfg.windowSeconds * 1000;

  const rows = await db
    .select()
    .from(schema.rateLimits)
    .where(sql`${schema.rateLimits.bucket} = ${bucket}`)
    .limit(1);
  const existing = rows[0];

  const stale = !existing || now.getTime() - new Date(existing.windowStart).getTime() > windowMs;
  if (stale) {
    await db
      .insert(schema.rateLimits)
      .values({ bucket, count: 1, windowStart: now })
      .onConflictDoUpdate({ target: schema.rateLimits.bucket, set: { count: 1, windowStart: now } });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: cfg.windowSeconds };
  }

  const next = existing.count + 1;
  const elapsed = now.getTime() - new Date(existing.windowStart).getTime();
  const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - elapsed) / 1000));

  if (next > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }
  await db
    .update(schema.rateLimits)
    .set({ count: next })
    .where(sql`${schema.rateLimits.bucket} = ${bucket}`);
  return { allowed: true, remaining: limit - next, retryAfterSeconds };
}
