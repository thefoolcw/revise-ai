import { z } from 'zod';
import { eq, and, asc } from 'drizzle-orm';
import { handler, parse, needUser } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { gradeQuestion, type GeneratedQuestion } from '@/server/study/quiz';

const Body = z.object({ answers: z.record(z.unknown()) });

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handler(async (ctx) => {
    const u = needUser(ctx);
    const db = await getDb();
    const [quiz] = await db.select().from(schema.quizzes).where(and(eq(schema.quizzes.id, id), eq(schema.quizzes.userId, u.id))).limit(1);
    if (!quiz) { const e = new Error('Quiz not found.'); (e as any).code = 'NOT_FOUND'; throw e; }
    const qs = await db.select().from(schema.quizQuestions).where(eq(schema.quizQuestions.quizId, id)).orderBy(asc(schema.quizQuestions.orderIndex));
    // The answer key is never sent to the client before submission.
    return {
      quiz: { id: quiz.id, title: quiz.title, subjectId: quiz.subjectId },
      questions: qs.map((q) => ({
        id: q.id, type: q.type, prompt: q.prompt, options: q.options,
        difficulty: q.difficulty, topicTitle: q.topicTitle
      }))
    };
  })(req as any);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handler(async (ctx, body) => {
    const u = needUser(ctx);
    const { answers } = parse(Body, body);
    const db = await getDb();

    const [quiz] = await db.select().from(schema.quizzes).where(and(eq(schema.quizzes.id, id), eq(schema.quizzes.userId, u.id))).limit(1);
    if (!quiz) { const e = new Error('Quiz not found.'); (e as any).code = 'NOT_FOUND'; throw e; }
    const qs = await db.select().from(schema.quizQuestions).where(eq(schema.quizQuestions.quizId, id)).orderBy(asc(schema.quizQuestions.orderIndex));

    let score = 0;
    const review = qs.map((q) => {
      const given = (answers as Record<string, unknown>)[q.id];
      const correct = gradeQuestion({ type: q.type as any, prompt: q.prompt, options: q.options as any, answer: q.answer } as GeneratedQuestion, given);
      if (correct) score++;
      return {
        id: q.id, prompt: q.prompt, correct,
        given: given ?? null, expected: q.answer, explanation: q.explanation, topicTitle: q.topicTitle
      };
    });

    const [attempt] = await db.insert(schema.quizAttempts).values({
      quizId: id, userId: u.id, score, total: qs.length, answers: answers as Record<string, unknown>, submittedAt: new Date()
    }).returning();

    // Only report accuracy when there is enough data to mean something (§15).
    const accuracyPercent = qs.length > 0 ? Math.round((score / qs.length) * 100) : null;
    await db.insert(schema.analyticsEvents).values({ userId: u.id, category: 'quiz_completed', subjectId: quiz.subjectId, props: { score, total: qs.length } });

    const weakTopics = review.filter((r) => !r.correct && r.topicTitle).map((r) => r.topicTitle);
    return { attemptId: attempt!.id, score, total: qs.length, accuracyPercent, review, weakTopics: [...new Set(weakTopics)] };
  })(req as any);
}
