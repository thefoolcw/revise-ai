import { handler } from '@/server/api/route';
import { getDb } from '@/server/db';
import { sql } from 'drizzle-orm';
import { getProvider } from '@/server/ai/provider';
import { getKeyProvider } from '@/server/premium/provider';

/** Aggregate health. Reports only status — never credentials or internals. */
export const GET = handler(async () => {
  const checks: Record<string, { status: 'operational' | 'degraded' | 'unavailable' | 'unknown'; latencyMs?: number; detail?: string }> = {};

  const t0 = Date.now();
  try { const db = await getDb(); await db.execute(sql`SELECT 1`); checks.database = { status: 'operational', latencyMs: Date.now() - t0 }; }
  catch { checks.database = { status: 'unavailable' }; }

  const ai = getProvider();
  const aiCfg = ai.validateConfig();
  checks.ai = aiCfg.ok ? { status: 'unknown', detail: 'configured' } : { status: 'unavailable', detail: `missing ${aiCfg.missing.join(', ')}` };

  const key = getKeyProvider();
  const keyCfg = key.validateConfig();
  checks.keyProvider = keyCfg.ok ? { status: 'unknown', detail: 'configured' } : { status: 'unavailable', detail: `missing ${keyCfg.missing.join(', ')}` };

  const overall = Object.values(checks).some((c) => c.status === 'unavailable') ? 'degraded' : 'operational';
  return { status: overall, checks, at: new Date().toISOString() };
});
