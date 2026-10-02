import { z } from 'zod';
import { handler, parse, needUser, throttle } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { generateText } from '@/server/ai/gateway';
import { composeMessages, promptVersion } from '@/server/ai/prompts';
import { checkLimit } from '@/server/usage/ledger';
import { extractExpression, evaluate } from '@/server/study/mathverify';

const Body = z.object({
  question: z.string().trim().min(3, 'Enter the question you want solved.').max(20000),
  subjectId: z.string().max(40).optional(),
  topicTitle: z.string().max(160).optional(),
  modelId: z.string().max(160).optional()
});

/**
 * Universal solver. Deterministic arithmetic is verified here rather than
 * trusting model maths (§96); the model supplies the explanation.
 */
export const POST = handler(async (ctx, body) => {
  const u = needUser(ctx);
  const limit = await checkLimit(u.id, 'ai_requests');
  if (!limit.allowed) { const e = new Error(limit.message); (e as any).code = 'USAGE_LIMIT'; throw e; }
  await throttle('aiSolve', u.id, ctx.ip);
  const b = parse(Body, body);

  // Deterministic pre-check where the stem contains an explicit calculation.
  let arithmeticCheck: { expression: string; value: number } | null = null;
  const expr = extractExpression(b.question);
  if (expr) {
    try { arithmeticCheck = { expression: expr, value: evaluate(expr) }; } catch { arithmeticCheck = null; }
  }

  const messages = composeMessages(
    { task: 'solve', context: { subject: b.subjectId, topic: b.topicTitle, explainLevel: u.explainLevel, examBoard: u.examBoardId, qualification: u.qualificationId } },
    b.question + (arithmeticCheck ? `\n\n[Revise AI calculator] ${arithmeticCheck.expression} = ${arithmeticCheck.value}. Use this value; do not recompute it differently.` : '')
  );

  const result = await generateText({
    userId: u.id, feature: 'SOLVE', task: 'SOLVE_MATHS', messages,
    requestedModelId: b.modelId ?? u.defaultModelId ?? null,
    promptVersion: promptVersion('solver'), maxTokens: 1600
  });
  if (!result.ok) { const e = new Error(result.message); (e as any).code = result.code; throw e; }

  const db = await getDb();
  const [q] = await db.insert(schema.questions).values({
    userId: u.id, source: 'USER', prompt: b.question,
    subjectId: b.subjectId ?? null, topicTitle: b.topicTitle ?? null
  }).returning();

  await db.insert(schema.analyticsEvents).values({ userId: u.id, category: 'question_answered', subjectId: b.subjectId ?? null });

  return {
    questionId: q!.id,
    answer: result.text,
    modelUsed: result.modelUsed,
    fallbackUsed: result.fallbackUsed,
    fallbackNotice: result.fallbackNotice,
    arithmeticCheck,
    usage: result.usage,
    requestId: result.requestId
  };
});
