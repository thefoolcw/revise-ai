import { env, isProduction } from '../config/env';
import type { KeyProvider } from './types';
import { JunkieKeyProvider } from './junkie';
import { MockJunkieProvider } from './mockJunkie';

let cached: KeyProvider | null = null;

/** Resolves the configured provider. Mocks are hard-blocked in production. */
export function getKeyProvider(): KeyProvider {
  if (cached) return cached;
  if (env.JUNKIE_MOCK) {
    if (isProduction()) throw new Error('JUNKIE_MOCK cannot be enabled when NODE_ENV=production.');
    cached = new MockJunkieProvider();
  } else {
    cached = new JunkieKeyProvider();
  }
  return cached;
}

export function resetKeyProviderForTests() { cached = null; }
