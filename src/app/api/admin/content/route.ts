import { z } from 'zod';
import { fail } from '@/server/api/respond';
import { audit } from '@/server/audit';
import { getCurriculumCoverage } from '@/server/curriculum/coverage';
import { sql, eq } from 'drizzle-orm';
import { handler, needRole } from '@/server/api/route';
import { getDb, schema } from '@/server/db';

/** Content provenance overview — shows what is verified versus illustrative. */
export const GET = handler(async (ctx) => {
  needRole(ctx, 'ADMIN', 'CONTENT_EDITOR');
  const db = await getDb();
  const [topicProvenance, specs, docs, notes, quizzes, decks] = await Promise.all([
    db.execute(sql`SELECT provenance, status, COUNT(*)::int AS n FROM topics GROUP BY 1,2 ORDER BY n DESC`),
    db.execute(sql`SELECT id, code, title, board_id, qualification_id, content_version AS version, verified_at, source_url
      FROM specifications ORDER BY verified_at DESC NULLS LAST LIMIT 100`),
    db.execute(sql`SELECT status, COUNT(*)::int AS n FROM documents GROUP BY 1 ORDER BY n DESC`),
    db.execute(sql`SELECT COUNT(*)::int AS n FROM notes`),
    db.execute(sql`SELECT COUNT(*)::int AS n FROM quizzes`),
    db.execute(sql`SELECT COUNT(*)::int AS n FROM flashcard_decks`)
  ]);
  const rows = (r: unknown) => (r as { rows?: unknown[] }).rows ?? r;
  return {
    curriculumCoverage: await getCurriculumCoverage(),
    topicProvenance: rows(topicProvenance), specifications: rows(specs), documentStatus: rows(docs),
    counts: { notes: rows(notes), quizzes: rows(quizzes), decks: rows(decks) }
  };
});

// Publication/access management only. Teaching text is authored and reviewed in batches.
const LessonPatch = z.object({
  lessonId: z.string().min(1).max(500),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  isPremium: z.boolean().optional()
}).refine(p => p.status !== undefined || p.isPremium !== undefined, 'Choose a change.');

export const PATCH = handler(async (ctx, body) => {
  const actor = needRole(ctx, 'ADMIN', 'CONTENT_EDITOR');
  const input = LessonPatch.parse(body);
  const db = await getDb();
  const rows = await db.update(schema.lessons).set({
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.isPremium !== undefined ? { isPremium: input.isPremium } : {}),
    updatedAt: new Date()
  }).where(eq(schema.lessons.id, input.lessonId)).returning({ id: schema.lessons.id });
  if (!rows.length) return fail('NOT_FOUND', 'Lesson not found.', ctx.requestId, 404);
  await audit({ actorId: actor.id, action: 'LESSON_PUBLICATION_UPDATED', target: input.lessonId,
    metadata: { status: input.status, isPremium: input.isPremium } });
  return { updated: true };
});
