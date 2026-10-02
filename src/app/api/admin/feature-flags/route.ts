import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { handler, parse, needRole } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { audit } from '@/server/audit';

const Patch = z.object({ flagKey: z.string().min(1).max(80), enabled: z.boolean() });

export const GET = handler(async (ctx) => {
  needRole(ctx, 'ADMIN');
  const db = await getDb();
  return { flags: await db.select().from(schema.featureFlags) };
});

export const PATCH = handler(async (ctx, body) => {
  const admin = needRole(ctx, 'ADMIN');
  const b = parse(Patch, body);
  const db = await getDb();
  const [flag] = await db.select().from(schema.featureFlags).where(eq(schema.featureFlags.key, b.flagKey)).limit(1);
  if (!flag) { const e = new Error('Unknown feature flag.'); (e as { code?: string }).code = 'NOT_FOUND'; throw e; }

  await db.update(schema.featureFlags).set({ enabled: b.enabled, updatedAt: new Date() })
    .where(eq(schema.featureFlags.key, b.flagKey));
  await audit({
    actorId: admin.id, action: 'FLAG_CHANGED', target: b.flagKey,
    metadata: { from: flag.enabled, to: b.enabled }, ipHint: ctx.ip
  });
  return { flagKey: b.flagKey, enabled: b.enabled };
});
