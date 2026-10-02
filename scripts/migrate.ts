/**
 * Applies SQL migrations. Loads env before importing app modules so that
 * DATABASE_URL is available at import time (ESM hoists static imports).
 */
import { loadEnvFile } from 'node:process';

for (const f of ['.env.local', '.env']) {
  try { loadEnvFile(f); } catch { /* optional */ }
}

async function main() {
  const { runMigrations } = await import('../src/server/db/migrate');
  const { closeDb } = await import('../src/server/db');
  const { applied, total } = await runMigrations();
  console.log(`[migrate] ${applied.length} new of ${total} total applied${applied.length ? ': ' + applied.join(', ') : ''}`);
  await closeDb();
  process.exit(0);
}
main().catch((e) => {
  console.error('[migrate] failed:', e instanceof Error ? e.message : e);
  process.exit(1);
});
