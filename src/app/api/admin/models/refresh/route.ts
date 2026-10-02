import { handler, needRole } from '@/server/api/route';
import { refreshModelCatalog } from '@/server/ai/registry';

export const POST = handler(async (ctx) => {
  const u = needRole(ctx, 'ADMIN', 'CONTENT_EDITOR');
  const result = await refreshModelCatalog({ actorId: u.id });
  return result;
});
