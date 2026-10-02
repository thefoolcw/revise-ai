import { sql } from 'drizzle-orm';
import { handler, needRole } from '@/server/api/route';
import { getDb } from '@/server/db';
import { getProvider } from '@/server/ai/provider';
import { getKeyProvider } from '@/server/premium/provider';
import { missingRequiredForProduction } from '@/server/config/env';

export const GET = handler(async (ctx) => {
  needRole(ctx, 'ADMIN', 'ANALYST');
  const db = await getDb();
  const q = async (s: string) => (await db.execute(sql.raw(s))).rows[0] as Record<string, number>;

  const [users, premium, aiToday, fails, verifs] = await Promise.all([
    q(`SELECT COUNT(*)::int AS n FROM users WHERE deleted_at IS NULL`),
    q(`SELECT COUNT(DISTINCT user_id)::int AS n FROM entitlements WHERE status='ACTIVE'`),
    q(`SELECT COUNT(*)::int AS n FROM ai_runs WHERE created_at > now() - interval '24 hours'`),
    q(`SELECT COUNT(*)::int AS n FROM ai_runs WHERE created_at > now() - interval '24 hours' AND status IN ('FAILED','INTERRUPTED')`),
    q(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE state='VERIFIED')::int AS verified FROM key_verifications`)
  ]);

  const aiCfg = getProvider().validateConfig();
  const keyCfg = getKeyProvider().validateConfig();

  return {
    users: users.n, premiumUsers: premium.n,
    ai: { requests24h: aiToday.n ?? 0, failures24h: fails.n ?? 0, failureRatePercent: aiToday.n ? Math.round(((fails.n ?? 0) / aiToday.n) * 1000) / 10 : 0 },
    keyVerification: { total: verifs.total ?? 0, verified: verifs.verified ?? 0, verificationRatePercent: verifs.total ? Math.round(((verifs.verified ?? 0) / verifs.total) * 1000) / 10 : 0 },
    providers: {
      ai: { configured: aiCfg.ok, missing: aiCfg.missing },
      keyProvider: { configured: keyCfg.ok, missing: keyCfg.missing }
    },
    missingProductionVariables: missingRequiredForProduction()
  };
});
