import { describe, expect, it } from 'vitest';
import { batch01 } from '../../src/server/curriculum/batches/batch01-early-years';
import { getYearMeta, resolveUserYearGroup, filterSubjectsForYear } from '../../src/server/curriculum/types';

describe('authored early-years curriculum', () => {
  it.each(['nursery', 'reception'])('%s has every offered subject, multiple topics and multiple lessons', year => {
    const meta = getYearMeta(year)!;
    const lessons = batch01.filter(l => l.year === year);
    expect(new Set(lessons.map(l => l.subject))).toEqual(new Set(meta.subjectIds));
    for (const subject of meta.subjectIds) {
      const selected = lessons.filter(l => l.subject === subject);
      const topics = new Set(selected.map(l => l.topic));
      expect(topics.size).toBeGreaterThanOrEqual(2);
      for (const topic of topics) {
        const entries = selected.filter(l => l.topic === topic);
        expect(entries.length).toBeGreaterThanOrEqual(2);
        expect(entries.some(l => !l.isPremium)).toBe(true);
        expect(entries.some(l => l.isPremium)).toBe(true);
      }
    }
  });
  it('has unique authored teaching, meaningful fields and answer links', () => {
    expect(batch01).toHaveLength(56);
    expect(new Set(batch01.map(l => l.id)).size).toBe(56);
    expect(new Set(batch01.map(l => l.content[0]!.body)).size).toBe(56);
    for (const l of batch01) {
      expect(l.content[0]!.body.length).toBeGreaterThan(150);
      expect(l.examples[0]!.steps.length).toBeGreaterThanOrEqual(3);
      expect(l.memoryTips.length).toBeGreaterThan(0);
      expect(l.commonMistakes.length).toBeGreaterThan(0);
      expect(l.quickRecall.length).toBeGreaterThan(0);
      expect(l.practiceQuestions.length).toBeGreaterThan(0);
      expect(l.answers.map(a => a.questionId)).toEqual(l.practiceQuestions.map(q => q.id));
      expect(JSON.stringify(l)).not.toMatch(/coming soon|placeholder/i);
    }
  });
});
describe('year resolution', () => {
  it('keeps an explicit year even when old qualification metadata differs', () => {
    expect(resolveUserYearGroup({ yearGroup: 'year-3', qualificationId: 'gcse' }).id).toBe('year-3');
    expect(resolveUserYearGroup({ yearGroup: 'nursery', ageBand: 'SECONDARY' }).id).toBe('nursery');
  });
  it('only offers subjects from the chosen year', () => {
    expect(filterSubjectsForYear('nursery', [{ id: 'maths' }, { id: 'ey-maths' }])).toEqual([{ id: 'ey-maths' }]);
  });
});

import { curriculumProfileUpdate } from '../../src/server/curriculum/profile';
import { curriculumLessons } from '../../src/server/curriculum/catalogue';
it.each(['nursery', 'reception', 'year-1', 'year-2', 'year-3'])('verifies every saved subject/topic/lesson for %s', year => {
  for (const subject of getYearMeta(year)!.subjectIds) {
    const lessons = curriculumLessons.filter(l => l.year === year && l.subject === subject);
    const topics = new Set(lessons.map(l => l.topic));
    expect(topics.size).toBeGreaterThanOrEqual(2);
    for (const topic of topics) {
      const items = lessons.filter(l => l.topic === topic);
      expect(items.length).toBeGreaterThanOrEqual(2);
      expect(items.some(l => l.isPremium)).toBe(true);
      expect(items.some(l => !l.isPremium)).toBe(true);
      for (const l of items) {
        expect(l.content[0]!.body.length).toBeGreaterThan(150);
        expect(l.examples[0]!.steps).toHaveLength(3);
        expect(l.practiceQuestions[0]!.answer.length).toBeGreaterThan(10);
        expect(l.answers[0]!.questionId).toBe(l.practiceQuestions[0]!.id);
      }
    }
  }
});
it('rejects unknown years, inconsistent stages, invalid subjects and incomplete onboarding', () => {
  const current = { yearGroup: 'year-1', subjectIds: ['maths'] };
  expect(() => curriculumProfileUpdate(current, { yearGroup: 'unknown' })).toThrow();
  expect(() => curriculumProfileUpdate(current, { educationStage: 'UNIVERSITY' })).toThrow();
  expect(() => curriculumProfileUpdate(current, { subjectIds: ['ey-maths'] })).toThrow();
  expect(() => curriculumProfileUpdate({ yearGroup: null, subjectIds: [] }, { completeOnboarding: true })).toThrow();
  expect(curriculumProfileUpdate(current, { yearGroup: 'reception' })).toMatchObject({ yearGroup: 'reception', educationStage: 'RECEPTION', subjectIds: [] });
});
