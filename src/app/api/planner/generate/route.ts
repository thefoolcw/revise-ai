import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import { handler, parse, needUser } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { allocate, rankTopics } from '@/server/study/planner';

const Body = z.object({
  title: z.string().trim().min(2).max(120),
  targetDate: z.string().min(8),
  hoursPerWeek: z.number().min(0.5).max(70),
  sessionMinutes: z.number().int().min(10).max(180),
  restDays: z.array(z.number().int().min(0).max(6)).max(7).default([]),
  topicIds: z.array(z.string().max(60)).min(1).max(40)
});

/**
 * Generates a plan from real attempt data. Weakness weighting uses only topics
 * with enough attempts to be meaningful, so the plan is explainable.
 */
export const POST = handler(async (ctx, body) => {
  const u = needUser(ctx);
  const b = parse(Body, body);
  const db = await getDb();

  const targetDate = new Date(b.targetDate);
  if (Number.isNaN(targetDate.getTime())) { const e = new Error('Enter a valid target date.'); (e as any).code = 'VALIDATION_ERROR'; throw e; }
  if (targetDate.getTime() <= Date.now()) { const e = new Error('Choose a target date in the future.'); (e as any).code = 'VALIDATION_ERROR'; throw e; }

  const topics = await db.select().from(schema.topics).where(sql`${schema.topics.id} = ANY(${b.topicIds})`);
  if (topics.length === 0) { const e = new Error('Select at least one topic.'); (e as any).code = 'VALIDATION_ERROR'; throw e; }

  // Real performance signal, computed from attempts the learner actually made.
  const perf = await db.execute(
    sql`SELECT q.topic_id AS topic_id,
               COUNT(*)::int AS attempts,
               COUNT(*) FILTER (WHERE qa.correct = false)::int AS mistakes
        FROM question_attempts qa
        JOIN questions q ON q.id = qa.question_id
        WHERE qa.user_id = ${u.id} AND q.topic_id IS NOT NULL
        GROUP BY q.topic_id`
  );
  const perfMap = new Map(perf.rows.map((r: any) => [r.topic_id as string, { attempts: Number(r.attempts), mistakes: Number(r.mistakes) }]));

  const planTopics = topics.map((t) => {
    const p = perfMap.get(t.id);
    return { id: t.id, title: t.title, subjectId: t.subjectId, attempts: p?.attempts ?? 0, mistakes: p?.mistakes ?? 0 };
  });

  const result = allocate({
    topics: planTopics, targetDate, hoursPerWeek: b.hoursPerWeek,
    sessionMinutes: b.sessionMinutes, restDays: b.restDays
  });

  // Retire any previous active plan for this user rather than stacking them.
  await db.update(schema.studyPlans).set({ status: 'SUPERSEDED', updatedAt: new Date() })
    .where(and(eq(schema.studyPlans.userId, u.id), eq(schema.studyPlans.status, 'ACTIVE')));

  const [plan] = await db.insert(schema.studyPlans).values({
    userId: u.id, title: b.title, targetDate, hoursPerWeek: b.hoursPerWeek,
    sessionMinutes: b.sessionMinutes, restDays: b.restDays, status: 'ACTIVE'
  }).returning();

  for (const item of result.items) {
    await db.insert(schema.studyPlanItems).values({
      planId: plan!.id, userId: u.id, scheduledFor: item.scheduledFor,
      subjectId: item.subjectId, topicId: item.topicId, topicTitle: item.topicTitle,
      activity: item.activity, durationMinutes: item.durationMinutes,
      priority: item.priority, status: 'PLANNED', notes: item.reasonCode
    });
  }
  await db.insert(schema.analyticsEvents).values({ userId: u.id, category: 'plan_created', props: { items: result.items.length, health: result.health } });

  return {
    planId: plan!.id,
    itemCount: result.items.length,
    totalMinutes: result.totalMinutes,
    availableMinutes: result.availableMinutes,
    health: result.health,
    warnings: result.warnings,
    ranking: rankTopics(planTopics).slice(0, 6).map((t) => ({ id: t.id, title: t.title, score: t.score, attempts: t.attempts }))
  };
});
