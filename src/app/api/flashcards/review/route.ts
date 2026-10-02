import { z } from 'zod';
import { eq, and, asc, lte } from 'drizzle-orm';
import { handler, parse, needUser } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { schedule, dueDate } from '@/server/study/srs';

const Body = z.object({
  deckId: z.string().uuid().optional(),
  cardId: z.string().uuid(),
  rating: z.enum(['AGAIN', 'HARD', 'GOOD', 'EASY'])
});

export const GET = handler(async (ctx) => {
  const u = needUser(ctx);
  const url = new URL(ctx.req.url);
  const deckId = url.searchParams.get('deckId');
  const db = await getDb();
  const cond = deckId
    ? and(eq(schema.flashcards.userId, u.id), eq(schema.flashcards.deckId, deckId), lte(schema.flashcards.dueAt, new Date()))
    : and(eq(schema.flashcards.userId, u.id), lte(schema.flashcards.dueAt, new Date()));
  const due = await db.select().from(schema.flashcards).where(cond).orderBy(asc(schema.flashcards.dueAt)).limit(30);
  return { due, count: due.length };
});

export const POST = handler(async (ctx, body) => {
  const u = needUser(ctx);
  const b = parse(Body, body);
  const db = await getDb();

  const [card] = await db.select().from(schema.flashcards)
    .where(and(eq(schema.flashcards.id, b.cardId), eq(schema.flashcards.userId, u.id))).limit(1);
  if (!card) { const e = new Error('Card not found.'); (e as any).code = 'NOT_FOUND'; throw e; }

  const before = { ease: card.ease, intervalDays: card.intervalDays, repetitions: card.repetitions, lapses: card.lapses };
  const next = schedule(before, b.rating);
  const now = new Date();

  await db.update(schema.flashcards).set({
    ease: next.ease, intervalDays: next.intervalDays, repetitions: next.repetitions,
    lapses: next.lapses, dueAt: dueDate(now, next.dueInDays), updatedAt: now
  }).where(eq(schema.flashcards.id, card.id));

  // Every review event is stored so the scheduler can be improved later.
  await db.insert(schema.flashcardReviews).values({
    cardId: card.id, userId: u.id, rating: b.rating,
    easeBefore: before.ease, intervalBefore: before.intervalDays,
    easeAfter: next.ease, intervalAfter: next.intervalDays
  });
  await db.insert(schema.analyticsEvents).values({ userId: u.id, category: 'flashcard_reviewed', props: { rating: b.rating } });

  return { cardId: card.id, next, dueAt: dueDate(now, next.dueInDays).toISOString() };
});
