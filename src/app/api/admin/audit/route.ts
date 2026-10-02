import { desc } from 'drizzle-orm';
import { handler, needRole } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
export const GET = handler(async (ctx) => {
  needRole(ctx, 'ADMIN', 'SUPPORT');
  const db = await getDb();
  const rows = await db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.createdAt)).limit(200);
  return { events: rows };
});
