import { describe, it, expect } from 'vitest';
import { schedule, initialState, retentionSummary, dueDate } from '../../src/server/study/srs';

describe('SM-2 spaced repetition', () => {
  it('gives a new card a short first interval', () => {
    const s = schedule(initialState(), 'GOOD');
    expect(s.repetitions).toBe(1);
    expect(s.intervalDays).toBeGreaterThan(0);
    expect(s.intervalDays).toBeLessThanOrEqual(1);
  });

  it('grows intervals across successful reviews', () => {
    let st = initialState();
    const intervals: number[] = [];
    for (let i = 0; i < 5; i++) {
      const r = schedule(st, 'GOOD');
      intervals.push(r.intervalDays);
      st = { ease: r.ease, intervalDays: r.intervalDays, repetitions: r.repetitions, lapses: r.lapses };
    }
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThan(intervals[i - 1]!);
    }
  });

  it('resets repetitions on a lapse but never drops the card', () => {
    let st = initialState();
    for (let i = 0; i < 4; i++) { const r = schedule(st, 'GOOD'); st = { ease: r.ease, intervalDays: r.intervalDays, repetitions: r.repetitions, lapses: r.lapses }; }
    const before = st.repetitions;
    const lapsed = schedule(st, 'AGAIN');
    expect(lapsed.repetitions).toBe(0);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.intervalDays).toBeGreaterThan(0); // still scheduled — never punished out of the deck
    expect(before).toBeGreaterThan(0);
  });

  it('floors ease so repeated failures cannot make a card impossible', () => {
    let st = initialState();
    for (let i = 0; i < 30; i++) { const r = schedule(st, 'AGAIN'); st = { ease: r.ease, intervalDays: r.intervalDays, repetitions: r.repetitions, lapses: r.lapses }; }
    expect(st.ease).toBeGreaterThanOrEqual(1.3);
    expect(Number.isFinite(st.intervalDays)).toBe(true);
  });

  it('never schedules a review in the past', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const r = schedule(initialState(), 'AGAIN', now);
    expect(dueDate(now, r.dueInDays).getTime()).toBeGreaterThan(now.getTime());
  });

  it('refuses to invent a retention figure from too little data', () => {
    expect(retentionSummary([{ rating: 'GOOD' }, { rating: 'AGAIN' }])).toMatchObject({ sufficient: false });
    const many = Array.from({ length: 10 }, (_, i) => ({ rating: (i < 8 ? 'GOOD' : 'AGAIN') as 'GOOD' | 'AGAIN' }));
    expect(retentionSummary(many)).toMatchObject({ sufficient: true, retentionPercent: 80 });
  });
});
