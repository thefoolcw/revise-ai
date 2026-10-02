import { z } from 'zod';
import { handler, parse, needRole } from '@/server/api/route';
import { EntitlementService } from '@/server/premium/entitlements';

const Body = z.object({ reason: z.string().trim().min(3, 'Give a reason — it is recorded in the audit trail.').max(500) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handler(async (ctx, body) => {
    const u = needRole(ctx, 'ADMIN');
    const { reason } = parse(Body, body);
    const r = await EntitlementService.revokePremium({ entitlementId: id, actorId: u.id, reason });
    return { revoked: true, alreadyRevoked: r.alreadyRevoked, status: r.entitlement.status };
  })(req as any);
}
