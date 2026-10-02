import { loadEnvFile } from 'node:process';
for (const f of ['.env.local', '.env']) { try { loadEnvFile(f); } catch {} }

async function main() {
  const { seedCurriculum } = await import('../src/server/curriculum/seed');
  const { closeDb } = await import('../src/server/db');
  const r = await seedCurriculum();
  console.log(`[seed] boards=${r.boards} qualifications=${r.quals} subjects=${r.subjects} topics=${r.topics} aliases=${r.aliases} flags=${r.flags}`);
  await closeDb();
  process.exit(0);
}
main().catch((e) => { console.error('[seed] failed:', e instanceof Error ? e.message : e); process.exit(1); });
