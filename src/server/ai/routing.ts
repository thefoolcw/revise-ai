import { and, eq } from 'drizzle-orm';
import { getDb, schema } from '../db';
import type { TaskClass } from './types';

/**
 * In-process circuit breaker. Prevents hammering a model that is already
 * failing, while keeping its history intact. State is per-process and
 * intentionally short-lived — the database remains the durable record.
 */
type Breaker = { failures: number; openedAt: number };
const breakers = new Map<string, Breaker>();

const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 60_000;

export function isCircuitOpen(modelId: string): boolean {
  const b = breakers.get(modelId);
  if (!b) return false;
  if (b.failures < FAILURE_THRESHOLD) return false;
  if (Date.now() - b.openedAt > COOLDOWN_MS) {
    // Half-open: allow a trial request.
    breakers.set(modelId, { failures: FAILURE_THRESHOLD - 1, openedAt: b.openedAt });
    return false;
  }
  return true;
}
export function recordFailure(modelId: string) {
  const b = breakers.get(modelId) ?? { failures: 0, openedAt: 0 };
  b.failures += 1;
  if (b.failures >= FAILURE_THRESHOLD) b.openedAt = Date.now();
  breakers.set(modelId, b);
}
export function recordSuccess(modelId: string) { breakers.delete(modelId); }
export function resetBreakers() { breakers.clear(); }
export function breakerState() { return Object.fromEntries([...breakers].map(([k, v]) => [k, v])); }

export type Candidate = {
  modelId: string; displayName: string; premiumOnly: boolean;
  tasks: TaskClass[]; fallbackRank: number; maxOutputTokens: number;
};

export type RoutingInput = {
  task: TaskClass;
  requestedModelId?: string | null;
  premium: boolean;
};

export type RoutingResult =
  | { ok: true; candidates: Candidate[]; preferredIsFallback: boolean; reason: string | null }
  | { ok: false; reason: 'NO_ELIGIBLE_MODEL' | 'MODEL_NOT_INCLUDED' | 'MODEL_NOT_FOUND'; message: string };

/**
 * Task classes other than CHAT are routing PREFERENCES, not hard capability
 * gates. The provider catalogue does not advertise "can solve AQA mechanics",
 * so inferring SOLVE_MATHS from a model id would be an invented capability
 * claim (§55). Instead: try models explicitly tagged for the task, then widen
 * to the general baseline that genuinely can do the work.
 *
 * VISION and STRUCTURED_OUTPUT stay hard requirements — those are real
 * interface capabilities that a plain chat call cannot substitute for.
 */
const TASK_FALLBACKS: Partial<Record<TaskClass, TaskClass[]>> = {
  SOLVE_MATHS: ['CHAT', 'LONG_CONTEXT'],
  SOLVE_SCIENCE: ['CHAT', 'LONG_CONTEXT'],
  ESSAY_FEEDBACK: ['CHAT', 'LONG_CONTEXT'],
  CODE: ['CHAT'],
  DOCUMENT_QA: ['LONG_CONTEXT', 'CHAT'],
  LONG_CONTEXT: ['CHAT'],
  STRUCTURED_OUTPUT: ['CHAT'],
  TOOL_USE: ['CHAT']
};

/** Ordered task tags to try for a request, most specific first. */
export function taskChain(task: TaskClass): TaskClass[] {
  return [task, ...(TASK_FALLBACKS[task] ?? [])];
}

/**
 * Builds the ordered candidate list for a task (§55).
 *  1. the user's explicit model, if available AND permitted for this task
 *  2. models tagged for the task, by fallback rank
 *  3. models tagged for a general fallback task, by fallback rank
 * A premium-only model is never silently substituted for a non-entitled user —
 * that produces MODEL_NOT_INCLUDED, not a technical error.
 */
