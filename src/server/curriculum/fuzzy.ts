/**
 * Fuzzy search + alias resolution for curriculum lookups (§05).
 * "edexel" → Edexcel, "aqa bio" → AQA Biology. Never silently rewrites a
 * selection — it returns the resolved interpretation for the UI to confirm.
 */
export type FuzzyHit<T> = { item: T; score: number };

export function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length]!;
}

/** 0 = identical, 1 = nothing in common. */
export function distance(a: string, b: string): number {
  const x = normalise(a); const y = normalise(b);
  if (!x || !y) return 1;
  return levenshtein(x, y) / Math.max(x.length, y.length);
}

export function fuzzyMatch<T>(query: string, items: T[], getText: (t: T) => string[], limit = 8, maxDistance = 0.45): FuzzyHit<T>[] {
  const q = normalise(query);
  if (!q) return [];
  const scored: FuzzyHit<T>[] = [];
  for (const item of items) {
    let best = 1;
    for (const cand of getText(item)) {
      const c = normalise(cand);
      if (!c) continue;
      let d = distance(q, c);
      if (c.startsWith(q) || c.includes(q)) d = Math.min(d, 0.05 + (1 - q.length / c.length) * 0.2);
      // Multi-token query ("aqa bio"): every token must land somewhere.
      const tokens = q.split(' ');
      if (tokens.length > 1) {
        const allHit = tokens.every((t) => c.includes(t) || distance(t, c) < 0.5);
        if (allHit) d = Math.min(d, 0.12);
      }
      best = Math.min(best, d);
    }
    if (best <= maxDistance) scored.push({ item, score: round3(1 - best) });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

function round3(n: number) { return Math.round(n * 1000) / 1000; }
