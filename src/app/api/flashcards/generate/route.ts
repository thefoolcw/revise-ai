import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { handler, parse, needUser, throttle } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { generateText } from '@/server/ai/gateway';
import { composeMessages, promptVersion } from '@/server/ai/prompts';
import { checkLimit, recordUsage } from '@/server/usage/ledger';

const Body = z.object({
  deckId: z.string().uuid(),
  topicTitle: z.string().trim().min(2).max(160).optional(),
  sourceText: z.string().trim().max(12000).optional(),
  count: z.number().int().min(3).max(30).default(10)
});

/** AI card generation with validation: no duplicate fronts, no answer leakage. */
export const POST = handler(async (ctx, body) => {
  const u = needUser(ctx);
  const limit = await checkLimit(u.id, 'flashcard_generation');
  if (!limit.allowed) { const e = new Error(limit.message); (e as any).code = 'USAGE_LIMIT'; throw e; }
  await throttle('aiChat', u.id, ctx.ip);
  const b = parse(Body, body);

  const db = await getDb();
  const [deck] = await db.select().from(schema.flashcardDecks).where(and(eq(schema.flashcardDecks.id, b.deckId), eq(schema.flashcardDecks.userId, u.id))).limit(1);
  if (!deck) { const e = new Error('Deck not found.'); (e as any).code = 'NOT_FOUND'; throw e; }

  const prompt = b.sourceText
    ? `Create exactly ${b.count} flashcards from the material below. Return JSON {"cards":[{"front":"...","back":"...","hint":"..."}]}\n\nMATERIAL BEGIN\n${b.sourceText}\nMATERIAL END`
    : `Create exactly ${b.count} flashcards${b.topicTitle ? ` on "${b.topicTitle}"` : ''}. Return JSON {"cards":[{"front":"...","back":"...","hint":"..."}]}`;

  const result = await generateText({
    userId: u.id, feature: 'FLASHCARDS', task: 'STRUCTURED_OUTPUT',
    messages: composeMessages({ task: 'flashcards', context: { topic: b.topicTitle, subject: deck.subjectId ?? undefined, explainLevel: u.explainLevel } }, prompt),
    promptVersion: promptVersion('flashcards'), maxTokens: 2400, responseFormat: 'json'
  });
  if (!result.ok) { const e = new Error(result.message); (e as any).code = result.code; throw e; }

  let cards: { front?: unknown; back?: unknown; hint?: unknown }[] = [];
  try {
    const j = JSON.parse(result.text);
    cards = Array.isArray(j) ? j : (j.cards ?? []);
  } catch {
    const e = new Error('The model did not return valid cards. Please try again.'); (e as any).code = 'AI_PROVIDER_ERROR'; throw e;
  }

  const existing = await db.select({ front: schema.flashcards.front }).from(schema.flashcards).where(eq(schema.flashcards.deckId, b.deckId));
  const seen = new Set(existing.map((c) => c.front.trim().toLowerCase()));

  let added = 0, rejected = 0;
  for (const c of cards) {
    if (added >= (b.count ?? 10)) break;
    const front = typeof c.front === 'string' ? c.front.trim() : '';
    const back = typeof c.back === 'string' ? c.back.trim() : '';
    if (front.length < 3 || back.length < 2) { rejected++; continue; }
    const key = front.toLowerCase();
    if (seen.has(key)) { rejected++; continue; }
    if (back.toLowerCase().includes(front.toLowerCase()) && front.length > 6) { rejected++; continue; } // answer on front
    seen.add(key);
    await db.insert(schema.flashcards).values({
      deckId: b.deckId, userId: u.id, type: 'BASIC', front, back,
      hint: typeof c.hint === 'string' ? c.hint.slice(0, 300) : null, tags: ['ai-generated']
    });
    added++;
  }

  if (added > 0) await recordUsage({ userId: u.id, metric: 'flashcard_generation', amount: 1, feature: 'FLASHCARDS', requestId: result.requestId });
  return { added, rejected, modelUsed: result.modelUsed };
});
