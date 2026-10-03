import { getLessonProgressSummary } from '@/server/curriculum/progress';
import { handler, needUser } from '@/server/api/route';
import { computeProgress } from '@/server/study/progress';

/** Progress computed from stored records — see src/server/study/progress.ts. */
export const GET = handler(async ctx => {
  const user = needUser(ctx);
  const [progress, lessons] = await Promise.all([computeProgress(user.id), getLessonProgressSummary(user.id)]);
  return { ...progress, lessons };
});
