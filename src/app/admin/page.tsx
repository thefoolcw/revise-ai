import { CountUp } from '@/components/motion/CountUp';
import { Alert, Chip } from '@/components/ui/primitives';
import { sql } from 'drizzle-orm';
import { getDb } from '@/server/db';
import { getProvider } from '@/server/ai/provider';
import { getKeyProvider } from '@/server/premium/provider';
import { env, isProduction, missingRequiredForProduction } from '@/server/config/env';
import { migrationCount } from '@/server/db/migrate';

export const metadata = { title: 'Overview' };
export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const db = await getDb();
  const num = (r: unknown) => Number(((r as { rows?: { n?: unknown }[] }).rows ?? [])[0]?.n ?? 0);

  const [users, premium, aiToday, aiFails, verifs, models, migrations] = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int AS n FROM users`),
    db.execute(sql`SELECT COUNT(DISTINCT user_id)::int AS n FROM entitlements WHERE status = 'ACTIVE'`),
    db.execute(sql`SELECT COUNT(*)::int AS n FROM usage_ledger WHERE created_at >= NOW() - INTERVAL '24 hours'`),
    db.execute(sql`SELECT COUNT(*)::int AS n FROM ai_runs WHERE status IN ('FAILED','INTERRUPTED') AND created_at >= NOW() - INTERVAL '24 hours'`),
    db.execute(sql`SELECT COUNT(*)::int AS n FROM key_verifications`),
    db.execute(sql`SELECT COUNT(*)::int AS n FROM model_registry WHERE enabled = true AND available = true`),
    migrationCount()
  ]);

  const ai = getProvider().validateConfig();
  const keys = getKeyProvider().validateConfig();
  const missing = missingRequiredForProduction();
  const requests = num(aiToday), fails = num(aiFails);

  return (
    <div className="stack gap-5">
      <header>
        <h1 className="h2">System overview</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Live counts from the database. No secrets are displayed anywhere in this console.
        </p>
      </header>

      <div style={{ display: 'grid', gap: '.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))' }}>
        {([['Users', num(users)], ['Active Premium', num(premium)], ['AI requests (24h)', requests],
           ['AI failures (24h)', fails], ['Key verifications', num(verifs)], ['Models live', num(models)]] as [string, number][])
          .map(([label, value]) => (
            <div key={label} className="card card-pad">
              <p className="faint" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</p>
              <p className="h2 tnum" style={{ marginTop: '.25rem' }}><CountUp value={value} /></p>
            </div>
          ))}
      </div>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Provider configuration</h2>
        <div className="stack gap-2">
          <div className="row spread gap-2">
            <span style={{ fontSize: '.88rem' }}>AI provider (NVIDIA)</span>
            <Chip tone={ai.ok ? 'success' : 'danger'}>{ai.ok ? 'CONFIGURED' : 'MISSING'}</Chip>
          </div>
          <div className="row spread gap-2">
            <span style={{ fontSize: '.88rem' }}>Premium key provider (JNKIE)</span>
            <Chip tone={keys.ok ? 'success' : 'danger'}>{keys.ok ? 'CONFIGURED' : 'MISSING'}</Chip>
          </div>
          <p className="faint" style={{ fontSize: '.76rem' }}>
            Only the presence or absence of credentials is reported. Values are never rendered.
          </p>
        </div>
      </div>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Environment</h2>
        <div className="table-wrap">
          <table className="data">
            <caption className="sr-only">Runtime environment</caption>
            <tbody>
              <tr><td>Node environment</td><td><Chip tone={isProduction() ? 'success' : 'warn'}>{env.NODE_ENV}</Chip></td></tr>
              <tr><td>Migrations applied</td><td className="tnum">{migrations}</td></tr>
              <tr><td>Database</td><td className="faint">{env.DATABASE_URL.startsWith('file:') ? 'PGlite (development)' : 'PostgreSQL'}</td></tr>
              <tr><td>AI mock</td><td><Chip tone={env.AI_MOCK ? 'warn' : 'default'}>{env.AI_MOCK ? 'ON' : 'OFF'}</Chip></td></tr>
              <tr><td>Key-provider mock</td><td><Chip tone={env.JUNKIE_MOCK ? 'warn' : 'default'}>{env.JUNKIE_MOCK ? 'ON' : 'OFF'}</Chip></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {missing.length > 0 && isProduction() && (
        <Alert tone="danger" title="Missing required production variables">
          {missing.join(', ')}. The application will not serve AI or Premium features until these are set.
        </Alert>
      )}
      {missing.length > 0 && !isProduction() && (
        <Alert tone="warning" title="Not production-ready">
          These variables are required before deploying: {missing.join(', ')}.
        </Alert>
      )}
    </div>
  );
}
