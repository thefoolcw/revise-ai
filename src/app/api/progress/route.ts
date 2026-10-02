import { handler, needUser } from '@/server/api/route';
import { computeProgress } from '@/server/study/progress';

/** Progress computed from stored records — see src/server/study/progress.ts. */
export const GET = handler(async (ctx) => computeProgress(needUser(ctx).id));
