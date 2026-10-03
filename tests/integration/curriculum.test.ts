import { beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { makeUser } from '../helpers';
import { getDb, schema } from '../../src/server/db';
import { getCurrentUser, hashToken } from '../../src/server/auth/session';
import { curriculumLessons } from '../../src/server/curriculum/catalogue';
import { seedCurriculum } from '../../src/server/curriculum/seed';
import { getLessonAccess } from '../../src/server/curriculum/access';
import { searchLessons } from '../../src/server/curriculum/search';
import { getCurriculumCoverage } from '../../src/server/curriculum/coverage';
import { EntitlementService } from '../../src/server/premium/entitlements';
import { PATCH, GET } from '../../src/app/api/me/route';
import { POST } from '../../src/app/api/lessons/progress/route';

const jar = vi.hoisted(() => ({ token: '' }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => jar.token ? { value: jar.token } : undefined }) }));
async function signIn(userId: string) {
  const db = await getDb();
  jar.token = crypto.randomUUID();
  await db.insert(schema.sessions).values({ userId, tokenHash: hashToken(jar.token), expiresAt: new Date(Date.now() + 864e5) });
}
const request = (path: string, body: unknown, method = 'POST') => new NextRequest(`http://localhost${path}`, {
  method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
});
const free = curriculumLessons.find(l => !l.isPremium)!;
const premium = curriculumLessons.find(l => l.isPremium)!;

it('seeds actual records idempotently without changing ids', async () => {
  const db = await getDb();
  const before = await db.select({ id: schema.lessons.id }).from(schema.lessons).orderBy(schema.lessons.id);
  const result = await seedCurriculum();
  const after = await db.select({ id: schema.lessons.id }).from(schema.lessons).orderBy(schema.lessons.id);
  expect(result.lessons).toBe(curriculumLessons.length);
  expect(after).toEqual(before);
  expect(after).toHaveLength(curriculumLessons.length);
  const [stored] = await db.select().from(schema.lessons).where(eq(schema.lessons.id, free.id));
  expect(stored!.content).toEqual(free.content);
  const coverage = await getCurriculumCoverage();
  for (const year of ['nursery', 'reception', 'year-1', 'year-2', 'year-3']) {
    const row = coverage.find(y => y.year === year)!;
    expect(row.coveredSubjects).toBe(row.subjects.length);
  }
});

it('preserves an explicit year from onboarding request through DB, session and me', async () => {
  const u = await makeUser(); await signIn(u.id);
  const response = await PATCH(request('/api/me', {
    yearGroup: 'year-1', educationStage: 'PRIMARY', subjectIds: ['maths', 'art'], completeOnboarding: true
  }, 'PATCH'));
  expect(response.status).toBe(200);
  const db = await getDb();
  const [profile] = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, u.id));
  expect(profile!.yearGroup).toBe('year-1');
  expect(profile!.educationStage).toBe('PRIMARY');
  expect(profile!.onboardedAt).not.toBeNull();
  const current = await getCurrentUser();
  expect(current!.yearGroup).toBe('year-1');
  expect(current!.subjectIds).toEqual(['maths', 'art']);
  const me = await GET(new NextRequest('http://localhost/api/me'));
  expect((await me.json()).data.user.yearGroup).toBe('year-1');
  const invalid = await PATCH(request('/api/me', { subjectIds: ['ey-maths'] }, 'PATCH'));
  expect(invalid.status).toBe(422);
  expect((await getCurrentUser())!.subjectIds).toEqual(['maths', 'art']);
  const changed = await PATCH(request('/api/me', { yearGroup: 'reception', subjectIds: ['ey-maths'] }, 'PATCH'));
  expect(changed.status).toBe(200);
  expect((await getCurrentUser())!.yearGroup).toBe('reception');
  expect((await getCurrentUser())!.educationStage).toBe('RECEPTION');
});

