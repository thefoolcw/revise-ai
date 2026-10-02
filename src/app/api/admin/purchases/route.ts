import { sql } from 'drizzle-orm';
import { handler, needRole } from '@/server/api/route';
import { getDb } from '@/server/db';

/**
 * Purchase/fulfilment ledger. Deliberately excludes any key value — only the
 * hash prefix, the four-character hint and the provider reference are shown.
 */
export const GET = handler(async (ctx) => {
  needRole(ctx, 'ADMIN', 'SUPPORT');
  const db = await getDb();
  const rows = await db.execute(sql`
    SELECT kv.id, kv.state AS status, kv.key_hint, kv.created_at AS verified_at,
           kv.provider_reference AS provider_ref,
           e.product_slug, e.status AS entitlement_status, e.granted_at, e.revoked_at, e.revoke_reason,
           u.email
    FROM key_verifications kv
    LEFT JOIN entitlements e ON e.id = kv.granted_entitlement_id
    LEFT JOIN users u ON u.id = kv.user_id
    ORDER BY kv.created_at DESC NULLS LAST
    LIMIT 200`);
  const totals = await db.execute(sql`
    SELECT state AS status, COUNT(*)::int AS n FROM key_verifications GROUP BY state ORDER BY n DESC`);
  return { rows: (rows as unknown as { rows: unknown[] }).rows, totals: (totals as unknown as { rows: unknown[] }).rows };
});
