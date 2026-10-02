import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { handler, parse, needRole } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { audit } from '@/server/audit';

const Body = z.object({ enabled: z.boolean().optional(), premiumOnly: z.boolean().optional(), fallbackRank: z.number().int().min(0).max(1000).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handler(async (ctx, body) => {
    const u = needRole(ctx, 'ADMIN', 'CONTENT_EDITOR');
    const b = parse(Body, body);
    const db = await getDb();
    const [model] = await db.select().from(schema.modelRegistry).where(eq(schema.modelRegistry.modelId, id)).limit(1);
    if (!model) { const e = new Error('Model not found.'); (e as any).code = 'NOT_FOUND'; throw e; }

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (b.enabled !== undefined) update.enabled = b.enabled;
    if (b.premiumOnly !== undefined) update.premiumOnly = b.premiumOnly;
    if (b.fallbackRank !== undefined) update.fallbackRank = b.fallbackRank;
    await db.update(schema.modelRegistry).set(update).where(eq(schema.modelRegistry.modelId, id));

    if (b.enabled !== undefined) {
      await audit({ actorId: u.id, action: b.enabled ? 'MODEL_ENABLED' : 'MODEL_DISABLED', target: id, metadata: { previous: model.enabled } });
    }
    return { modelId: id, enabled: b.enabled ?? model.enabled };
  })(req as any);
}
