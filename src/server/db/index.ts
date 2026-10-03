import { drizzle, type PgliteDatabase } from 'drizzle-orm/pglite';
import * as schema from './schema';
import { env } from '../config/env';

export type DB = PgliteDatabase<typeof schema>;

/**
 * One database handle per process.
 *
 * `file:` / `memory:` URLs use PGlite (a real PostgreSQL compiled to WASM) so
 * local development needs no database server. Any `postgres://` URL uses the
 * `pg` driver. Both speak the same SQL, so migrations are identical.
 */
const g = globalThis as unknown as { __reviseDb?: DB; __reviseDbUrl?: string };

/**
 * Resolves the TLS setting for the `postgres://` driver.
 *
 * Hosted providers (Neon, Supabase, RDS) terminate TLS, so the secure default
 * verifies their certificate. `disable` exists only for a local database with
 * no certificate and is never appropriate for a hosted provider.
 */
function sslConfig(): { rejectUnauthorized: boolean } | undefined {
  const mode = env.DATABASE_SSL;
  if (mode === 'require') return { rejectUnauthorized: true };
  if (mode === 'disable') return undefined;
  return env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined;
}

export async function getDb(): Promise<DB> {
  const url = env.DATABASE_URL;
  if (g.__reviseDb && g.__reviseDbUrl === url) return g.__reviseDb;

  if (url.startsWith('file:') || url.startsWith('memory:')) {
    const { PGlite } = await import('@electric-sql/pglite');
    const dir = url.replace(/^file:/, '');
    if (dir && !url.startsWith('memory:')) {
      const { mkdirSync } = await import('node:fs');
      const { dirname } = await import('node:path');
      try { mkdirSync(dirname(dir), { recursive: true }); } catch {}
    }
    const client = dir ? new PGlite(dir) : new PGlite();
    const db = drizzle(client, { schema });
    g.__reviseDb = db;
    g.__reviseDbUrl = url;
    return db;
  }

  const { default: pg } = await import('pg');
  const pool = new pg.Pool({ connectionString: url, max: 10, ssl: sslConfig() });
  // drizzle-orm/node-postgres shares the pg-core dialect with pglite.
  const { drizzle: pgDrizzle } = await import('drizzle-orm/node-postgres');
  const db = pgDrizzle(pool, { schema }) as unknown as DB;
  g.__reviseDb = db;
  g.__reviseDbUrl = url;
  return db;
}

export async function closeDb(): Promise<void> {
  g.__reviseDb = undefined;
  g.__reviseDbUrl = undefined;
}

export { schema };
