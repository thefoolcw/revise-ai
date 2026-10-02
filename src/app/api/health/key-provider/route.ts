import { handler } from '@/server/api/route';
import { getKeyProvider } from '@/server/premium/provider';
export const GET = handler(async () => {
  const p = getKeyProvider();
  const cfg = p.validateConfig();
  if (!cfg.ok) return { status: 'unavailable' as const, detail: `Missing configuration: ${cfg.missing.join(', ')}` };
  const h = await p.healthCheck();
  return { status: h.ok ? 'operational' as const : 'degraded' as const, latencyMs: h.latencyMs, detail: h.detail ?? null };
});
