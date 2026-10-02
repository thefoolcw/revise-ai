import { z } from 'zod';
import { eq, and, desc, asc } from 'drizzle-orm';
import { handler, parse, needUser } from '@/server/api/route';
import { getDb, schema } from '@/server/db';

const CreateDeck = z.object({ name: z.string().trim().min(2).max(120), subjectId: z.string().max(40).optional() });

export const GET = handler(async (ctx) => {
  const u = needUser(ctx);
  const db = await getDb();
  const decks = await db.select().from(schema.flashcardDecks).where(and(eq(schema.flashcardDecks.userId, u.id), eq(schema.flashcardDecks.archived, false))).orderBy(desc(schema.flashcardDecks.createdAt));
  const cards = await db.select().from(schema.flashcards).where(eq(schema.flashcards.userId, u.id));
  const now = Date.now();
  return {
    decks: decks.map((d) => {
      const dc = cards.filter((c) => c.deckId === d.id);
      return { ...d, cardCount: dc.length, dueCount: dc.filter((c) => new Date(c.dueAt).getTime() <= now).length };
    })
  };
});

export const POST = handler(async (ctx, body) => {
  const u = needUser(ctx);
  const b = parse(CreateDeck, body);
  const db = await getDb();
  const [deck] = await db.insert(schema.flashcardDecks).values({ userId: u.id, name: b.name, subjectId: b.subjectId ?? null, source: 'MANUAL' }).returning();
  return { deck };
});
