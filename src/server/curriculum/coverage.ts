import { eq, sql } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { ALL_YEAR_GROUPS } from './types';

/** Database coverage, not a claim based on builders or static year definitions. */
export async function getCurriculumCoverage() {
  const db = await getDb();
  const groups = await db.select({ year: schema.lessons.yearGroup, subject: schema.lessons.subjectId,
    topic: schema.lessons.topicSlug, lessons: sql<number>`count(*)::int`,
    free: sql<number>`count(*) filter (where not ${schema.lessons.isPremium})::int`,
    premium: sql<number>`count(*) filter (where ${schema.lessons.isPremium})::int`
  }).from(schema.lessons).where(eq(schema.lessons.status, 'PUBLISHED'))
    .groupBy(schema.lessons.yearGroup, schema.lessons.subjectId, schema.lessons.topicSlug);
  return ALL_YEAR_GROUPS.map(year => {
    const subjects = year.subjectIds.map(subject => {
      const topics = groups.filter(g => g.year === year.id && g.subject === subject);
      return { subject, topics: topics.length, lessons: topics.reduce((n, t) => n + t.lessons, 0),
        covered: topics.length >= 2 && topics.every(t => t.lessons >= 2 && t.free > 0 && t.premium > 0) };
    });
    return { year: year.id, label: year.fullLabel, subjects, coveredSubjects: subjects.filter(s => s.covered).length,
      lessons: subjects.reduce((n, s) => n + s.lessons, 0) };
  });
}
