/** HTTP batch verification against the local preview, not a manual browser/release test.
 * Creates and deletes its own account. Usage: npx tsx scripts/smoke-authored-year.ts year-9
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { curriculumLessons } from '../src/server/curriculum/catalogue';
import { getYearMeta } from '../src/server/curriculum/types';

async function main() {
  const year = process.argv[2];
  const meta = getYearMeta(year);
  assert(meta, 'Supply a supported year.');
  const expected = curriculumLessons.filter(lesson => lesson.year === year);
  assert(expected.length, 'The requested year has no authored lessons.');
  let cookie = '';
  async function call(path: string, method = 'GET', body?: unknown) {
    const response = await fetch(`http://127.0.0.1:3000${path}`, {
      method, redirect: 'manual',
      headers: { ...(cookie ? { cookie } : {}), ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    const nextCookie = response.headers.get('set-cookie');
    if (nextCookie) cookie = nextCookie.split(';')[0]!;
    assert.equal(response.status, 200, `${method} ${path}: ${response.status}`);
    return response;
  }
  try {
    await call('/api/auth/signup', 'POST', { email: `batch-${randomUUID()}@example.test`, displayName: 'Batch verification', password: `Test-${randomUUID()}-9!` });
    const firstSubject = expected[0]!.subject;
    await call('/api/me', 'PATCH', { yearGroup: year, educationStage: meta.stageId, subjectIds: [firstSubject], completeOnboarding: true });
    const profile = await (await call('/api/me')).json();
    assert.equal(profile.data.user.yearGroup, year);
    for (const subject of new Set(expected.map(lesson => lesson.subject))) {
      const lessons = expected.filter(lesson => lesson.subject === subject);
      const results = await (await call(`/api/curriculum/search?year=${year}&subject=${subject}`)).json();
      assert.equal(results.data.total, lessons.length);
      for (const item of results.data.items) {
        assert.equal(item.yearGroup, year);
        assert.equal(item.subjectId, subject);
        assert.equal(item.locked, item.isPremium);
        for (const field of ['content', 'answers', 'examples', 'practiceQuestions']) assert(!(field in item), `Search leaked ${field}`);
      }
      const free = lessons.find(lesson => !lesson.isPremium)!;
      const premium = lessons.find(lesson => lesson.isPremium)!;
      assert(free && premium);
      const freePage = await (await call(`/app/lessons/${free.slug}`)).text();
      assert(freePage.includes('Memory aids') && freePage.includes('Practise'), `${subject}: Free teaching unavailable`);
      const lockPage = await (await call(`/app/lessons/${premium.slug}`)).text();
      assert(lockPage.includes('This lesson is part of REVise Premium.'), `${subject}: missing lock`);
      for (const section of premium.content) assert(!lockPage.includes(section.body), `${subject}: protected teaching leaked`);
      for (const access of ['free', 'premium']) {
        const filtered = await (await call(`/api/curriculum/search?year=${year}&subject=${subject}&access=${access}`)).json();
        assert.equal(filtered.data.total, lessons.filter(lesson => lesson.isPremium === (access === 'premium')).length);
      }
    }
    console.log(`PASS: ${year} saved profile; all ${new Set(expected.map(l => l.subject)).size} authored subjects searchable with correct counts and access filters; one Free reader and Premium lock per subject over HTTP.`);
  } finally {
    if (cookie) await call('/api/me', 'DELETE');
  }
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'HTTP batch check failed.'); process.exitCode = 1; });
