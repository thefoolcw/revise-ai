import { handler, needUser } from '@/server/api/route';
import { LessonSearch, searchLessons } from '@/server/curriculum/search';
import { EntitlementService } from '@/server/premium/entitlements';

export const GET = handler(async ctx => {
  const user = needUser(ctx);
  const params = Object.fromEntries(new URL(ctx.req.url).searchParams);
  const input = LessonSearch.parse({ ...params, year: params.year ?? user.yearGroup });
  const [results, entitlement] = await Promise.all([searchLessons(input), EntitlementService.hasPremium(user.id)]);
  return { ...results, items: results.items.map(l => ({ ...l, locked: l.isPremium && !entitlement.hasPremium })) };
});
