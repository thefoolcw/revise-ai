import { isProduction } from '../../config/env';
import type { ModelProvider, GenerateOptions, GenerateResult, DiscoveredModel, ProviderError } from '../types';

type GenerateOutcome = { ok: true; result: GenerateResult } | { ok: false; error: ProviderError };

/**
 * DEV-only AI provider. Exercises the real routing, fallback and usage-accounting
 * code paths without spending tokens. Impossible to enable in production.
 */
export class MockAIProvider implements ModelProvider {
  readonly name = 'mock';
  constructor() {
    if (isProduction()) throw new Error('MockAIProvider cannot be constructed when NODE_ENV=production.');
  }
  validateConfig() { return { ok: true, missing: [] }; }
  async healthCheck() { return { ok: true, latencyMs: 1, detail: 'mock' }; }

  async listModels(): Promise<{ ok: true; models: DiscoveredModel[] }> {
    return {
      ok: true,
      models: [
        { id: 'mock/mock-chat', ownedBy: 'mock', created: 0 },
        { id: 'mock/mock-coder', ownedBy: 'mock', created: 0 },
        { id: 'mock/mock-vision', ownedBy: 'mock', created: 0 }
      ]
    };
  }

  async generate(opts: GenerateOptions): Promise<GenerateOutcome> {
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 30));
    const last = opts.messages[opts.messages.length - 1]?.content ?? '';
    if (opts.model === 'mock/always-fail') {
      return { ok: false, error: { kind: 'SERVER', status: 500, message: 'Mock provider failure.', retryable: true } };
    }
    return {
      ok: true,
      result: {
        text: mockAnswer(opts, last),
        model: opts.model,
        usage: { inputTokens: Math.ceil(last.length / 4), outputTokens: 42 },
        latencyMs: Date.now() - start,
        finishReason: 'stop'
      }
    };
  }

  async stream(opts: GenerateOptions, onDelta: (chunk: string) => void): Promise<GenerateOutcome> {
    const start = Date.now();
    const last = opts.messages[opts.messages.length - 1]?.content ?? '';
    if (opts.model === 'mock/always-fail') {
      return { ok: false, error: { kind: 'SERVER', status: 500, message: 'Mock provider failure.', retryable: true } };
    }
    const text = mockAnswer(opts, last);
    for (const word of text.split(' ')) {
      if (opts.signal?.aborted) break;
      await new Promise((r) => setTimeout(r, 8));
      onDelta(word + ' ');
    }
    return {
      ok: true,
      result: { text, model: opts.model, usage: { inputTokens: Math.ceil(last.length / 4), outputTokens: Math.ceil(text.length / 4) }, latencyMs: Date.now() - start, finishReason: 'stop' }
    };
  }
}

function mockAnswer(opts: GenerateOptions, question: string): string {
  const q = question.slice(0, 160).replace(/\s+/g, ' ');
  if (opts.responseFormat === 'json') {
    return JSON.stringify({
      questions: [
        { type: 'SINGLE', prompt: `Which statement about "${q}" is correct?`, options: [{ id: 'a', label: 'Option A' }, { id: 'b', label: 'Option B' }, { id: 'c', label: 'Option C' }], answer: 'a', explanation: 'Mock explanation for testing the validation pipeline.', difficulty: 'MEDIUM' },
        { type: 'TRUE_FALSE', prompt: `Statement about "${q}".`, options: [{ id: 'true', label: 'True' }, { id: 'false', label: 'False' }], answer: true, explanation: 'Mock explanation.', difficulty: 'EASY' }
      ]
    });
  }
  return [
    `**Mock answer** (DEV provider — no tokens were spent).`,
    ``,
    `You asked about: ${q}`,
    ``,
    `**Method**`,
    `1. Restate what is known.`,
    `2. Choose the relationship that applies.`,
    `3. Substitute and solve, keeping units.`,
    ``,
    `**Check**: substitute the result back into the original relationship.`,
    ``,
    `_Set AI_MOCK=false and configure NVIDIA_API_KEY for real answers._`
  ].join('\n');
}
