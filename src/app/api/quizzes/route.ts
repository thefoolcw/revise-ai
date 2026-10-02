import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { handler, parse, needUser, throttle } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { generateText } from '@/server/ai/gateway';
import { composeMessages, promptVersion } from '@/server/ai/prompts';
import { checkLimit, recordUsage } from '@/server/usage/ledger';
import { sanitiseQuiz } from '@/server/study/quiz';

const Body = z.object({
  title: z.string().trim().min(2).max(120),
  subjectId: z.string().max(40).optional(),
  topicTitle: z.string().max(160).optional(),
  count: z.number().int().min(3).max(20).default(8),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'MIXED']).default('MIXED'),
  modelId: z.string().max(160).optional()
});

export async function GET(req: Request) {
  return handler(async (ctx) => {
    const u = needUser(ctx);
    const db = await getDb();
    const rows = await db.select().from(schema.quizzes).where(eq(schema.quizzes.userId, u.id)).orderBy(desc(schema.quizzes.createdAt)).limit(50);
    return { quizzes: rows };
  })(req as any);
}

export const POST = handler(async (ctx, body) => {
  const u = needUser(ctx);
  const limit = await checkLimit(u.id, 'quiz_generation');
  if (!limit.allowed) { const e = new Error(limit.message); (e as any).code = 'USAGE_LIMIT'; throw e; }
  await throttle('aiChat', u.id, ctx.ip);
  const b = parse(Body, body);

  const messages = composeMessages(
    { task: 'quiz', context: { subject: b.subjectId, topic: b.topicTitle, explainLevel: u.explainLevel, examBoard: u.examBoardId, qualification: u.qualificationId } },
    `Create exactly ${b.count ?? 10} ${b.difficulty === 'MIXED' ? 'mixed-difficulty' : (b.difficulty ?? 'MIXED').toLowerCase() + '-difficulty'} questions${b.topicTitle ? ` on "${b.topicTitle}"` : ''}. Return JSON: {"questions":[...]}. Each question needs type, prompt, options (id+label), answer, explanation.`
  );

  const result = await generateText({
    userId: u.id, feature: 'QUIZ', task: 'STRUCTURED_OUTPUT', messages,
    requestedModelId: b.modelId ?? null, promptVersion: promptVersion('quiz'),
    maxTokens: 2600, responseFormat: 'json'
  });
  if (!result.ok) { const e = new Error(result.message); (e as any).code = result.code; throw e; }

  let parsed: unknown = [];
  try {
    const j = JSON.parse(result.text);
    parsed = Array.isArray(j) ? j : (j.questions ?? []);
  } catch {
    const e = new Error('The model did not return valid questions. Please try again.');
    (e as any).code = 'AI_PROVIDER_ERROR'; throw e;
  }

  const { questions, rejected } = sanitiseQuiz(parsed as unknown[], b.count);
  if (questions.length === 0) {
    const e = new Error('The generated questions did not pass validation. Please try again.');
    (e as any).code = 'AI_PROVIDER_ERROR'; throw e;
  }

  const db = await getDb();
  const [quiz] = await db.insert(schema.quizzes).values({
    userId: u.id, title: b.title, subjectId: b.subjectId ?? null, source: 'GENERATED'
  }).returning();

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]!;
    await db.insert(schema.quizQuestions).values({
      quizId: quiz!.id, type: q.type, prompt: q.prompt, options: q.options ?? [],
      answer: q.answer, explanation: q.explanation ?? null, difficulty: q.difficulty ?? 'MEDIUM',
      topicTitle: b.topicTitle ?? null, orderIndex: i
    });
  }
  await recordUsage({ userId: u.id, metric: 'quiz_generation', amount: 1, feature: 'QUIZ', requestId: result.requestId });
  await db.insert(schema.analyticsEvents).values({ userId: u.id, category: 'quiz_started', subjectId: b.subjectId ?? null });

  return { quizId: quiz!.id, questionCount: questions.length, rejected, modelUsed: result.modelUsed };
});
