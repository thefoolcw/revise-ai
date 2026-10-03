import { subjectMetadata } from '@/server/curriculum/subjectMetadata';
import { getSubjectAvailability } from '@/server/curriculum/availability';
import { publishedSubjects } from '@/server/curriculum/selection';
import { getYearMeta, filterSubjectsForYear } from '@/server/curriculum/types';
import { z } from 'zod';
import { eq, sql, and } from 'drizzle-orm';
import { handler } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { fuzzyMatch } from '@/server/curriculum/fuzzy';

const Query = z.object({
  year: z.string().refine(y => !!getYearMeta(y), 'Choose a supported year.').optional(),
  qualification: z.string().max(40).optional(),
  board: z.string().max(40).optional(),
  level: z.string().max(40).optional(),
  search: z.string().max(120).optional(),
  subject: z.string().max(40).optional()
});

export const GET = handler(async (ctx) => {
  const url = new URL(ctx.req.url);
  const q = Query.parse(Object.fromEntries(url.searchParams.entries()));
  const db = await getDb();

  const boards = await db.select().from(schema.examBoards).where(eq(schema.examBoards.status, 'ACTIVE'));
  const quals = await db.select().from(schema.qualifications).orderBy(schema.qualifications.orderIndex);
  const allSubjects = await db.select().from(schema.subjects);

  const year = q.year ?? ctx.user?.yearGroup;
  const availability = await getSubjectAvailability();
  const subjects = year ? publishedSubjects(year, filterSubjectsForYear(year, allSubjects), availability)
    : allSubjects.filter(s => Object.values(availability).some(ids => ids.includes(s.id)));

  // Only offer board/qualification combinations that actually exist (§05).
  const validBoardsFor = (qualId?: string) => {
    const qual = quals.find((x) => x.id === qualId);
    if (!qual) return boards.map((b) => b.id);
    const allowed = (qual.boards as string[] | null) ?? [];
    return boards.filter((b) => allowed.includes(b.id)).map((b) => b.id);
  };

  let topicList: { id: string; slug: string; title: string; parentId: string | null; subjectId: string | null; provenance: string }[] = [];
  if (q.subject) {
    const rows = await db.select({
      id: schema.topics.id, slug: schema.topics.slug, title: schema.topics.title,
      parentId: schema.topics.parentId, subjectId: schema.topics.subjectId, provenance: schema.topics.provenance
    }).from(schema.topics)
      .where(and(eq(schema.topics.subjectId, q.subject), eq(schema.topics.status, 'PUBLISHED'), year ? eq(schema.topics.yearGroup, year) : undefined))
      .orderBy(schema.topics.orderIndex);
    topicList = rows;
  }

  const searchResults = q.search && q.search.trim().length >= 2 ? {
    subjects: fuzzyMatch(q.search, subjects, (s) => [s.name, s.category, s.id], 8).map((h) => ({ ...h.item, score: h.score })),
    boards: fuzzyMatch(q.search, boards, (b) => [b.name, b.shortName, b.id], 6).map((h) => ({ ...h.item, score: h.score })),
    qualifications: fuzzyMatch(q.search, quals, (x) => [x.name, x.id], 6).map((h) => ({ ...h.item, score: h.score })),
    topics: q.subject ? fuzzyMatch(q.search, topicList, (t) => [t.title], 8).map((h) => ({ ...h.item, score: h.score })) : []
  } : null;

  return {
    boards,
    qualifications: quals,
    subjects: subjects.map(subject => ({ ...subject, ...subjectMetadata(subject.id, availability) })),
    availability,
    topics: topicList,
    validBoardsForQualification: q.qualification ? validBoardsFor(q.qualification) : undefined,
    search: searchResults,
    // Honest provenance signal for the UI.
    provenanceNote: 'Topic trees are illustrative until an administrator attaches a verified specification with a source and version.'
  };
});
