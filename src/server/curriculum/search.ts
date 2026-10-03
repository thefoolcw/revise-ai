import { z } from 'zod';
import { and, eq, ilike, or, sql } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { getYearMeta } from './types';

export const LessonSearch = z.object({
  year: z.string().refine(y => !!getYearMeta(y), 'Choose a supported year.'),
  q: z.string().trim().max(120).optional(),
  subject: z.string().max(40).optional(),
  topic: z.string().trim().max(120).optional(),
  difficulty: z.enum(['', 'Foundation', 'Core', 'Higher', 'Advanced']).optional(),
  access: z.enum(['', 'free', 'premium']).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1)
});
export type LessonSearchInput = z.input<typeof LessonSearch>;
export async function searchLessons(input: LessonSearchInput) {
  const query = LessonSearch.parse(input);
  const db = await getDb();
  const like = (value: string) => `%${value.replace(/[\\%_]/g, '\\$&')}%`;
  const l = schema.lessons;
  const where = and(eq(l.status, 'PUBLISHED'), eq(l.yearGroup, query.year),
    query.subject ? eq(l.subjectId, query.subject) : undefined,
    query.topic ? ilike(l.topicTitle, like(query.topic)) : undefined,
    query.difficulty ? eq(l.difficulty, query.difficulty) : undefined,
    query.access ? eq(l.isPremium, query.access === 'premium') : undefined,
    query.q ? or(ilike(l.title, like(query.q)), ilike(l.description, like(query.q)), ilike(l.topicTitle, like(query.q)), ilike(l.subtopicTitle, like(query.q))) : undefined
  );
  // Explicit metadata projection: Premium body, examples and answers cannot leak through search.
  const [items, count] = await Promise.all([
    db.select({ id: l.id, slug: l.slug, title: l.title, description: l.description,
      yearGroup: l.yearGroup, subjectId: l.subjectId, topicTitle: l.topicTitle,
      topicSlug: l.topicSlug, difficulty: l.difficulty, isPremium: l.isPremium,
      estimatedMinutes: l.estimatedMinutes
    }).from(l).where(where).orderBy(l.subjectId, l.orderIndex, l.id).limit(30).offset((query.page - 1) * 30),
    db.select({ n: sql<number>`count(*)::int` }).from(l).where(where)
  ]);
  return { items, total: count[0]?.n ?? 0, page: query.page, pageSize: 30 };
}