it('never returns Premium body or answers to a free user and unlocks via the existing entitlement', async () => {
  const u = await makeUser();
  const locked = await getLessonAccess(u.id, premium.slug);
  expect(locked!.locked).toBe(true);
  expect(locked!.lesson).toBeNull();
  expect(JSON.stringify(locked)).not.toContain(premium.content[0]!.body);
  expect((await getLessonAccess(u.id, free.slug))!.lesson!.content).toEqual(free.content);
  await EntitlementService.grantPremium({ userId: u.id, source: 'ADMIN_GRANT' });
  const unlocked = await getLessonAccess(u.id, premium.slug);
  expect(unlocked!.locked).toBe(false);
  expect(unlocked!.lesson!.answers).toEqual(premium.answers);
});

it('filters search by year, subject and tier and returns metadata only', async () => {
  const result = await searchLessons({ year: 'year-1', subject: 'maths', access: 'premium', q: 'number' });
  expect(result.items.length).toBeGreaterThan(0);
  for (const l of result.items) {
    expect(l.yearGroup).toBe('year-1'); expect(l.subjectId).toBe('maths'); expect(l.isPremium).toBe(true);
    expect(l).not.toHaveProperty('content'); expect(l).not.toHaveProperty('answers');
  }
});

it('rejects unauthenticated and locked writes; completion is owned and survives visits and reseeding', async () => {
  jar.token = '';
  expect((await POST(request('/api/lessons/progress', { lessonId: free.id }))).status).toBe(401);
  const u = await makeUser(); await signIn(u.id);
  expect((await POST(request('/api/lessons/progress', { lessonId: premium.id, completed: true }))).status).toBe(403);
  expect((await POST(request('/api/lessons/progress', { lessonId: free.id, assessments: { invented: 'CONFIDENT' } }))).status).toBe(422);
  const q = free.practiceQuestions[0]!;
  expect((await POST(request('/api/lessons/progress', { lessonId: free.id, completed: true, assessments: { [q.id]: 'CONFIDENT' } }))).status).toBe(200);
  await POST(request('/api/lessons/progress', { lessonId: free.id }));
  await seedCurriculum();
  const db = await getDb();
  const rows = await db.select().from(schema.lessonProgress).where(and(eq(schema.lessonProgress.userId, u.id), eq(schema.lessonProgress.lessonId, free.id)));
  expect(rows).toHaveLength(1);
  expect(rows[0]!.status).toBe('COMPLETED');
  expect(rows[0]!.practiceAttempted).toBe(1);
  expect(rows[0]!.practiceCorrect).toBe(1);
  const other = await makeUser(); await signIn(other.id);
  await POST(request('/api/lessons/progress', { lessonId: free.id }));
  const [otherProgress] = await db.select().from(schema.lessonProgress).where(eq(schema.lessonProgress.userId, other.id));
  expect(otherProgress!.status).toBe('IN_PROGRESS');
});

import { FreeTierAdBanner } from '../../src/components/app/FreeTierAdBanner';
import { PATCH as editPublication } from '../../src/app/api/admin/content/route';

it('sends no free-tier ad component to active Premium users and relocks expired access', async () => {
  const u = await makeUser(); await signIn(u.id);
  expect(await FreeTierAdBanner()).not.toBeNull();
  const grant = await EntitlementService.grantPremium({ userId: u.id, source: 'ADMIN_GRANT' });
  expect(await FreeTierAdBanner()).toBeNull();
  const db = await getDb();
  await db.update(schema.entitlements).set({ expiresAt: new Date(Date.now() - 60000) }).where(eq(schema.entitlements.id, grant.entitlement!.id));
  expect((await getLessonAccess(u.id, premium.id))!.locked).toBe(true);
  expect(await FreeTierAdBanner()).not.toBeNull();
});

it('protects content management and excludes draft lessons from direct reads and search', async () => {
  const learner = await makeUser(); await signIn(learner.id);
  expect((await editPublication(request('/api/admin/content', { lessonId: free.id, status: 'DRAFT' }, 'PATCH'))).status).toBe(403);
  const admin = await makeUser(undefined, ['ADMIN']); await signIn(admin.id);
  try {
    expect((await editPublication(request('/api/admin/content', { lessonId: free.id, status: 'DRAFT' }, 'PATCH'))).status).toBe(200);
    expect(await getLessonAccess(learner.id, free.id)).toBeNull();
    const results = await searchLessons({ year: free.year, q: free.title });
    expect(results.items.some(l => l.id === free.id)).toBe(false);
  } finally {
    await editPublication(request('/api/admin/content', { lessonId: free.id, status: 'PUBLISHED' }, 'PATCH'));
  }
});

