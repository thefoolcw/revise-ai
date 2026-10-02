/**
 * SM-2 spaced-repetition scheduler (SuperMemo 2), with a documented floor so a
 * lapse can never make a card vanish. Every input and output is explicit so
 * the scheduler can be swapped for FSRS later without touching call sites.
 */
export type Rating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export type CardState = { ease: number; intervalDays: number; repetitions: number; lapses: number };
export type Scheduled = CardState & { dueInDays: number };

const QUALITY: Record<Rating, number> = { AGAIN: 1, HARD: 3, GOOD: 4, EASY: 5 };
const MIN_EASE = 1.3;

export function initialState(): CardState {
  return { ease: 2.5, intervalDays: 0, repetitions: 0, lapses: 0 };
}

export function schedule(state: CardState, rating: Rating, now: Date = new Date()): Scheduled {
  const q = QUALITY[rating];
  let { ease, intervalDays, repetitions, lapses } = state;

  // Ease adjustment (SM-2 EF formula), floored so cards stay reviewable.
  ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ease < MIN_EASE) ease = MIN_EASE;

  let nextInterval: number;
  if (q < 3) {
    // Lapse: reset repetitions, short relearning interval.
    repetitions = 0;
    lapses += 1;
    nextInterval = rating === 'AGAIN' ? 0.0069 : 0.25; // ~10 minutes, or 6 hours
  } else {
    repetitions += 1;
    if (repetitions === 1) nextInterval = rating === 'HARD' ? 1 : 1;
    else if (repetitions === 2) nextInterval = rating === 'EASY' ? 6 : 3;
    else {
      const factor = rating === 'HARD' ? 1.2 : rating === 'EASY' ? ease * 1.3 : ease;
      nextInterval = intervalDays * factor;
    }
  }

  // Never schedule into the past, never beyond ~2 years.
  nextInterval = Math.min(Math.max(nextInterval, 0.0069), 730);
  intervalDays = nextInterval;

  return {
    ease: round2(ease),
    intervalDays: round4(nextInterval),
    repetitions,
    lapses,
    dueInDays: round4(nextInterval)
  };
}

export function dueDate(from: Date, dueInDays: number): Date {
  return new Date(from.getTime() + dueInDays * 864e5);
}

function round2(n: number) { return Math.round(n * 100) / 100; }
function round4(n: number) { return Math.round(n * 10000) / 10000; }

/** Retention summary computed from real review events — no invented precision. */
export function retentionSummary(reviews: { rating: Rating }[]) {
  if (reviews.length < 5) return { sufficient: false as const, count: reviews.length };
  const remembered = reviews.filter((r) => r.rating !== 'AGAIN').length;
  return {
    sufficient: true as const,
    count: reviews.length,
    retentionPercent: Math.round((remembered / reviews.length) * 100)
  };
}
