import { desc, eq, and, asc, inArray } from 'drizzle-orm';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';
import { PlannerBoard, type Topic, type PlanItem } from '@/components/app/PlannerBoard';

export const metadata = { title: 'Planner' };
export const dynamic = 'force-dynamic';

export default async function PlannerPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await getDb();

  // Topics come from the learner's own selected subjects, with subject names resolved.
  const subjectIds = user.subjectIds ?? [];
  const rows = subjectIds.length === 0 ? [] : await db.select({
    id: schema.topics.id, title: schema.topics.title,
    subjectId: schema.topics.subjectId, provenance: schema.topics.provenance
  }).from(schema.topics)
    .where(and(inArray(schema.topics.subjectId, subjectIds), eq(schema.topics.status, 'PUBLISHED')))
    .orderBy(schema.topics.orderIndex).limit(120);

  const subjects = subjectIds.length === 0 ? [] : await db.select({ id: schema.subjects.id, name: schema.subjects.name })
    .from(schema.subjects).where(inArray(schema.subjects.id, subjectIds));
  const nameOf = (id: string | null) => subjects.find((s) => s.id === id)?.name ?? '';

  const [plan] = await db.select().from(schema.studyPlans)
    .where(and(eq(schema.studyPlans.userId, user.id), eq(schema.studyPlans.status, 'ACTIVE')))
    .orderBy(desc(schema.studyPlans.createdAt)).limit(1);

  const items: PlanItem[] = plan
    ? (await db.select().from(schema.studyPlanItems).where(eq(schema.studyPlanItems.planId, plan.id))
        .orderBy(asc(schema.studyPlanItems.scheduledFor), asc(schema.studyPlanItems.priority), asc(schema.studyPlanItems.createdAt)))
        .map((i, idx) => ({
          id: i.id, title: i.topicTitle, reason: i.activity, status: i.status,
          scheduledFor: i.scheduledFor ? i.scheduledFor.toISOString() : null,
          orderIndex: idx, minutes: i.durationMinutes, topicId: i.topicId
        }))
    : [];

  return (
    <PlannerBoard
      topics={rows.map((t): Topic => ({ id: t.id, title: t.title, subjectName: nameOf(t.subjectId), provenance: t.provenance }))}
      items={plan ? items : null}
      planTitle={plan?.title ?? null}
    />
  );
}
