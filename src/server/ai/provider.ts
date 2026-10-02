import { env, isProduction } from '../config/env';
import type { ModelProvider } from './types';
import { NvidiaProvider } from './providers/nvidia';

let cached: ModelProvider | null = null;

export function getProvider(): ModelProvider {
  if (cached) return cached;
  if (env.AI_MOCK) {
    if (isProduction()) throw new Error('AI_MOCK cannot be enabled when NODE_ENV=production.');
    // Imported lazily so the mock never enters the production bundle path.
    const { MockAIProvider } = require('./providers/mock') as typeof import('./providers/mock');
    cached = new MockAIProvider();
  } else {
    cached = new NvidiaProvider();
  }
  return cached;
}

export function resetProviderForTests() { cached = null; }
