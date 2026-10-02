import { env, maskSecret } from '../config/env';
import type { KeyProvider, KeyVerificationOutcome } from './types';

/**
 * JNKIE key provider.
 *
 * Contract implemented against the published REST API
 * (https://docs.jnkie.com/rest-api/keys), verified live during the build:
 *
 *   GET {JUNKIE_BASE_URL}{JUNKIE_KEYS_PATH}/{keyValue}
 *   Authorization: Bearer {JUNKIE_API_KEY}
 *     200 → { key: { is_invalidated, expires_at, used_at, one_time_use, ... } }
 *     404 → { error: ... }          key does not exist
 *     403 → rate limited / scope    treat as SERVICE_UNAVAILABLE (retryable)
 *
 * Only the endpoint PATH and BASE are configurable; the response shape is
 * parsed defensively so an unexpected payload degrades to SERVICE_UNAVAILABLE
 * rather than granting anything.
 */
export class JunkieKeyProvider implements KeyProvider {
  readonly name = 'junkie';
  private baseUrl: string;
  private keysPath: string;
  private apiKey: string | undefined;
  private timeoutMs: number;

  constructor(cfg?: { baseUrl?: string; keysPath?: string; apiKey?: string; timeoutMs?: number }) {
    this.baseUrl = (cfg?.baseUrl ?? env.JUNKIE_BASE_URL).replace(/\/+$/, '');
    this.keysPath = cfg?.keysPath ?? env.JUNKIE_KEYS_PATH;
    this.apiKey = cfg?.apiKey ?? env.JUNKIE_API_KEY;
    this.timeoutMs = cfg?.timeoutMs ?? env.JUNKIE_TIMEOUT_MS;
  }

  validateConfig() {
    const missing: string[] = [];
    if (!this.apiKey) missing.push('JUNKIE_API_KEY');
    if (!this.baseUrl) missing.push('JUNKIE_BASE_URL');
    return { ok: missing.length === 0, missing };
  }

  private url(keyValue: string) {
    return `${this.baseUrl}${this.keysPath}/${encodeURIComponent(keyValue)}`;
  }

  async healthCheck() {
    const start = Date.now();
    const cfg = this.validateConfig();
    if (!cfg.ok) return { ok: false, latencyMs: 0, detail: `missing ${cfg.missing.join(', ')}` };
    try {
      const res = await this.request(this.keysPath + '?limit=1', { method: 'GET' });
      return { ok: res.status >= 200 && res.status < 300, latencyMs: Date.now() - start, detail: `HTTP ${res.status}` };
    } catch (e) {
      return { ok: false, latencyMs: Date.now() - start, detail: e instanceof Error ? e.name : 'network error' };
    }
  }

  async verifyKey(rawKey: string): Promise<KeyVerificationOutcome> {
    const cfg = this.validateConfig();
    if (!cfg.ok) {
      return { ok: false, state: 'SERVICE_UNAVAILABLE', message: 'Key verification is not configured.', retryable: false };
    }
    const started = Date.now();
    let res: { status: number; body: unknown };
    try {
      res = await this.withRetry(() => this.request(this.keysPath + '/' + encodeURIComponent(rawKey), { method: 'GET' }));
    } catch (e) {
      return { ok: false, state: 'SERVICE_UNAVAILABLE', message: 'Could not reach the key provider.', retryable: true };
    }

    // 404 = key does not exist. This is a definitive negative, not an outage.
    if (res.status === 404) {
      return { ok: false, state: 'INVALID', message: 'That key was not recognised.', retryable: false };
    }
    if (res.status === 401 || res.status === 403) {
      // Our own credential/scope problem or provider throttling — never the user's fault.
      console.warn(`[junkie] auth/throttle response ${res.status} (key ${maskSecret(this.apiKey)})`);
      return { ok: false, state: 'SERVICE_UNAVAILABLE', message: 'Key service is temporarily unavailable.', retryable: true };
    }
    if (res.status === 429) {
      return { ok: false, state: 'SERVICE_UNAVAILABLE', message: 'Key service is busy. Please try again shortly.', retryable: true };
    }
    if (res.status < 200 || res.status >= 300) {
      return { ok: false, state: 'SERVICE_UNAVAILABLE', message: 'Key service returned an unexpected response.', retryable: true };
    }

    const key = (res.body as { key?: Record<string, unknown> } | null)?.key;
    if (!key || typeof key !== 'object') {
      return { ok: false, state: 'SERVICE_UNAVAILABLE', message: 'Key service returned an unrecognised response.', retryable: true };
    }

    const reference = String(key.id ?? '');
    const meta = this.safeMeta(key);

    if (key.is_invalidated === true) {
      return { ok: false, state: 'REVOKED', reference, message: 'This key has been revoked.', retryable: false };
    }
    const expiresAt = parseDate(key.expires_at);
    if (expiresAt && expiresAt.getTime() < Date.now()) {
      return { ok: false, state: 'EXPIRED', reference, message: 'This key has expired.', retryable: false };
    }

    return { ok: true, state: 'ISSUED', reference, meta };
  }

  /** Strips everything except non-sensitive state needed for the audit record. */
  private safeMeta(key: Record<string, unknown>): Record<string, unknown> {
    return {
      providerKeyId: typeof key.id === 'number' ? key.id : null,
      serviceId: key.service_id ?? null,
      providerId: key.provider_id ?? null,
      isPremium: key.is_premium === true,
      oneTimeUse: key.one_time_use === true,
      expiryOnFirstUse: key.expiry_on_first_use === true,
      providerUsedAt: typeof key.used_at === 'string' ? key.used_at : null,
      providerExpiresAt: typeof key.expires_at === 'string' ? key.expires_at : null,
      verifiedWithLatency: true
    };
  }

  private async request(path: string, init: { method: string; body?: unknown }): Promise<{ status: number; body: unknown }> {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: init.method,
        headers: { Authorization: `Bearer ${this.apiKey}`, Accept: 'application/json', 'User-Agent': 'revise-ai/1.0' },
        signal: ac.signal
      });
      let body: unknown = null;
      const text = await res.text();
      if (text) { try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 200) }; } }
      return { status: res.status, body };
    } finally {
      clearTimeout(timer);
    }
  }

  /** Retries only on network failure / 5xx. Never retries a 404 or a 4xx. */
  private async withRetry<T extends { status: number }>(fn: () => Promise<T>, attempts = 2): Promise<T> {
    let lastErr: unknown;
    for (let i = 0; i <= attempts; i++) {
      try {
        const r = await fn();
        if (r.status >= 500 && i < attempts) { await sleep(250 * 2 ** i); continue; }
        return r;
      } catch (e) {
        lastErr = e;
        if (i < attempts) await sleep(250 * 2 ** i);
      }
    }
    throw lastErr;
  }
}

function parseDate(v: unknown): Date | null {
  if (typeof v !== 'string') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
