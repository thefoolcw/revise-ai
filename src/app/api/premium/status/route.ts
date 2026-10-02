import { handler, needUser } from '@/server/api/route';
import { EntitlementService } from '@/server/premium/entitlements';
import { getUsageSnapshot } from '@/server/usage/ledger';

export const GET = handler(async (ctx) => {
  const u = needUser(ctx);
  const [access, usage, entitlements] = await Promise.all([
    EntitlementService.hasPremium(u.id),
    getUsageSnapshot(u.id),
    EntitlementService.getUserEntitlements(u.id)
  ]);
  return {
    access,
    usage,
    entitlements: entitlements.map((e) => ({
      id: e.id, productSlug: e.productSlug, source: e.source, status: e.status,
      grantedAt: e.grantedAt, expiresAt: e.expiresAt, revokedAt: e.revokedAt, revokeReason: e.revokeReason
    }))
  };
});
