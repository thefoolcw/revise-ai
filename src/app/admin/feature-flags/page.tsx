import { getDb, schema } from '@/server/db';
import { FlagToggle, type Flag } from '@/components/admin/FlagToggle';

export const metadata = { title: 'Feature flags' };
export const dynamic = 'force-dynamic';

export default async function AdminFeatureFlags() {
  const db = await getDb();
  const flags = await db.select().from(schema.featureFlags);

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Feature flags</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Every change is written to the audit log. Flags gate features server-side — turning one off here
          disables the capability, not just the button.
        </p>
      </header>

      <div className="card card-pad">
        {flags.length === 0
          ? <p className="faint" style={{ fontSize: '.84rem' }}>No flags defined.</p>
          : <div>{flags.map((f, i) => (
              <div key={f.key} style={{ borderTop: i === 0 ? 'none' : undefined }}>
                <FlagToggle flag={{ key: f.key, description: f.description ?? null, enabled: f.enabled } satisfies Flag} />
              </div>
            ))}</div>}
      </div>
    </div>
  );
}