export async function resolveCandidates(input: RoutingInput): Promise<RoutingResult> {
  const db = await getDb();
  const rows = await db.select().from(schema.modelRegistry)
    .where(and(eq(schema.modelRegistry.enabled, true), eq(schema.modelRegistry.available, true)))
    .orderBy(schema.modelRegistry.fallbackRank, schema.modelRegistry.modelId);

  const toCandidate = (r: typeof rows[number]): Candidate => ({
    modelId: r.modelId, displayName: r.displayName ?? r.modelId, premiumOnly: r.premiumOnly,
    tasks: r.tasks as TaskClass[], fallbackRank: r.fallbackRank, maxOutputTokens: r.maxOutputTokens
  });

  const chain = taskChain(input.task);
  const eligible = rows.filter((r) => {
    const tags = r.tasks as string[];
    return chain.some((t) => tags.includes(t));
  });
  // Most specific task tag first, then fallback rank within each tier.
  const tierOf = (r: typeof rows[number]) => {
    const tags = r.tasks as string[];
    const i = chain.findIndex((t) => tags.includes(t));
    return i < 0 ? chain.length : i;
  };
  const taskCompatible = [...eligible].sort((a, b) =>
    tierOf(a) - tierOf(b) || a.fallbackRank - b.fallbackRank || a.modelId.localeCompare(b.modelId));

  if (input.requestedModelId) {
    const requested = rows.find((r) => r.modelId === input.requestedModelId);
    if (!requested) {
      return { ok: false, reason: 'MODEL_NOT_FOUND', message: 'That model is no longer available. Choose another model.' };
    }
    if (requested.premiumOnly && !input.premium) {
      return { ok: false, reason: 'MODEL_NOT_INCLUDED', message: 'Your current plan does not include this model.' };
    }
    const requestedOk = (requested.tasks as string[]).includes(input.task);
    if (requestedOk && !isCircuitOpen(requested.modelId)) {
      const rest = taskCompatible
        .filter((r) => r.modelId !== requested.modelId)
        .filter((r) => !r.premiumOnly || input.premium)
        .filter((r) => !isCircuitOpen(r.modelId))
        .map(toCandidate);
      return { ok: true, candidates: [toCandidate(requested), ...rest], preferredIsFallback: false, reason: null };
    }
    // Requested model exists but cannot do this task, or its breaker is open.
    const fallbacks = taskCompatible
      .filter((r) => !r.premiumOnly || input.premium)
      .filter((r) => !isCircuitOpen(r.modelId))
      .map(toCandidate);
    if (fallbacks.length === 0) {
      return { ok: false, reason: 'NO_ELIGIBLE_MODEL', message: 'No available model can handle this request right now.' };
    }
    const reason = isCircuitOpen(requested.modelId)
      ? 'Your selected model was unavailable, so another compatible model handled this request.'
      : 'Your selected model does not support this task, so a compatible model handled this request.';
    return { ok: true, candidates: fallbacks, preferredIsFallback: true, reason };
  }

  const fallbacks = taskCompatible
    .filter((r) => !r.premiumOnly || input.premium)
    .filter((r) => !isCircuitOpen(r.modelId))
    .map(toCandidate);

  if (fallbacks.length === 0) {
    return { ok: false, reason: 'NO_ELIGIBLE_MODEL', message: 'No available model can handle this request right now.' };
  }
  // Say so when the top pick is only qualified via the general baseline.
  const top = fallbacks[0]!;
  const exact = top.tasks.includes(input.task);
  return {
    ok: true, candidates: fallbacks, preferredIsFallback: !exact,
    reason: exact ? null
      : `No model is verified for ${input.task.replace(/_/g, ' ').toLowerCase()}, so a general-purpose model handled this request.`
  };
}

/** Whether an error class justifies moving to the next model in the chain. */
export function shouldFallBack(kind: string): boolean {
  return ['MODEL_NOT_FOUND', 'RATE_LIMIT', 'TIMEOUT', 'SERVER', 'NETWORK', 'BAD_RESPONSE'].includes(kind);
}
