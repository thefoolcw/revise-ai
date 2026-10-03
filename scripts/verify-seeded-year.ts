/** Read-only batch verification against the configured, already-seeded database.
 * Stop other PGlite processes first. This checks authored records, not full syllabus coverage.
 * Usage: npx tsx scripts/verify-seeded-year.ts year-8
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { loadEnvFile } from 'node:process';
for (const file of ['.env.local', '.env']) { try { loadEnvFile(file); } catch {} }

async function main() {
  const { curriculumLessons } = await import('../src/server/curriculum/catalogue');
  const { getYearMeta } = await import('../src/server/curriculum/types');
  const { getCurriculumCoverage } = await import('../src/server/curriculum/coverage');
  const { searchLessons } = await import('../src/server/curriculum/search');
  const { getLessonAccess } = await import('../src/server/curriculum/access');
  const { getDb, schema } = await import('../src/server/db');
  const { eq } = await import('drizzle-orm');
  const year = process.argv[2];
  assert(year && getYearMeta(year), 'Supply a supported year.');
  const expected = curriculumLessons.filter(lesson => lesson.year === year);
  assert(expected.length, 'No authored lessons registered for this year.');
  const db = await getDb();
  const stored = await db.select().from(schema.lessons).where(eq(schema.lessons.yearGroup, year));
  const readerWithoutEntitlement = randomUUID();
  for (const lesson of expected) {
    const row = stored.find(item => item.id === lesson.id);
    assert(row, `Missing seeded lesson: ${lesson.id}`);
    assert.equal(row.status, 'PUBLISHED');
    assert.equal(row.subjectId, lesson.subject);
    assert.equal(row.topicSlug, lesson.topic);
    assert.equal(row.isPremium, lesson.isPremium);
    assert.deepEqual(row.content, lesson.content);
    const access = await getLessonAccess(readerWithoutEntitlement, lesson.id);
    assert(access, `Missing reader record: ${lesson.id}`);
    assert.equal(access.locked, lesson.isPremium);
    if (lesson.isPremium) assert.equal(access.lesson, null, 'Premium body leaked.');
    else assert(access.lesson?.content.length, 'Free teaching unavailable.');
  }
  for (const subject of new Set(expected.map(lesson => lesson.subject))) {
    const results = await searchLessons({ year, subject });
    assert.equal(results.total, expected.filter(lesson => lesson.subject === subject).length);
    for (const result of results.items) {
      assert.equal(result.yearGroup, year);
      assert.equal(result.subjectId, subject);
      for (const key of ['content', 'answers', 'practiceQuestions', 'examples']) assert(!(key in result), `Search leaked ${key}`);
    }
  }
  const coverage = (await getCurriculumCoverage()).find(row => row.year === year)!;
  console.table(coverage.subjects);
  console.log(`Verified ${expected.length} authored ${year} records, search totals and Free/Premium reader access against the existing database.`);
  console.log(`Structural subject coverage: ${coverage.coveredSubjects}/${getYearMeta(year)!.subjectIds.length}; this is not a full curriculum or release certification.`);
}
main().then(() => process.exit(0)).catch(error => {
  console.error(error instanceof Error ? error.message : 'Batch verification failed.');
  process.exit(1);
});
