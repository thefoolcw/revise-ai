import { z } from 'zod';
import { desc, eq, sql } from 'drizzle-orm';
import { handler, needRole } from '@/server/api/route';
import { getDb, schema } from '@/server/db';

/** Admin view of key verifications. Raw keys are never stored, so never shown. */
export const GET = handler(async (ctx) => {
  needRole(ctx, 'ADMIN', 'SUPPORT');
  const db = await getDb();
  const rows = await db.select({
    id: schema.keyVerifications.id, userId: schema.keyVerifications.userId,
    email: schema.users.email, keyHint: schema.keyVerifications.keyHint,
    state: schema.keyVerifications.state, providerStatus: schema.keyVerifications.providerStatus,
    latencyMs: schema.keyVerifications.latencyMs, verifiedAt: schema.keyVerifications.verifiedAt,
    grantedEntitlementId: schema.keyVerifications.grantedEntitlementId
  }).from(schema.keyVerifications)
    .leftJoin(schema.users, eq(schema.users.id, schema.keyVerifications.userId))
    .orderBy(desc(schema.keyVerifications.verifiedAt)).limit(100);

  const stats = await db.execute(sql`
    SELECT COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE state='VERIFIED')::int AS verified,
           COUNT(*) FILTER (WHERE state='INVALID')::int AS invalid,
           COUNT(*) FILTER (WHERE state='EXPIRED')::int AS expired,
           COUNT(*) FILTER (WHERE state='ALREADY_USED')::int AS already_used,
           COUNT(*) FILTER (WHERE state='SERVICE_UNAVAILABLE')::int AS unavailable
    FROM key_verifications`);
  return { verifications: rows, stats: stats.rows[0] };
});
