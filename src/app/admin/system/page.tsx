import { Alert, Chip } from '@/components/ui/primitives';
import { StatusBoard } from '@/components/app/StatusBoard';
import { getProvider } from '@/server/ai/provider';
import { getKeyProvider } from '@/server/premium/provider';
import { env, isProduction, missingRequiredForProduction } from '@/server/config/env';
import { migrationCount } from '@/server/db/migrate';
import { lastCatalogRefresh } from '@/server/ai/registry';

export const metadata = { title: 'System' };
export const dynamic = 'force-dynamic';

export default async function AdminSystem() {
  const ai = getProvider().validateConfig();
  const keys = getKeyProvider().validateConfig();
  const missing = missingRequiredForProduction();
  const catalog = await lastCatalogRefresh();
  const migrations = await migrationCount();

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">System</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Live component health and configuration state. Credentials are reported as present or absent only —
          values are never rendered, logged or sent to the browser.
        </p>
      </header>

      {missing.length > 0 && (
        <Alert tone={isProduction() ? 'danger' : 'warning'} title={isProduction() ? 'Missing required production variables' : 'Not production-ready'}>
          {missing.join(', ')}
        </Alert>
      )}

      <StatusBoard />

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Configuration</h2>
        <div className="table-wrap"><table className="data">
          <caption className="sr-only">Runtime configuration</caption>
          <tbody>
            <tr><td>Environment</td><td><Chip tone={isProduction() ? 'success' : 'warn'}>{env.NODE_ENV}</Chip></td></tr>
            <tr><td>Migrations applied</td><td className="tnum">{migrations}</td></tr>
            <tr><td>Database driver</td><td className="faint">{env.DATABASE_URL.startsWith('file:') ? 'PGlite (development only)' : 'PostgreSQL'}</td></tr>
            <tr><td>AI provider credential</td><td><Chip tone={ai.ok ? 'success' : 'danger'}>{ai.ok ? 'PRESENT' : 'MISSING'}</Chip></td></tr>
            <tr><td>Key provider credential</td><td><Chip tone={keys.ok ? 'success' : 'danger'}>{keys.ok ? 'PRESENT' : 'MISSING'}</Chip></td></tr>
            <tr><td>AI mock</td><td><Chip tone={env.AI_MOCK ? 'warn' : 'default'}>{env.AI_MOCK ? 'ON' : 'OFF'}</Chip></td></tr>
            <tr><td>Key-provider mock</td><td><Chip tone={env.JUNKIE_MOCK ? 'warn' : 'default'}>{env.JUNKIE_MOCK ? 'ON' : 'OFF'}</Chip></td></tr>
            <tr><td>Rate-limit scale</td><td className="tnum">×{env.RATE_LIMIT_SCALE}</td></tr>
            <tr><td>Model catalogue</td><td className="faint">{catalog.at ? new Date(catalog.at).toLocaleString('en-GB') : 'never'}{catalog.stale ? ' (stale)' : ''}</td></tr>
          </tbody>
        </table></div>
        <p className="faint" style={{ fontSize: '.76rem', marginTop: '.8rem' }}>
          Mock providers cannot be constructed when <code>NODE_ENV=production</code>, so they cannot be enabled
          accidentally in a deployment.
        </p>
      </div>
    </div>
  );
}
