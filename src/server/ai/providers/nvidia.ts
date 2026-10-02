import { env, maskSecret } from '../../config/env';
import type { ModelProvider, DiscoveredModel, GenerateOptions, GenerateResult, ProviderError, ChatMessage } from '../types';

/**
 * NVIDIA-hosted NIM endpoint adapter. OpenAI-compatible.
 * The API key is server-side only and never leaves this module.
 */
export class NvidiaProvider implements ModelProvider {
  readonly name = 'nvidia';
  private baseUrl: string;
  private apiKey: string | undefined;
  private timeoutMs: number;

  constructor(cfg?: { baseUrl?: string; apiKey?: string; timeoutMs?: number }) {
    this.baseUrl = (cfg?.baseUrl ?? env.NVIDIA_BASE_URL).replace(/\/+$/, '');
    this.apiKey = cfg?.apiKey ?? env.NVIDIA_API_KEY;
    this.timeoutMs = cfg?.timeoutMs ?? 120000;
  }

  validateConfig() {
    const missing: string[] = [];
    if (!this.apiKey) missing.push('NVIDIA_API_KEY');
    if (!this.baseUrl) missing.push('NVIDIA_BASE_URL');
    return { ok: missing.length === 0, missing };
  }

  async healthCheck() {
    const start = Date.now();
    if (!this.validateConfig().ok) return { ok: false, latencyMs: 0, detail: 'missing NVIDIA_API_KEY' };
    const r = await this.raw('GET', '/models');
    return { ok: r.status === 200, latencyMs: Date.now() - start, detail: `HTTP ${r.status}` };
  }

  async listModels(signal?: AbortSignal): Promise<{ ok: true; models: DiscoveredModel[] } | { ok: false; error: ProviderError }> {
    if (!this.validateConfig().ok) {
      return { ok: false as const, error: { kind: 'CONFIG' as const, message: 'The AI provider is not configured.', retryable: false } };
    }
    const r = await this.raw('GET', '/models', undefined, signal);
    if (r.status !== 200) return { ok: false as const, error: mapStatus(r.status) };
    const data = (r.body as { data?: unknown[] } | null)?.data;
    if (!Array.isArray(data)) return { ok: false as const, error: { kind: 'BAD_RESPONSE', message: 'Model catalogue was not in the expected shape.', retryable: true } };

    const models: DiscoveredModel[] = [];
    for (const m of data) {
      if (!m || typeof m !== 'object') continue;
      const id = (m as Record<string, unknown>).id;
      if (typeof id !== 'string' || !id) continue;
      const rec = m as Record<string, unknown>;
      models.push({
        id,
        ownedBy: typeof rec.owned_by === 'string' ? rec.owned_by : null,
        created: typeof rec.created === 'number' ? rec.created : null,
        raw: rec
      });
    }
    return { ok: true as const, models };
  }

  async generate(opts: GenerateOptions): Promise<{ ok: true; result: GenerateResult } | { ok: false; error: ProviderError }> {
    const start = Date.now();
    const r = await this.raw('POST', '/chat/completions', {
      model: opts.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 1024,
      stream: false,
      ...(opts.responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {})
    }, opts.signal);

    if (r.status !== 200) return { ok: false as const, error: mapStatus(r.status, r.body) };
    const parsed = parseCompletion(r.body);
    if (!parsed.ok) return { ok: false as const, error: parsed.error };
    return { ok: true as const, result: { ...parsed.result, latencyMs: Date.now() - start } };
  }

