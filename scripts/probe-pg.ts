import { loadEnvFile } from 'node:process';
for (const f of ['.env.local','.env']) { try { loadEnvFile(f); } catch {} }
(async () => {
  process.env.DATABASE_URL = 'file:./data/pgtest';
  const { getDb, closeDb } = await import('../src/server/db/index');
  const { sql } = await import('drizzle-orm');
  const db = await getDb();
  for (const expr of ["SELECT hashtextextended('abc', 0)", "SELECT pg_advisory_xact_lock(1)", "SELECT version()"]) {
    try { const r = await db.execute(sql.raw(expr)); console.log('OK  ', expr, '->', JSON.stringify(r.rows[0]).slice(0,60)); }
    catch (e:any) { console.log('FAIL', expr, '->', e.message.slice(0,120)); }
  }
  await closeDb(); process.exit(0);
})();
