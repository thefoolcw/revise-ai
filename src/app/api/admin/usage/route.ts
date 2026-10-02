import { sql } from 'drizzle-orm';
import { handler, needRole } from '@/server/api/route';
import { getDb } from '@/server/db';

export const GET = handler(async (ctx) => {
  needRole(ctx, 'ADMIN', 'ANALYST');
  const db = await getDb();
  const since = new Date(Date.now() - 29 * 864e5);

  const [byFeature, byDay, byModel, topUsers] = await Promise.all([
    db.execute(sql`SELECT feature, COUNT(*)::int AS n, COALESCE(SUM(amount),0)::int AS amount
      FROM usage_ledger WHERE created_at >= ${since} GROUP BY feature ORDER BY n DESC`),
    db.execute(sql`SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::int AS n
      FROM usage_ledger WHERE created_at >= ${since} GROUP BY 1 ORDER BY 1`),
    db.execute(sql`SELECT COALESCE(model_id,'(unknown)') AS model, COUNT(*)::int AS n,
      COALESCE(SUM(amount) FILTER (WHERE metric = 'input_tokens'),0)::int AS input_tokens,
      COALESCE(SUM(amount) FILTER (WHERE metric = 'output_tokens'),0)::int AS output_tokens
      FROM usage_ledger WHERE created_at >= ${since} GROUP BY 1 ORDER BY n DESC LIMIT 20`),
    db.execute(sql`SELECT u.email, COUNT(*)::int AS n FROM usage_ledger ul
      JOIN users u ON u.id = ul.user_id WHERE ul.created_at >= ${since}
      GROUP BY u.email ORDER BY n DESC LIMIT 15`)
  ]);

  const rows = (r: unknown) => (r as { rows?: unknown[] }).rows ?? r;
  return { windowDays: 30, byFeature: rows(byFeature), byDay: rows(byDay), byModel: rows(byModel), topUsers: rows(topUsers) };
});
