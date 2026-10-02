import { sql } from 'drizzle-orm';
import { handler, needRole } from '@/server/api/route';
import { getDb } from '@/server/db';

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
    topicProvenance: rows(topicProvenance), specifications: rows(specs), documentStatus: rows(docs),
    counts: { notes: rows(notes), quizzes: rows(quizzes), decks: rows(decks) }
  };
});
