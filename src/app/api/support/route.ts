import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { handler, parse, needUser, throttle } from '@/server/api/route';
import { getDb, schema } from '@/server/db';

const Create = z.object({
  subject: z.string().trim().min(3).max(140),
  category: z.enum(['Premium / Keys', 'Account', 'AI', 'Documents', 'Curriculum', 'Feature request', 'Bug', 'Abuse/safety', 'Other']),
  message: z.string().trim().min(10, 'Add a little more detail so we can help.').max(6000)
    // Never let credentials into a support ticket.
    .refine((m) => !/nvapi-[A-Za-z0-9_\-]{10,}/.test(m), 'Please do not include API keys or Premium keys in a support message.')
});

export const GET = handler(async (ctx) => {
  const u = needUser(ctx);
  const db = await getDb();
  const rows = await db.select().from(schema.supportTickets).where(eq(schema.supportTickets.userId, u.id)).orderBy(desc(schema.supportTickets.createdAt)).limit(30);
  return { tickets: rows };
});

export const POST = handler(async (ctx, body) => {
  const u = needUser(ctx);
  await throttle('generic', u.id, ctx.ip);
  const b = parse(Create, body);
  const db = await getDb();
  const [t] = await db.insert(schema.supportTickets).values({ userId: u.id, subject: b.subject, category: b.category, message: b.message }).returning();
  return { ticket: { id: t!.id, status: t!.status, createdAt: t!.createdAt } };
});
