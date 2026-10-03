import { and, eq, or } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { EntitlementService } from '../premium/entitlements';

/** Never fetch teaching or answer payloads until the server has authorised access. */
export async function getLessonAccess(userId: string, idOrSlug: string) {
  const db = await getDb();
  const [metadata] = await db.select({
    id: schema.lessons.id, slug: schema.lessons.slug, title: schema.lessons.title,
    description: schema.lessons.description, yearGroup: schema.lessons.yearGroup,
    subjectId: schema.lessons.subjectId, topicSlug: schema.lessons.topicSlug,
    topicTitle: schema.lessons.topicTitle, isPremium: schema.lessons.isPremium,
    difficulty: schema.lessons.difficulty, estimatedMinutes: schema.lessons.estimatedMinutes
  }).from(schema.lessons).where(and(
    or(eq(schema.lessons.id, idOrSlug), eq(schema.lessons.slug, idOrSlug)),
    eq(schema.lessons.status, 'PUBLISHED')
  )).limit(1);
  if (!metadata) return null;
  const entitlement = await EntitlementService.hasPremium(userId);
  if (metadata.isPremium && !entitlement.hasPremium) return { metadata, locked: true as const, lesson: null };
  const [lesson] = await db.select().from(schema.lessons)
    .where(and(eq(schema.lessons.id, metadata.id), eq(schema.lessons.status, 'PUBLISHED'))).limit(1);
  if (!lesson) return null;
  // Recheck the current row in case an editor changed the access flag between reads.
  if (lesson.isPremium && !entitlement.hasPremium) return { metadata: { ...metadata, isPremium: true }, locked: true as const, lesson: null };
  return { metadata, locked: false as const, lesson };
}
