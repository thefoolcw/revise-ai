import { z } from 'zod';
import { eq, and, or, ilike, desc } from 'drizzle-orm';
import { handler, needUser } from '@/server/api/route';
import { getDb, schema } from '@/server/db';

const Query = z.object({ q: z.string().trim().min(2).max(120) });

/** Global search, always scoped to the caller's own rows (§17). */
export const GET = handler(async (ctx) => {
  const u = needUser(ctx);
  const { q } = Query.parse({ q: new URL(ctx.req.url).searchParams.get('q') ?? '' });
  const db = await getDb();
  const like = `%${q}%`;

  const [notes, decks, quizzes, convs, topics, subjects] = await Promise.all([
    db.select({ id: schema.notes.id, title: schema.notes.title, kind: schema.notes.tags }).from(schema.notes)
      .where(and(eq(schema.notes.userId, u.id), or(ilike(schema.notes.title, like), ilike(schema.notes.body, like)))).limit(8),
    db.select({ id: schema.flashcardDecks.id, title: schema.flashcardDecks.name }).from(schema.flashcardDecks)
      .where(and(eq(schema.flashcardDecks.userId, u.id), ilike(schema.flashcardDecks.name, like))).limit(6),
    db.select({ id: schema.quizzes.id, title: schema.quizzes.title }).from(schema.quizzes)
      .where(and(eq(schema.quizzes.userId, u.id), ilike(schema.quizzes.title, like))).limit(6),
    db.select({ id: schema.aiConversations.id, title: schema.aiConversations.title }).from(schema.aiConversations)
      .where(and(eq(schema.aiConversations.userId, u.id), ilike(schema.aiConversations.title, like))).limit(6),
    db.select({ id: schema.topics.id, title: schema.topics.title, subjectId: schema.topics.subjectId }).from(schema.topics)
      .where(ilike(schema.topics.title, like)).limit(8),
    db.select({ id: schema.subjects.id, title: schema.subjects.name }).from(schema.subjects)
      .where(ilike(schema.subjects.name, like)).limit(5)
  ]);

  return {
    query: q,
    results: {
      notes: notes.map((n) => ({ id: n.id, title: n.title, type: 'note' as const })),
      decks: decks.map((d) => ({ id: d.id, title: d.title, type: 'deck' as const })),
      quizzes: quizzes.map((x) => ({ id: x.id, title: x.title, type: 'quiz' as const })),
      conversations: convs.map((c) => ({ id: c.id, title: c.title, type: 'conversation' as const })),
      topics: topics.map((t) => ({ id: t.id, title: t.title, type: 'topic' as const })),
      subjects: subjects.map((s) => ({ id: s.id, title: s.title, type: 'subject' as const }))
    }
  };
});
