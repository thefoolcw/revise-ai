/**
 * Validated application configuration.
 *
 * SECURITY: this module is server-only. It never serialises itself, never logs
 * values, and is never imported from a client component. `safePublicConfig()`
 * is the ONLY projection that may cross into the browser, and it contains no
 * credentials.
 */
import { z } from 'zod';

const boolish = z
  .enum(['true', 'false', '1', '0', ''])
  .transform((v) => v === 'true' || v === '1');

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1).default('file:./data/pgdata'),
  /**
   * TLS policy for the `postgres://` driver.
   *  - `auto` (default): require TLS in production, none otherwise.
   *  - `require`: always verify the server certificate.
   *  - `disable`: never use TLS. Only for a local/trusted database that has no
   *    certificate; never appropriate for a hosted provider.
   */
  DATABASE_SSL: z.enum(['auto', 'require', 'disable']).default('auto'),
  AUTH_SECRET: z.string().min(16).default('dev-only-auth-secret-change-me-9f2c41ab7d8e'),
  ENCRYPTION_KEY: z.string().min(16).default('dev-only-encryption-key-32-bytes-min-ok'),

  NVIDIA_API_KEY: z.string().optional(),
  NVIDIA_BASE_URL: z.string().url().default('https://integrate.api.nvidia.com/v1'),
  AI_MOCK: boolish.default('false'),

  JUNKIE_API_KEY: z.string().optional(),
  JUNKIE_BASE_URL: z.string().url().default('https://api.jnkie.com'),
  JUNKIE_KEYS_PATH: z.string().startsWith('/').default('/api/v2/keys'),
  JUNKIE_MOCK: boolish.default('false'),
  JUNKIE_TIMEOUT_MS: z.coerce.number().int().min(1000).default(12000),

  DISCORD_INVITE_URL: z.string().url().default('https://discord.gg/m4nUrSESum'),

  PREMIUM_PRICE_MINOR: z.coerce.number().int().min(0).default(399),
  PREMIUM_CURRENCY: z.string().length(3).default('GBP'),

  RATE_LIMIT_SCALE: z.coerce.number().min(0.1).default(1)
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

function load(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const names = parsed.error.issues.map((i) => i.path.join('.') || '(root)');
    // Intentionally prints variable NAMES only — never values.
    throw new Error(
      `[config] Invalid or missing environment configuration: ${names.join(', ')}. ` +
        `See docs/ENVIRONMENT.md for the required variables.`
    );
  }
  const env = parsed.data;

  if (env.NODE_ENV === 'production') {
    // Fail fast rather than booting a production app on dev defaults.
    const devOnly = env.AUTH_SECRET.startsWith('dev-only') || env.ENCRYPTION_KEY.startsWith('dev-only');
    if (devOnly) throw new Error('[config] AUTH_SECRET/ENCRYPTION_KEY must be replaced in production.');
    // Mocks must be impossible to enable accidentally in production.
    if (env.JUNKIE_MOCK || env.AI_MOCK) throw new Error('[config] Mock providers are disabled when NODE_ENV=production.');
    if (!env.NVIDIA_API_KEY) throw new Error('[config] NVIDIA_API_KEY is required in production.');
    if (!env.JUNKIE_API_KEY) throw new Error('[config] JUNKIE_API_KEY is required in production.');
    if (!process.env.DATABASE_URL) throw new Error('[config] DATABASE_URL is required in production.');
  }
  cached = env;
  return env;
}

export const env = new Proxy({} as Env, {
  get(_t, prop: string) {
    return (load() as unknown as Record<string, unknown>)[prop];
  },
  has(_t, prop: string) {
    return prop in load();
  },
  ownKeys() {
    return []; // Prevent accidental `{...env}` spreads that could leak secrets.
  }
});

export function isProduction() {
  return env.NODE_ENV === 'production';
}
export function isDev() {
  return env.NODE_ENV !== 'production';
}

/** Names of variables that are configured but empty — safe to surface to admins. */
export function missingRequiredForProduction(): string[] {
  const missing: string[] = [];
  if (!env.NVIDIA_API_KEY) missing.push('NVIDIA_API_KEY');
  if (!env.JUNKIE_API_KEY) missing.push('JUNKIE_API_KEY');
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  return missing;
}

/** Mask a secret for logs: shows shape only. */
export function maskSecret(v: string | undefined | null): string {
  if (!v) return '(unset)';
  if (v.length <= 8) return '****';
  return `${v.slice(0, 4)}…${v.slice(-2)} (${v.length} chars)`;
}
