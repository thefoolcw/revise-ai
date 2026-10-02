import { handler, needRole } from '@/server/api/route';
import { getDb, schema } from '@/server/db';

export const GET = handler(async (ctx) => {
  needRole(ctx, 'ADMIN', 'CONTENT_EDITOR');
  const db = await getDb();
  const [boards, quals] = await Promise.all([
    db.select().from(schema.examBoards),
    db.select().from(schema.qualifications)
  ]);
  return { boards, qualifications: quals };
});
