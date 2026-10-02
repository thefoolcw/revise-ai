import { isProduction } from '../config/env';
import type { KeyProvider, KeyVerificationOutcome } from './types';

/**
 * DEV-only key provider so the redemption pipeline can be exercised without
 * burning real keys. It is impossible to enable in production: the factory
 * refuses, and the constructor throws.
 *
 * Test keys:
 *   DEV-VALID-KEY-0001  → VERIFIED
 *   DEV-INVALID-KEY-001 → INVALID
 *   DEV-EXPIRED-KEY-001 → EXPIRED
 *   DEV-REVOKED-KEY-001 → REVOKED
 *   DEV-USED-KEY-0001   → ALREADY_USED
 *   DEV-TIMEOUT-KEY-001 → SERVICE_UNAVAILABLE (simulates provider outage)
 */
/** Prefix → outcome. Any suffix is accepted, so tests can use unique keys. */
const PREFIXES: [string, KeyVerificationOutcome][] = [
  ['DEV-VALID-', { ok: true, state: 'ISSUED', reference: 'mock-ref', meta: { mock: true } }],
  ['DEV-INVALID-', { ok: false, state: 'INVALID', message: 'That key was not recognised.', retryable: false }],
  ['DEV-EXPIRED-', { ok: false, state: 'EXPIRED', message: 'This key has expired.', retryable: false }],
  ['DEV-REVOKED-', { ok: false, state: 'REVOKED', message: 'This key has been revoked.', retryable: false }],
  ['DEV-USED-', { ok: false, state: 'ALREADY_USED', message: 'This key has already been used.', retryable: false }],
  ['DEV-TIMEOUT-', { ok: false, state: 'SERVICE_UNAVAILABLE', message: 'Could not reach the key provider.', retryable: true }]
];

export const DOCUMENTED_TEST_KEYS = [
  'DEV-VALID-KEY-0001', 'DEV-INVALID-KEY-001', 'DEV-EXPIRED-KEY-001',
  'DEV-REVOKED-KEY-001', 'DEV-USED-KEY-001', 'DEV-TIMEOUT-KEY-001'
];

export class MockJunkieProvider implements KeyProvider {
  readonly name = 'junkie-mock';
  constructor() {
    if (isProduction()) throw new Error('MockJunkieProvider cannot be constructed when NODE_ENV=production.');
  }
  validateConfig() { return { ok: true, missing: [] }; }
  async healthCheck() { return { ok: true, latencyMs: 1, detail: 'mock' }; }
  async verifyKey(rawKey: string): Promise<KeyVerificationOutcome> {
    const k = rawKey.trim().toUpperCase();
    for (const [prefix, outcome] of PREFIXES) {
      if (k.startsWith(prefix)) return structuredClone(outcome);
    }
    return { ok: false, state: 'INVALID', message: 'That key was not recognised.', retryable: false };
  }
}
