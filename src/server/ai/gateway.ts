import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { getProvider } from './provider';
import { resolveCandidates, shouldFallBack, recordFailure, recordSuccess } from './routing';
import { recordUsage } from '../usage/ledger';
import { EntitlementService } from '../premium/entitlements';
import type { ChatMessage, TaskClass } from './types';
import { redact } from '../api/respond';

export type GatewayRequest = {
  userId: string;
  feature: 'TUTOR' | 'SOLVE' | 'QUIZ' | 'FLASHCARDS' | 'PLANNER' | 'DOCUMENT_QA' | 'MARKING' | 'NOTES';
  task: TaskClass;
  messages: ChatMessage[];
  requestedModelId?: string | null;
  promptVersion?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
  signal?: AbortSignal;
};

export type GatewaySuccess = {
  ok: true;
  text: string;
  runId: string;
  requestId: string;
  modelUsed: string;
  modelDisplayName: string;
  fallbackUsed: boolean;
  fallbackNotice: string | null;
  usage: { inputTokens: number | null; outputTokens: number | null };
  latencyMs: number;
};

export type GatewayFailure = {
  ok: false;
  code: 'MODEL_NOT_INCLUDED' | 'MODEL_NOT_FOUND' | 'NO_ELIGIBLE_MODEL' | 'AI_PROVIDER_ERROR' | 'CONFIG_ERROR';
  message: string;
  retryable: boolean;
  requestId: string;
  runId?: string;
};

export type GatewayResult = GatewaySuccess | GatewayFailure;

const MAX_FALLBACKS = 3;

async function openRun(req: GatewayRequest, requestId: string) {
  const db = await getDb();
  const [run] = await db.insert(schema.aiRuns).values({
    userId: req.userId, requestId, feature: req.feature, task: req.task,
    requestedModelId: req.requestedModelId ?? null, status: 'STARTED',
    promptVersion: req.promptVersion ?? null
  }).returning();
  return run!;
}

async function closeRun(runId: string, patch: Record<string, unknown>) {
  const db = await getDb();
  await db.update(schema.aiRuns).set({ ...patch, completedAt: new Date() }).where(eq(schema.aiRuns.id, runId));
}

/**
 * Single entry point for all AI work. Handles entitlement-aware routing,
 * fallback across eligible models, circuit breaking, run recording and
 * usage accounting. Providers are never called directly from routes.
 */
export async function generateText(req: GatewayRequest): Promise<GatewayResult> {
  const requestId = crypto.randomUUID();
  const access = await EntitlementService.hasPremium(req.userId);
  const premium = access.hasPremium;
  const entitlementSource = premium ? (access as { source: string }).source : 'FREE';

  const run = await openRun(req, requestId);

  const routing = await resolveCandidates({ task: req.task, requestedModelId: req.requestedModelId, premium });
  if (!routing.ok) {
    await closeRun(run.id, { status: 'FAILED', errorCode: routing.reason });
    return { ok: false, code: routing.reason as GatewayFailure['code'], message: routing.message, retryable: false, requestId, runId: run.id };
  }

  const provider = getProvider();
  const candidates = routing.candidates.slice(0, MAX_FALLBACKS);
  let lastMessage = 'No model could handle this request.';
  let fallbackUsed = false;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i]!;
    if (req.signal?.aborted) {
      await closeRun(run.id, { status: 'INTERRUPTED', actualModelId: c.modelId });
      return { ok: false, code: 'AI_PROVIDER_ERROR', message: 'The request was cancelled.', retryable: false, requestId, runId: run.id };
    }
    const r = await provider.generate({
      model: c.modelId, messages: req.messages,
      temperature: req.temperature ?? 0.4,
      maxTokens: Math.min(req.maxTokens ?? 1024, c.maxOutputTokens || 2048),
      responseFormat: req.responseFormat, signal: req.signal
    });

    if (r.ok) {
      recordSuccess(c.modelId);
      await closeRun(run.id, {
        status: 'COMPLETED', actualModelId: c.modelId, fallbackUsed,
        latencyMs: r.result.latencyMs, inputTokens: r.result.usage.inputTokens,
        outputTokens: r.result.usage.outputTokens, entitlementSource
      });
      await persistUsage(req, c.modelId, r.result.usage, requestId, entitlementSource);
      return {
        ok: true, text: r.result.text, runId: run.id, requestId,
        modelUsed: c.modelId, modelDisplayName: c.displayName,
        fallbackUsed, fallbackNotice: fallbackUsed ? (routing.reason ?? 'Another compatible model handled this request.') : null,
        usage: r.result.usage, latencyMs: r.result.latencyMs
      };
    }

    recordFailure(c.modelId);
    lastMessage = r.error.message;
    if (!shouldFallBack(r.error.kind)) {
      await closeRun(run.id, { status: 'FAILED', actualModelId: c.modelId, errorCode: r.error.kind });
      return { ok: false, code: r.error.kind === 'UNAUTHORIZED' || r.error.kind === 'CONFIG' ? 'CONFIG_ERROR' : 'AI_PROVIDER_ERROR', message: r.error.message, retryable: r.error.retryable, requestId, runId: run.id };
    }
    if (i > 0 || routing.preferredIsFallback) fallbackUsed = true;
  }

  await closeRun(run.id, { status: 'FAILED', errorCode: 'NO_ELIGIBLE_MODEL' });
  return { ok: false, code: 'NO_ELIGIBLE_MODEL', message: lastMessage, retryable: true, requestId, runId: run.id };
}

