import { handler, needRole } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { desc } from 'drizzle-orm';
import { lastCatalogRefresh } from '@/server/ai/registry';

export const GET = handler(async (ctx) => {
  needRole(ctx, 'ADMIN', 'CONTENT_EDITOR');
  const db = await getDb();
  const models = await db.select().from(schema.modelRegistry).orderBy(schema.modelRegistry.fallbackRank, schema.modelRegistry.modelId);
  const refresh = await lastCatalogRefresh();
  return { models, catalog: refresh };
});
