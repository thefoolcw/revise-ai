import { desc } from 'drizzle-orm';
import { Alert, Chip } from '@/components/ui/primitives';
import { ModelRow, RefreshCatalogue, type AdminModel } from '@/components/admin/ModelRow';
import { getDb, schema } from '@/server/db';
import { lastCatalogRefresh } from '@/server/ai/registry';
import { getProvider } from '@/server/ai/provider';

export const metadata = { title: 'Models' };
export const dynamic = 'force-dynamic';

export default async function AdminModels() {
  const db = await getDb();
  const [models, health] = await Promise.all([
    db.select().from(schema.modelRegistry).orderBy(schema.modelRegistry.fallbackRank, desc(schema.modelRegistry.modelId)).limit(300),
    db.select().from(schema.modelHealth)
  ]);
  const catalog = await lastCatalogRefresh();
  const cfg = getProvider().validateConfig();

  const healthOf = (id: string) => health.find((h) => h.modelId === id);
  const rows: AdminModel[] = models.map((m) => ({
    modelId: m.modelId, vendor: m.provider, enabled: m.enabled,
    available: healthOf(m.modelId)?.status === 'HEALTHY' ? true : m.available,
    premiumOnly: m.premiumOnly, tasks: (m.tasks as string[]) ?? [],
    fallbackRank: m.fallbackRank, lastProbeStatus: healthOf(m.modelId)?.status ?? null
  }));

  const enabled = rows.filter((r) => r.enabled).length;
  const reachable = rows.filter((r) => r.available).length;

  return (
    <div className="stack gap-4">
      <header className="row spread wrap gap-2">
        <div>
          <h1 className="h2">Model registry</h1>
          <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
            Discovered live from the provider — never a hardcoded list. New models are enabled for CHAT only and
            reviewed here before wider use.
          </p>
        </div>
        <RefreshCatalogue />
      </header>

      {!cfg.ok && (
        <Alert tone="danger" title="AI provider not configured">
          The catalogue cannot be refreshed until the provider credential is set. Missing: {cfg.missing.join(', ')}.
        </Alert>
      )}
      {catalog.stale && (
        <Alert tone="warning" title="Catalogue is stale">
          The model list has not refreshed in the last 6 hours. Availability may be out of date.
        </Alert>
      )}

      <div className="row gap-2 wrap">
        <Chip tone="accent">{rows.length} registered</Chip>
        <Chip tone="success">{enabled} enabled</Chip>
        <Chip>{reachable} reachable</Chip>
        <span className="faint" style={{ fontSize: '.78rem' }}>
          Last refreshed {catalog.at ? new Date(catalog.at).toLocaleString('en-GB') : 'never'}
        </span>
      </div>

      <div className="table-wrap">
        <table className="data">
          <caption className="sr-only">Registered AI models</caption>
          <thead><tr><th scope="col">Model</th><th scope="col">Vendor</th><th scope="col">Tasks</th><th scope="col">Enabled</th><th scope="col">Reachable</th><th scope="col">Tier</th><th scope="col">Fallback</th><th scope="col">Actions</th></tr></thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={8} className="faint" style={{ textAlign: 'center', padding: '1.5rem' }}>No models registered. Refresh the catalogue to discover them.</td></tr>
              : rows.map((m) => <ModelRow key={m.modelId} model={m} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
