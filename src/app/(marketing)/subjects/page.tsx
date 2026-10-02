import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/ui/primitives';
import { getDb, schema } from '@/server/db';

export const metadata: Metadata = { title: 'Subjects', description: 'Subjects supported by Revise AI, from early years foundations to university modules.' };
export const dynamic = 'force-dynamic';

export default async function SubjectsPage() {
  const db = await getDb();
  const subjects = await db.select().from(schema.subjects);
  const byCategory = new Map<string, typeof subjects>();
  for (const s of subjects) {
    const arr = byCategory.get(s.category) ?? [];
    arr.push(s); byCategory.set(s.category, arr);
  }
  const categories = [...byCategory.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="container-x" style={{ paddingBlock: '3.5rem' }}>
      <Reveal><SectionHeading eyebrow="Subjects" title={`${subjects.length} subjects in the catalogue`} lede="Counted live from the Revise AI subject registry. Coverage grows as specifications are verified and added." /></Reveal>
      <div style={{ marginTop: '2.75rem', display: 'grid', gap: '1.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))' }}>
        {categories.map(([cat, list], i) => (
          <Reveal key={cat} delay={Math.min(i, 6) * 60}>
            <div className="card card-pad" style={{ height: '100%' }}>
              <h2 className="h3" style={{ marginBottom: '.75rem', color: 'var(--accent)' }}>{cat}</h2>
              <ul className="stack gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {list.map((s) => <li key={s.id} style={{ fontSize: '.88rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>{s.name}</li>)}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
