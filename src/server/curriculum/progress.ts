import { desc, eq, sql } from 'drizzle-orm';
import { getDb, schema } from '../db';

export async function getLessonProgressSummary(userId: string) {
  const db = await getDb();
  const [counts, recent] = await Promise.all([
    db.select({ started: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${schema.lessonProgress.status} = 'COMPLETED')::int`,
      attempted: sql<number>`coalesce(sum(${schema.lessonProgress.practiceAttempted}), 0)::int`,
      confident: sql<number>`coalesce(sum(${schema.lessonProgress.practiceCorrect}), 0)::int`
    }).from(schema.lessonProgress).where(eq(schema.lessonProgress.userId, userId)),
    db.select({ lessonId: schema.lessonProgress.lessonId, status: schema.lessonProgress.status,
      year: schema.lessonProgress.yearGroup, lastVisitedAt: schema.lessonProgress.lastVisitedAt,
      title: schema.lessons.title, slug: schema.lessons.slug
    }).from(schema.lessonProgress).innerJoin(schema.lessons, eq(schema.lessons.id, schema.lessonProgress.lessonId))
      .where(eq(schema.lessonProgress.userId, userId)).orderBy(desc(schema.lessonProgress.lastVisitedAt)).limit(10)
  ]);
  return { ...(counts[0] ?? { started: 0, completed: 0, attempted: 0, confident: 0 }), recent, assessmentType: 'SELF_ASSESSED' as const };
}
