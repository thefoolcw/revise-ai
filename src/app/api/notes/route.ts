import { z } from 'zod';
import { eq, and, desc, or, ilike } from 'drizzle-orm';
import { handler, parse, needUser, throttle } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { generateText } from '@/server/ai/gateway';
import { composeMessages, promptVersion } from '@/server/ai/prompts';

const Create = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().max(60000).default(''),
  subjectId: z.string().max(40).optional(),
  tags: z.array(z.string().max(40)).max(20).default([])
});

export const GET = handler(async (ctx) => {
  const u = needUser(ctx);
  const q = new URL(ctx.req.url).searchParams.get('q')?.trim();
  const db = await getDb();
  const where = q
    ? and(eq(schema.notes.userId, u.id), or(ilike(schema.notes.title, `%${q}%`), ilike(schema.notes.body, `%${q}%`)))
    : eq(schema.notes.userId, u.id);
  const rows = await db.select({
    id: schema.notes.id, title: schema.notes.title, subjectId: schema.notes.subjectId,
    tags: schema.notes.tags, version: schema.notes.version, updatedAt: schema.notes.updatedAt,
    preview: schema.notes.body
  }).from(schema.notes).where(where).orderBy(desc(schema.notes.updatedAt)).limit(100);
  // Only the current user's notes are ever returned — search is scoped by userId.
  return { notes: rows.map((n) => ({ ...n, preview: n.preview.slice(0, 180) })) };
});

export const POST = handler(async (ctx, body) => {
  const u = needUser(ctx);
  const b = parse(Create, body);
  const db = await getDb();
  const [note] = await db.insert(schema.notes).values({
    userId: u.id, title: b.title, body: b.body, subjectId: b.subjectId ?? null, tags: b.tags
  }).returning();
  await db.insert(schema.analyticsEvents).values({ userId: u.id, category: 'note_created', subjectId: b.subjectId ?? null });
  return { note };
});
