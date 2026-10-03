import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { handler, needUser } from '@/server/api/route';
import { fail } from '@/server/api/respond';
import { getDb, schema } from '@/server/db';
import { getLessonAccess } from '@/server/curriculum/access';
import type { PracticeQuestion } from '@/server/curriculum/types';

const Input = z.object({
  lessonId: z.string().min(1).max(500),
  completed: z.boolean().default(false),
  // Authored open-ended activities are explicitly self/guardian assessed, not exam marks.
  assessments: z.record(z.enum(['REVIEW', 'CONFIDENT'])).default({})
});
export const POST = handler(async (ctx, body) => {
  const user = needUser(ctx);
  const input = Input.parse(body);
  const access = await getLessonAccess(user.id, input.lessonId);
  if (!access) return fail('NOT_FOUND', 'Lesson not found.', ctx.requestId, 404);
  if (access.locked) return fail('FORBIDDEN', 'This lesson is part of REVise Premium.', ctx.requestId, 403);
  const questions = access.lesson.practiceQuestions as PracticeQuestion[];
  const allowed = new Set(questions.map(q => q.id));
  if (Object.keys(input.assessments).some(id => !allowed.has(id))) {
    return fail('VALIDATION_ERROR', 'Unknown practice question.', ctx.requestId, 422);
  }
  const attempted = Object.keys(input.assessments).length;
  const correct = Object.values(input.assessments).filter(a => a === 'CONFIDENT').length;
  const now = new Date();
  const db = await getDb();
  const values = {
    userId: user.id, lessonId: access.metadata.id, subjectId: access.metadata.subjectId,
    yearGroup: access.metadata.yearGroup, status: input.completed ? 'COMPLETED' : 'IN_PROGRESS',
    practiceAttempted: attempted, practiceCorrect: correct,
    lastScorePercent: attempted ? Math.round(100 * correct / attempted) : null,
    completedAt: input.completed ? now : null, lastVisitedAt: now, updatedAt: now
  };
  // Visiting again does not erase completion or a previous self-assessment.
  await db.insert(schema.lessonProgress).values(values).onConflictDoUpdate({
    target: [schema.lessonProgress.userId, schema.lessonProgress.lessonId],
    set: {
      status: input.completed ? 'COMPLETED' : sql`${schema.lessonProgress.status}`,
      completedAt: input.completed ? sql`coalesce(${schema.lessonProgress.completedAt}, ${now})` : sql`${schema.lessonProgress.completedAt}`,
      ...(attempted ? { practiceAttempted: attempted, practiceCorrect: correct, lastScorePercent: values.lastScorePercent } : {}),
      lastVisitedAt: now, updatedAt: now
    }
  });
  return { saved: true, assessmentType: 'SELF_ASSESSED' };
});
