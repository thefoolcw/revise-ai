/** Optional HTTP smoke test against an already-running local development server.
 * Creates and then deletes its own account. Never use against a production service.
 * Usage: node scripts/smoke-curriculum.mjs
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const origin = 'http://127.0.0.1:3000';
let cookie = '';
async function call(path, method = 'GET', body) {
  const response = await fetch(origin + path, { method, redirect: 'manual',
    headers: { ...(cookie ? { cookie } : {}), ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const nextCookie = response.headers.get('set-cookie');
  if (nextCookie) cookie = nextCookie.split(';')[0];
  assert.equal(response.status, 200, `${method} ${path}: ${response.status}`);
  return response;
}
try {
  await call('/api/auth/signup', 'POST', { email: `smoke-${randomUUID()}@example.test`, displayName: 'Smoke Learner', password: `Test-${randomUUID()}-9!` });
  await call('/api/me', 'PATCH', { yearGroup: 'year-1', educationStage: 'PRIMARY', subjectIds: ['maths'], completeOnboarding: true });
  const me = await (await call('/api/me')).json();
  assert.equal(me.data.user.yearGroup, 'year-1');
  const dashboard = await (await call('/app/dashboard')).text();
  assert(dashboard.includes('MY SUBJECTS'));
  assert(dashboard.includes('/app/subjects/maths'));
  assert(!dashboard.includes('/app/subjects/history'));
  const results = await (await call('/api/curriculum/search?year=year-1&subject=maths')).json();
  assert.equal(results.data.total, 4);
  const free = results.data.items.find(l => !l.isPremium);
  const premium = results.data.items.find(l => l.isPremium);
  assert(free && premium && premium.locked);
  const lesson = await (await call(`/app/lessons/${free.slug}`)).text();
  assert(lesson.includes('Memory aids') && lesson.includes('Practise'));
  const locked = await (await call(`/app/lessons/${premium.slug}`)).text();
  assert(locked.includes('This lesson is part of REVise Premium.'));
  assert(!locked.includes('Practise &amp; reflect'));
  await call('/api/lessons/progress', 'POST', { lessonId: free.id, completed: true });
  for (const path of ['/app/subjects/maths', `/app/topics/${free.topicSlug}`, '/app/learn?year=year-1', '/app/settings', '/app/progress']) await call(path);
  await call('/api/me', 'PATCH', { subjectIds: ['maths', 'art'] });
  const added = await (await call('/app/dashboard')).text();
  assert(added.includes('/app/subjects/art'));
  await call('/api/me', 'PATCH', { yearGroup: 'reception', subjectIds: ['ey-maths'] });
  const changed = await (await call('/app/dashboard')).text();
  assert(changed.includes('/app/subjects/ey-maths'));
  assert(!changed.includes('href="/app/subjects/maths"'));
  console.log('PASS: auth, saved year, selected-only dashboard, subject changes, lesson reader, Premium lock, progress and navigation over HTTP');
} finally {
  if (cookie) await call('/api/me', 'DELETE');
}