/** Streaming variant. The run row is created before the first token (§26). */
export async function streamText(
  req: GatewayRequest,
  onDelta: (chunk: string) => void,
  onMeta?: (meta: { modelUsed: string; fallbackUsed: boolean; fallbackNotice: string | null; runId: string }) => void
): Promise<GatewayResult> {
  const requestId = crypto.randomUUID();
  const access = await EntitlementService.hasPremium(req.userId);
  const premium = access.hasPremium;
  const entitlementSource = premium ? (access as { source: string }).source : 'FREE';
  const run = await openRun(req, requestId);

  const routing = await resolveCandidates({ task: req.task, requestedModelId: req.requestedModelId, premium });
  if (!routing.ok) {
    await closeRun(run.id, { status: 'FAILED', errorCode: routing.reason });
    return { ok: false, code: routing.reason as GatewayFailure['code'], message: routing.message, retryable: false, requestId, runId: run.id };
  }

  const provider = getProvider();
  const candidates = routing.candidates.slice(0, MAX_FALLBACKS);
  let lastMessage = 'No model could handle this request.';
  let fallbackUsed = false;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i]!;
    let emitted = false;
    const r = await provider.stream({
      model: c.modelId, messages: req.messages,
      temperature: req.temperature ?? 0.4,
      maxTokens: Math.min(req.maxTokens ?? 1024, c.maxOutputTokens || 2048),
      signal: req.signal
    }, (chunk) => { emitted = true; onDelta(chunk); });

    if (r.ok) {
      recordSuccess(c.modelId);
      onMeta?.({ modelUsed: c.modelId, fallbackUsed, fallbackNotice: fallbackUsed ? (routing.reason ?? 'Another compatible model handled this request.') : null, runId: run.id });
      await closeRun(run.id, {
        status: 'COMPLETED', actualModelId: c.modelId, fallbackUsed, latencyMs: r.result.latencyMs,
        inputTokens: r.result.usage.inputTokens, outputTokens: r.result.usage.outputTokens, entitlementSource
      });
      await persistUsage(req, c.modelId, r.result.usage, requestId, entitlementSource);
      return {
        ok: true, text: r.result.text, runId: run.id, requestId,
        modelUsed: c.modelId, modelDisplayName: c.displayName, fallbackUsed,
        fallbackNotice: fallbackUsed ? (routing.reason ?? null) : null,
        usage: r.result.usage, latencyMs: r.result.latencyMs
      };
    }

    // Once bytes have reached the client we cannot silently switch models.
    if (emitted) {
      recordFailure(c.modelId);
      await closeRun(run.id, { status: 'INTERRUPTED', actualModelId: c.modelId, errorCode: r.error.kind });
      return { ok: false, code: 'AI_PROVIDER_ERROR', message: 'The response was interrupted. Please try again.', retryable: true, requestId, runId: run.id };
    }

    recordFailure(c.modelId);
    lastMessage = r.error.message;
    if (!shouldFallBack(r.error.kind)) {
      await closeRun(run.id, { status: 'FAILED', actualModelId: c.modelId, errorCode: r.error.kind });
      return { ok: false, code: 'AI_PROVIDER_ERROR', message: r.error.message, retryable: r.error.retryable, requestId, runId: run.id };
    }
    if (i > 0 || routing.preferredIsFallback) fallbackUsed = true;
  }

  await closeRun(run.id, { status: 'FAILED', errorCode: 'NO_ELIGIBLE_MODEL' });
  return { ok: false, code: 'NO_ELIGIBLE_MODEL', message: lastMessage, retryable: true, requestId, runId: run.id };
}

async function persistUsage(req: GatewayRequest, modelId: string, usage: { inputTokens: number | null; outputTokens: number | null }, requestId: string, entitlementSource: string) {
  try {
    await recordUsage({ userId: req.userId, metric: 'ai_requests', amount: 1, modelId, feature: req.feature, requestId, entitlementSource });
    if (usage.inputTokens != null) await recordUsage({ userId: req.userId, metric: 'input_tokens', amount: usage.inputTokens, modelId, feature: req.feature, requestId, entitlementSource });
    if (usage.outputTokens != null) await recordUsage({ userId: req.userId, metric: 'output_tokens', amount: usage.outputTokens, modelId, feature: req.feature, requestId, entitlementSource });
  } catch (e) {
    console.error('[gateway] usage persist failed:', redact(String(e)));
  }
}
