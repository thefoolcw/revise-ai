import { desc, sql } from 'drizzle-orm';
import { handler, needRole } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
export const GET = handler(async (ctx) => {
  needRole(ctx, 'ADMIN', 'SUPPORT');
  const db = await getDb();
  const rows = await db.execute(sql`
    SELECT u.id, u.email, u.created_at, u.status,
           p.display_name, p.age_band, p.country,
           COALESCE(array_agg(DISTINCT r.role) FILTER (WHERE r.role IS NOT NULL), '{}') AS roles,
           EXISTS (SELECT 1 FROM entitlements e WHERE e.user_id = u.id AND e.status='ACTIVE') AS premium
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    LEFT JOIN user_roles r ON r.user_id = u.id
    WHERE u.deleted_at IS NULL
    GROUP BY u.id, u.email, u.created_at, u.status, p.display_name, p.age_band, p.country
    ORDER BY u.created_at DESC LIMIT 100`);
  return { users: rows.rows };
});
