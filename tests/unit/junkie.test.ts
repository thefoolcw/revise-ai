import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JunkieKeyProvider } from '../../src/server/premium/junkie';

/**
 * Exercises the real adapter against the documented JNKIE response shapes,
 * with fetch stubbed. No network calls, no real keys.
 */
const BASE = 'https://api.jnkie.com';
const PATH = '/api/v2/keys';

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

let fetchSpy: ReturnType<typeof spyFetch>;

/** Typed wrapper: globalThis's fetch signature is not part of the lib type here. */
const spyFetch = () => vi.spyOn(globalThis as { fetch: typeof fetch }, 'fetch');

beforeEach(() => { fetchSpy = spyFetch(); });
afterEach(() => { vi.restoreAllMocks(); });

const provider = () => new JunkieKeyProvider({ baseUrl: BASE, keysPath: PATH, apiKey: 'test-key', timeoutMs: 2000 });

describe('JNKIE key provider', () => {
  it('refuses to verify when the credential is missing', async () => {
    const p = new JunkieKeyProvider({ baseUrl: BASE, keysPath: PATH, apiKey: '' });
    expect(p.validateConfig().ok).toBe(false);
    expect(p.validateConfig().missing).toContain('JUNKIE_API_KEY');
    const r = await p.verifyKey('ANYTHING-1234');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.state).toBe('SERVICE_UNAVAILABLE');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends the key in the path with a Bearer credential and never logs the raw key', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(200, { key: { id: 1 } }));
    await provider().verifyKey('SAVAGE-abc-123');
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe(`${BASE}${PATH}/SAVAGE-abc-123`);
    expect((init as RequestInit).headers).toMatchObject({ Authorization: 'Bearer test-key' });
  });

  it('maps a 200 with future expiry to ISSUED', async () => {
    const future = new Date(Date.now() + 864e5).toISOString();
    fetchSpy.mockResolvedValue(jsonResponse(200, {
      key: { id: 42, service_id: 9, provider_id: 3, is_invalidated: false, expires_at: future, is_premium: true, one_time_use: false }
    }));
    const r = await provider().verifyKey('VALID-KEY-0001');
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.state).toBe('ISSUED'); expect(r.reference).toBe('42'); }
  });

  it('maps a 404 to INVALID (a definitive negative, not an outage)', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(404, { error: 'Key not found' }));
    const r = await provider().verifyKey('BOGUS-KEY-0001');
    expect(r.ok).toBe(false);
    if (!r.ok) { expect(r.state).toBe('INVALID'); expect(r.retryable).toBe(false); }
  });

  it('maps is_invalidated to REVOKED', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(200, { key: { id: 7, is_invalidated: true } }));
    const r = await provider().verifyKey('REVOKED-KEY-01');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.state).toBe('REVOKED');
  });

  it('maps a past expires_at to EXPIRED', async () => {
    const past = new Date(Date.now() - 864e5).toISOString();
    fetchSpy.mockResolvedValue(jsonResponse(200, { key: { id: 8, is_invalidated: false, expires_at: past } }));
    const r = await provider().verifyKey('EXPIRED-KEY-01');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.state).toBe('EXPIRED');
  });

  it('treats 401/403 as a provider problem, never as an invalid key', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(403, { message: 'forbidden' }));
    const r = await provider().verifyKey('SOME-KEY-0001');
    expect(r.ok).toBe(false);
    if (!r.ok) { expect(r.state).toBe('SERVICE_UNAVAILABLE'); expect(r.retryable).toBe(true); }
  });

  it('treats 429 as retryable unavailability', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(429, { message: 'slow down' }));
    const r = await provider().verifyKey('SOME-KEY-0001');
    expect(r.ok).toBe(false);
    if (!r.ok) { expect(r.state).toBe('SERVICE_UNAVAILABLE'); expect(r.retryable).toBe(true); }
  });

  it('retries a 5xx then reports unavailability', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(503, { error: 'down' }));
    const r = await provider().verifyKey('SOME-KEY-0001');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.state).toBe('SERVICE_UNAVAILABLE');
    expect(fetchSpy.mock.calls.length).toBeGreaterThan(1); // retried
  });

  it('does NOT retry a 404 (a definitive answer)', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(404, { error: 'nope' }));
    await provider().verifyKey('BOGUS-KEY-0001');
    expect(fetchSpy.mock.calls.length).toBe(1);
  });

  it('degrades to SERVICE_UNAVAILABLE on a malformed payload rather than granting', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(200, { unexpected: true }));
    const r = await provider().verifyKey('SOME-KEY-0001');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.state).toBe('SERVICE_UNAVAILABLE');
  });

  it('degrades to SERVICE_UNAVAILABLE on a network failure', async () => {
    fetchSpy.mockRejectedValue(new Error('ECONNREFUSED'));
    const r = await provider().verifyKey('SOME-KEY-0001');
    expect(r.ok).toBe(false);
    if (!r.ok) { expect(r.state).toBe('SERVICE_UNAVAILABLE'); expect(r.retryable).toBe(true); }
  });

  it('does not leak the API key or raw key in its safe metadata', async () => {
    const future = new Date(Date.now() + 864e5).toISOString();
    fetchSpy.mockResolvedValue(jsonResponse(200, { key: { id: 1, key_value: 'SAVAGE-secret-value', expires_at: future } }));
    const r = await provider().verifyKey('SAVAGE-secret-value');
    expect(r.ok).toBe(true);
    if (r.ok) {
      const dumped = JSON.stringify(r.meta);
      expect(dumped).not.toContain('SAVAGE-secret-value');
      expect(dumped).not.toContain('test-key');
    }
  });
});
