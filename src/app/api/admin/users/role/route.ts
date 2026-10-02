import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { handler, parse, needRole } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { audit } from '@/server/audit';

const Body = z.object({ userId: z.string().uuid(), role: z.enum(['ADMIN', 'SUPPORT', 'CONTENT_EDITOR', 'ANALYST', 'TEACHER']), grant: z.boolean() });

/** Grants or revokes a staff role. Always audited; never callable by a non-admin. */
export const POST = handler(async (ctx, body) => {
  const admin = needRole(ctx, 'ADMIN');
  const b = parse(Body, body);
  if (b.userId === admin.id && !b.grant && b.role === 'ADMIN') {
    const e = new Error('You cannot remove your own administrator role.');
    (e as { code?: string }).code = 'VALIDATION_ERROR'; throw e;
  }

  const db = await getDb();
  if (b.grant) {
    await db.insert(schema.userRoles).values({ userId: b.userId, role: b.role })
      .onConflictDoNothing();
  } else {
    await db.delete(schema.userRoles).where(and(eq(schema.userRoles.userId, b.userId), eq(schema.userRoles.role, b.role)));
  }

  await audit({
    actorId: admin.id, action: 'ROLE_CHANGED', target: b.userId,
    metadata: { role: b.role, grant: b.grant }, ipHint: ctx.ip
  });
  return { userId: b.userId, role: b.role, granted: b.grant };
});