  async stream(opts: GenerateOptions, onDelta: (chunk: string) => void): Promise<{ ok: true; result: GenerateResult } | { ok: false; error: ProviderError }> {
    const start = Date.now();
    if (!this.validateConfig().ok) {
      return { ok: false as const, error: { kind: 'CONFIG' as const, message: 'The AI provider is not configured.', retryable: false } };
    }
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), this.timeoutMs);
    if (opts.signal) opts.signal.addEventListener('abort', () => ac.abort(), { once: true });

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          model: opts.model, messages: opts.messages,
          temperature: opts.temperature ?? 0.4, max_tokens: opts.maxTokens ?? 1024, stream: true
        }),
        signal: ac.signal
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return { ok: false as const, error: mapStatus(res.status, safeJson(text)) };
      }
      if (!res.body) return { ok: false as const, error: { kind: 'BAD_RESPONSE', message: 'The model returned no content.', retryable: true } };

      let full = '';
      let usage: { inputTokens: number | null; outputTokens: number | null } = { inputTokens: null, outputTokens: null };
      let finishReason: string | null = null;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith('data:')) continue;
          const payload = t.slice(5).trim();
          if (payload === '[DONE]') continue;
          const j = safeJson(payload);
          if (!j) continue;
          const delta = j.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta) { full += delta; onDelta(delta); }
          if (j.choices?.[0]?.finish_reason) finishReason = String(j.choices[0].finish_reason);
          if (j.usage) usage = normaliseUsage(j.usage);
        }
      }
      if (!full) return { ok: false as const, error: { kind: 'BAD_RESPONSE', message: 'The model returned an empty response.', retryable: true } };
      return { ok: true as const, result: { text: full, model: opts.model, usage, latencyMs: Date.now() - start, finishReason } };
    } catch (e) {
      if (ac.signal.aborted && opts.signal?.aborted) {
        return { ok: false as const, error: { kind: 'TIMEOUT', message: 'The request was cancelled.', retryable: false } };
      }
      return { ok: false as const, error: { kind: 'TIMEOUT', message: 'The model took too long to respond.', retryable: true } };
    } finally {
      clearTimeout(timer);
    }
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
  }

  private async raw(method: string, path: string, body?: unknown, signal?: AbortSignal) {
    if (!this.validateConfig().ok) return { status: 0, body: null };
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), this.timeoutMs);
    if (signal) signal.addEventListener('abort', () => ac.abort(), { once: true });
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method, headers: this.headers(),
        body: body ? JSON.stringify(body) : undefined, signal: ac.signal
      });
      const text = await res.text().catch(() => '');
      return { status: res.status, body: safeJson(text) };
    } catch (e) {
      return { status: 0, body: null };
    } finally {
      clearTimeout(timer);
    }
  }
}

/** Maps a provider status to a safe, retryable-aware error. Never leaks payloads. */
export function mapStatus(status: number, body?: unknown): ProviderError {
  if (status === 0) return { kind: 'NETWORK', message: 'Could not reach the AI provider.', retryable: true };
  if (status === 401) return { kind: 'UNAUTHORIZED', status, message: 'The AI provider rejected our credentials.', retryable: false };
  // 403 with a valid key means the credential is real but not entitled to run
  // inference (NVIDIA returns "Authorization failed" per-model). Saying
  // "rejected our credentials" here would send an operator chasing a bad key.
  if (status === 403) return {
    kind: 'UNAUTHORIZED', status,
    message: 'The AI provider key is valid but is not entitled to run inference on this model. Ask the provider to enable inference for the key.',
    retryable: false
  };
  // 410 Gone = the endpoint retired the model; the fallback chain should move on.
  if (status === 404 || status === 410) return { kind: 'MODEL_NOT_FOUND', status, message: 'That model is not available.', retryable: false };
  if (status === 429) return { kind: 'RATE_LIMIT', status, message: 'The AI provider is rate limiting requests. Please try again shortly.', retryable: true };
  if (status >= 500) return { kind: 'SERVER', status, message: 'The AI provider is having trouble. Please try again.', retryable: true };
  return { kind: 'BAD_RESPONSE', status, message: 'The AI provider returned an unexpected response.', retryable: false };
}

function parseCompletion(body: unknown): { ok: true; result: Omit<GenerateResult, 'latencyMs'> } | { ok: false; error: ProviderError } {
  const b = body as { choices?: { message?: { content?: string }; finish_reason?: string }[]; usage?: unknown } | null;
  const content = b?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content) {
    return { ok: false, error: { kind: 'BAD_RESPONSE', message: 'The model returned an empty response.', retryable: true } };
  }
  return {
    ok: true,
    result: {
      text: content,
      model: '',
      usage: normaliseUsage(b?.usage),
      finishReason: b?.choices?.[0]?.finish_reason ?? null
    }
  };
}

/** If the provider omits token counts we store null — never an invented number (§26). */
function normaliseUsage(u: unknown): { inputTokens: number | null; outputTokens: number | null } {
  if (!u || typeof u !== 'object') return { inputTokens: null, outputTokens: null };
  const r = u as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return { inputTokens: num(r.prompt_tokens ?? r.input_tokens), outputTokens: num(r.completion_tokens ?? r.output_tokens) };
}

function safeJson(text: string): any {
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}
