import { describe, it, expect } from 'vitest';
import { assertPublishedSelection, publishedSubjects } from '../../src/server/curriculum/selection';
import { getYearMeta } from '../../src/server/curriculum/types';
import { universityLawYear1 } from '../../src/server/curriculum/batches/university/law-year1';
const availability = { 'year-10': ['maths'], 'uni-year-1': ['law'] };

describe('published subject selection', () => {
  const subjects = [{ id: 'maths' }, { id: 'law' }, { id: 'biology' }];
  it('is fail-closed for unknown and missing years', () => {
    expect(publishedSubjects(null, subjects, availability)).toEqual([]);
    expect(publishedSubjects('uni-year-2', subjects, availability)).toEqual([]);
  });
  it('shares exact year availability without reducing coverage obligations', () => {
    expect(publishedSubjects('uni-year-1', subjects, availability)).toEqual([{ id: 'law' }]);
    expect(getYearMeta('year-10')!.subjectIds).toContain('biology');
    expect(getYearMeta('postgraduate')?.subjectIds).toBeDefined();
  });
  it('rejects new unavailable selections and attempts to carry them to another year', () => {
    const current = { yearGroup: 'year-10', subjectIds: ['biology'] };
    expect(() => assertPublishedSelection(current, 'year-10', ['maths', 'law'], availability)).toThrow();
    expect(() => assertPublishedSelection(current, 'uni-year-1', ['biology'], availability)).toThrow();
    expect(() => assertPublishedSelection(current, 'year-10', ['biology'], availability, true)).toThrow();
  });
  it('preserves historical choices, permits removal and allows valid additions', () => {
    const current = { yearGroup: 'year-10', subjectIds: ['biology'] };
    expect(() => assertPublishedSelection(current, 'year-10', ['biology', 'maths'], availability)).not.toThrow();
    expect(() => assertPublishedSelection(current, 'year-10', [], availability)).not.toThrow();
    expect(() => assertPublishedSelection(current, 'uni-year-1', ['law'], availability)).not.toThrow();
    expect(current.subjectIds).toEqual(['biology']);
  });
  it('requires law across university progression, not just the populated introductory year', () => {
    for (const year of ['uni-foundation', 'uni-year-1', 'uni-year-2', 'uni-year-3', 'uni-year-4', 'postgraduate']) {
      expect(getYearMeta(year)?.subjectIds, year).toContain('law');
    }
    expect(universityLawYear1).toHaveLength(16);
    expect(new Set(universityLawYear1.map(l => l.topic)).size).toBe(8);
    expect(universityLawYear1.filter(l => !l.isPremium)).toHaveLength(8);
    expect(universityLawYear1.every(l => l.priorKnowledgeCheck.length && l.practiceQuestions.length && l.answers.length)).toBe(true);
  });
});

it('distinguishes required course metadata from database-backed publication', async () => {
  const { subjectMetadata } = await import('../../src/server/curriculum/subjectMetadata');
  const law = subjectMetadata('law', availability);
  expect(law.jurisdiction).toBe('England and Wales');
  expect(law.requiredYears).toHaveLength(6);
  expect(law.availableYears).toEqual(['uni-year-1']);
  expect(subjectMetadata('law', {}).publicationStatus).toBe('UNAVAILABLE');
  const { post16FurtherMathsYear12 } = await import('../../src/server/curriculum/batches/post16/further-maths-year12');
  expect(post16FurtherMathsYear12).toHaveLength(12);
  expect(new Set(post16FurtherMathsYear12.map(l => l.topic)).size).toBe(6);
  expect(post16FurtherMathsYear12.filter(l => !l.isPremium)).toHaveLength(6);
});