it('publishes the same lesson-backed subjects for selection and rejects empty courses server-side', async () => {
  const { getSubjectAvailability } = await import('../../src/server/curriculum/availability');
  const { GET: catalogue } = await import('../../src/app/api/curriculum/route');
  const user = await makeUser(); await signIn(user.id);
  const availability = await getSubjectAvailability();
  expect(availability['uni-year-1']).toContain('law');
  expect(availability['uni-year-2']).not.toContain('law');
  const catalogResponse = await catalogue(new NextRequest('http://localhost/api/curriculum?year=uni-year-1'));
  const catalog = await catalogResponse.json();
  expect(catalog.data.subjects.map((s: { id: string }) => s.id)).toEqual(availability['uni-year-1']);
  expect((await PATCH(request('/api/me', { yearGroup: 'uni-year-1', subjectIds: ['law'], completeOnboarding: true }, 'PATCH'))).status).toBe(200);
  expect((await getCurrentUser())!.yearGroup).toBe('uni-year-1');
  expect((await getCurrentUser())!.subjectIds).toEqual(['law']);
  const rejected = await PATCH(request('/api/me', { yearGroup: 'uni-year-2', subjectIds: ['law'] }, 'PATCH'));
  expect(rejected.status).toBe(422);
  expect((await getCurrentUser())!.yearGroup).toBe('uni-year-1');
  expect((await searchLessons({ year: 'uni-year-1', q: 'LLB' })).total).toBe(16);
  expect((await searchLessons({ year: 'uni-year-1', q: 'Law' })).total).toBe(16);
  expect((await searchLessons({ year: 'uni-year-1', q: 'judicial review' })).total).toBeGreaterThan(0);
});

it('removes a subject from availability when publication breaks required topic access coverage', async () => {
  const { getSubjectAvailability } = await import('../../src/server/curriculum/availability');
  const lesson = curriculumLessons.find(l => l.subject === 'law' && !l.isPremium)!;
  const db = await getDb();
  try {
    await db.update(schema.lessons).set({ status: 'DRAFT' }).where(eq(schema.lessons.id, lesson.id));
    expect((await getSubjectAvailability())['uni-year-1']).not.toContain('law');
  } finally {
    await db.update(schema.lessons).set({ status: 'PUBLISHED' }).where(eq(schema.lessons.id, lesson.id));
  }
  expect((await getSubjectAvailability())['uni-year-1']).toContain('law');
});

it('keeps qualification stage consistent with the explicit year', async () => {
  const user = await makeUser(); await signIn(user.id);
  const invalid = await PATCH(request('/api/me', { yearGroup: 'year-12', subjectIds: ['further-maths'], qualificationId: 'gcse' }, 'PATCH'));
  expect(invalid.status).toBe(422);
  const valid = await PATCH(request('/api/me', { yearGroup: 'year-12', subjectIds: ['further-maths'] }, 'PATCH'));
  expect(valid.status).toBe(200);
  expect((await getCurrentUser())!.qualificationId).toBe('alevel');
  expect((await getCurrentUser())!.yearGroup).toBe('year-12');
});

it('does not reset a saved compatible qualification when managing same-year subjects', async () => {
  const user = await makeUser(); await signIn(user.id);
  expect((await PATCH(request('/api/me', { yearGroup: 'year-12', subjectIds: ['further-maths'], qualificationId: 'cambridge-as-a', examBoardId: 'cambridge' }, 'PATCH'))).status).toBe(200);
  expect((await PATCH(request('/api/me', { yearGroup: 'year-12', subjectIds: [] }, 'PATCH'))).status).toBe(200);
  expect((await getCurrentUser())!.qualificationId).toBe('cambridge-as-a');
  expect((await getCurrentUser())!.examBoardId).toBe('cambridge');
});
