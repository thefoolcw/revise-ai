import { z } from 'zod';
import { handler } from '@/server/api/route';
import { listVisibleModels, lastCatalogRefresh } from '@/server/ai/registry';
import { EntitlementService } from '@/server/premium/entitlements';
import type { TaskClass } from '@/server/ai/types';

const Query = z.object({ task: z.string().optional() });

/**
 * User-facing model list. Filtered server-side by entitlement and task, so the
 * selector can never offer a model the caller is not allowed to use.
 */
export const GET = handler(async (ctx) => {
  const url = new URL(ctx.req.url);
  const q = Query.safeParse({ task: url.searchParams.get('task') ?? undefined });
  const premium = ctx.user ? (await EntitlementService.hasPremium(ctx.user.id)).hasPremium : false;
  const models = await listVisibleModels({ premium, task: (q.success ? q.data.task : undefined) as TaskClass | undefined });
  const refresh = await lastCatalogRefresh();
  return {
    models,
    catalog: { lastRefresh: refresh.at, stale: refresh.stale },
    // Exposed so the UI can be honest when discovery is unavailable.
    degraded: refresh.stale
  };
});
