import { z } from 'zod';
import { eq, and, asc, desc } from 'drizzle-orm';
import { handler, parse, needUser } from '@/server/api/route';
import { getDb, schema } from '@/server/db';

export const GET = handler(async (ctx) => {
  const u = needUser(ctx);
  const db = await getDb();
  const [plan] = await db.select().from(schema.studyPlans)
    .where(and(eq(schema.studyPlans.userId, u.id), eq(schema.studyPlans.status, 'ACTIVE')))
    .orderBy(desc(schema.studyPlans.createdAt)).limit(1);
  if (!plan) return { plan: null, items: [], health: 'NO_PLAN' as const };

  const items = await db.select().from(schema.studyPlanItems)
    .where(eq(schema.studyPlanItems.planId, plan.id)).orderBy(asc(schema.studyPlanItems.scheduledFor));

  const done = items.filter((i) => i.status === 'DONE').length;
  const planned = items.filter((i) => i.status === 'PLANNED').length;
  const missed = items.filter((i) => i.status === 'MISSED' && new Date(i.scheduledFor) < new Date()).length;
  const health = items.length === 0 ? 'EMPTY' : missed > done ? 'BEHIND' : planned === 0 ? 'ON_TRACK' : 'ON_TRACK';

  return { plan, items, health, summary: { done, planned, missed, total: items.length } };
});

const Patch = z.object({
  itemId: z.string().uuid(),
  action: z.enum(['COMPLETE', 'SKIP', 'RESCHEDULE']),
  scheduledFor: z.string().optional(),
  notes: z.string().max(500).optional()
});

export const PATCH = handler(async (ctx, body) => {
  const u = needUser(ctx);
  const b = parse(Patch, body);
  const db = await getDb();
  const [item] = await db.select().from(schema.studyPlanItems)
    .where(and(eq(schema.studyPlanItems.id, b.itemId), eq(schema.studyPlanItems.userId, u.id))).limit(1);
  if (!item) { const e = new Error('Plan item not found.'); (e as any).code = 'NOT_FOUND'; throw e; }

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (b.action === 'COMPLETE') { update.status = 'DONE'; update.completedAt = new Date(); }
  else if (b.action === 'SKIP') { update.status = 'SKIPPED'; }
  else if (b.action === 'RESCHEDULE') {
    const d = b.scheduledFor ? new Date(b.scheduledFor) : null;
    if (!d || Number.isNaN(d.getTime())) { const e = new Error('Provide a valid date.'); (e as any).code = 'VALIDATION_ERROR'; throw e; }
    update.scheduledFor = d; update.status = 'PLANNED';
  }
  if (b.notes !== undefined) update.notes = b.notes;

  await db.update(schema.studyPlanItems).set(update).where(eq(schema.studyPlanItems.id, item.id));
  if (b.action === 'COMPLETE') {
    await db.insert(schema.analyticsEvents).values({ userId: u.id, category: 'plan_item_completed', topicId: item.topicId });
  }
  return { updated: true, itemId: item.id };
});
