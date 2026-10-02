import { describe, it, expect } from 'vitest';
import { allocate, rankTopics } from '../../src/server/study/planner';

const days = (n: number) => new Date(Date.now() + n * 864e5);

describe('revision planner', () => {
  it('ranks weak topics above confident ones using real attempt data', () => {
    const ranked = rankTopics([
      { id: 'a', title: 'Strong topic', attempts: 10, mistakes: 1 },
      { id: 'b', title: 'Weak topic', attempts: 10, mistakes: 8 }
    ]);
    expect(ranked[0]!.title).toBe('Weak topic');
  });

  it('does not treat a topic with no data as weak', () => {
    const ranked = rankTopics([
      { id: 'a', title: 'Unknown', attempts: 0, mistakes: 0 },
      { id: 'b', title: 'Known weak', attempts: 6, mistakes: 5 }
    ]);
    expect(ranked[0]!.title).toBe('Known weak');
  });

  it('never schedules a negative duration or exceeds the time budget', () => {
    const r = allocate({
      topics: Array.from({ length: 12 }, (_, i) => ({ id: `t${i}`, title: `Topic ${i}`, subjectId: 'maths' })),
      targetDate: days(21), hoursPerWeek: 4, sessionMinutes: 45
    });
    expect(r.items.length).toBeGreaterThan(0);
    expect(r.items.every((i) => i.durationMinutes > 0)).toBe(true);
    expect(r.totalMinutes).toBeLessThanOrEqual(r.availableMinutes + 45);
  });

  it('respects rest days', () => {
    const r = allocate({
      topics: [{ id: 'a', title: 'Topic', subjectId: 'maths' }],
      targetDate: days(14), hoursPerWeek: 10, sessionMinutes: 30, restDays: [0, 6]
    });
    expect(r.items.length).toBeGreaterThan(0);
    expect(r.items.every((i) => i.scheduledFor.getDay() !== 0 && i.scheduledFor.getDay() !== 6)).toBe(true);
  });

  it('reports NOT_ENOUGH_TIME honestly instead of an impossible schedule', () => {
    const r = allocate({
      topics: Array.from({ length: 30 }, (_, i) => ({ id: `t${i}`, title: `Topic ${i}` })),
      targetDate: days(2), hoursPerWeek: 1, sessionMinutes: 60
    });
    expect(r.health).toBe('NOT_ENOUGH_TIME');
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it('refuses to build a plan with no topics', () => {
    const r = allocate({ topics: [], targetDate: days(10), hoursPerWeek: 5, sessionMinutes: 30 });
    expect(r.items).toHaveLength(0);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it('allocates extra recall passes to weak topics', () => {
    const r = allocate({
      topics: [
        { id: 'weak', title: 'Weak', attempts: 10, mistakes: 9 },
        { id: 'strong', title: 'Strong', attempts: 10, mistakes: 0, confidence: 0.95 }
      ],
      targetDate: days(30), hoursPerWeek: 10, sessionMinutes: 30
    });
    const weak = r.items.filter((i) => i.topicId === 'weak').length;
    const strong = r.items.filter((i) => i.topicId === 'strong').length;
    expect(weak).toBeGreaterThanOrEqual(strong);
  });
});
