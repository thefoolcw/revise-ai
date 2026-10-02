import { handler } from '@/server/api/route';
import { getDb } from '@/server/db';
import { sql } from 'drizzle-orm';
export const GET = handler(async () => {
  const t = Date.now();
  try { const db = await getDb(); await db.execute(sql`SELECT 1`); return { status: 'operational' as const, latencyMs: Date.now() - t }; }
  catch { return { status: 'unavailable' as const }; }
});
