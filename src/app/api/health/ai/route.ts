import { handler } from '@/server/api/route';
import { getProvider } from '@/server/ai/provider';
import { lastCatalogRefresh } from '@/server/ai/registry';
export const GET = handler(async () => {
  const p = getProvider();
  const cfg = p.validateConfig();
  if (!cfg.ok) return { status: 'unavailable' as const, detail: `Missing configuration: ${cfg.missing.join(', ')}` };
  const h = await p.healthCheck();
  const cat = await lastCatalogRefresh();
  return { status: h.ok ? 'operational' as const : 'degraded' as const, latencyMs: h.latencyMs, detail: h.detail ?? null, catalog: cat };
});
