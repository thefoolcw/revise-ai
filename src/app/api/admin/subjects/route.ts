import { handler, needRole } from '@/server/api/route';
import { getDb, schema } from '@/server/db';

export const GET = handler(async (ctx) => {
  needRole(ctx, 'ADMIN', 'CONTENT_EDITOR');
  const db = await getDb();
  const [subjects, topics, aliases] = await Promise.all([
    db.select().from(schema.subjects),
    db.select({ id: schema.topics.id, title: schema.topics.title, subjectId: schema.topics.subjectId, provenance: schema.topics.provenance, status: schema.topics.status }).from(schema.topics),
    db.select({ alias: schema.subjectAliases.alias, subjectId: schema.subjectAliases.subjectId }).from(schema.subjectAliases)
  ]);
  const topicCount = new Map<string, number>();
  for (const t of topics) topicCount.set(t.subjectId ?? '', (topicCount.get(t.subjectId ?? '') ?? 0) + 1);
  return {
    subjects: subjects.map((s) => ({ ...s, topicCount: topicCount.get(s.id) ?? 0 })),
    aliases
  };
});
