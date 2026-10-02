import { loadEnvFile } from 'node:process';
import { rmSync } from 'node:fs';

/** Rebuilds a clean throwaway database for every test run. */
export async function setup() {
  for (const f of ['.env.local', '.env']) { try { loadEnvFile(f); } catch {} }
  (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
  process.env.DATABASE_URL = 'file:./data/pgtest';
  process.env.JUNKIE_MOCK = 'true';
  process.env.AI_MOCK = 'true';
  try { rmSync('./data/pgtest', { recursive: true, force: true }); } catch {}
  const { runMigrations } = await import('../src/server/db/migrate');
  const { closeDb } = await import('../src/server/db');
  const r = await runMigrations();
  const { seedCurriculum } = await import('../src/server/curriculum/seed');
  await seedCurriculum();
  await closeDb();
  console.log(`[test-setup] migrations applied: ${r.applied.length}`);
}
export async function teardown() {}
