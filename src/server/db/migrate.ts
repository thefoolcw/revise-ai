import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { getDb } from './index';
import { sql } from 'drizzle-orm';

const MIG_DIR = join(process.cwd(), 'drizzle');
const JOURNAL = join(MIG_DIR, 'meta', '_journal.json');

/**
 * Applies generated SQL migrations in a single transaction, tracked in
 * `__revise_migrations`. Hand-rolled rather than using the bundled migrator so
 * the same runner works identically on PGlite and PostgreSQL.
 */
export async function runMigrations(): Promise<{ applied: string[]; total: number }> {
  const db = await getDb();
  await db.execute(sql`CREATE TABLE IF NOT EXISTS __revise_migrations (
    id serial PRIMARY KEY,
    tag text NOT NULL UNIQUE,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);

  if (!existsSync(JOURNAL)) throw new Error('No migrations found. Run `npm run db:generate` first.');
  const journal = JSON.parse(readFileSync(JOURNAL, 'utf8')) as { entries: { tag: string; idx: number }[] };

  const done = new Set(
    (await db.execute(sql`SELECT tag FROM __revise_migrations`)).rows.map((r: any) => r.tag as string)
  );

  const applied: string[] = [];
  for (const entry of journal.entries.sort((a, b) => a.idx - b.idx)) {
    if (done.has(entry.tag)) continue;
    const file = join(MIG_DIR, `${entry.tag}.sql`);
    if (!existsSync(file)) throw new Error(`Migration file missing: ${entry.tag}.sql`);
    const statements = readFileSync(file, 'utf8');
    // Must run inside a single Drizzle transaction. Emitting bare BEGIN/COMMIT
    // through `db.execute` is not safe on PostgreSQL: drizzle's node-postgres
    // session calls `pool.query()`, which checks out and releases a connection
    // per statement, so BEGIN and COMMIT can land on different connections and
    // the migration silently stops being atomic. `db.transaction()` pins one
    // client for the whole block on both PostgreSQL and PGlite, and rolls back
    // automatically if anything throws.
    await db.transaction(async (tx) => {
      // drizzle-kit emits `--> statement-breakpoint` between statements.
      for (const stmt of statements.split('--> statement-breakpoint')) {
        const trimmed = stmt.trim();
        if (trimmed) await tx.execute(sql.raw(trimmed));
      }
      await tx.execute(sql`INSERT INTO __revise_migrations (tag) VALUES (${entry.tag})`);
    });
    applied.push(entry.tag);
  }
  return { applied, total: journal.entries.length };
}

export function migrationCount(): number {
  if (!existsSync(JOURNAL)) return 0;
  const j = JSON.parse(readFileSync(JOURNAL, 'utf8')) as { entries: unknown[] };
  return j.entries.length;
}

export function ensureDataDir() {
  const d = join(process.cwd(), 'data');
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
}
