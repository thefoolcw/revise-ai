export type TaskClass =
  | 'CHAT' | 'SOLVE_MATHS' | 'SOLVE_SCIENCE' | 'ESSAY_FEEDBACK' | 'CODE'
  | 'VISION' | 'DOCUMENT_QA' | 'LONG_CONTEXT' | 'STRUCTURED_OUTPUT' | 'TOOL_USE';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type DiscoveredModel = {
  id: string; ownedBy: string | null; created: number | null; raw?: Record<string, unknown>;
};

export type GenerateOptions = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
  signal?: AbortSignal;
};

export type GenerateResult = {
  text: string;
  model: string;
  usage: { inputTokens: number | null; outputTokens: number | null };
  latencyMs: number;
  finishReason: string | null;
};

export type ProviderError = {
  kind: 'UNAUTHORIZED' | 'RATE_LIMIT' | 'MODEL_NOT_FOUND' | 'TIMEOUT' | 'SERVER' | 'NETWORK' | 'BAD_RESPONSE' | 'CONFIG';
  status?: number;
  /** Safe, user-facing. Never contains credentials or raw provider payloads. */
  message: string;
  retryable: boolean;
};

export interface ModelProvider {
  readonly name: string;
  validateConfig(): { ok: boolean; missing: string[] };
  healthCheck(): Promise<{ ok: boolean; latencyMs: number; detail?: string }>;
  listModels(signal?: AbortSignal): Promise<{ ok: true; models: DiscoveredModel[] } | { ok: false; error: ProviderError }>;
  generate(opts: GenerateOptions): Promise<{ ok: true; result: GenerateResult } | { ok: false; error: ProviderError }>;
  stream(opts: GenerateOptions, onDelta: (chunk: string) => void): Promise<{ ok: true; result: GenerateResult } | { ok: false; error: ProviderError }>;
}
