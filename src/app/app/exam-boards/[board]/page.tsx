import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq, sql } from 'drizzle-orm';
import { Alert, Chip } from '@/components/ui/primitives';
import { getDb, schema } from '@/server/db';

export const dynamic = 'force-dynamic';

export default async function BoardPage({ params }: { params: Promise<{ board: string }> }) {
  const { board } = await params;
  const db = await getDb();
  const [b] = await db.select().from(schema.examBoards).where(eq(schema.examBoards.id, board)).limit(1);
  if (!b) notFound();

  const quals = await db.select().from(schema.qualifications);
  const offered = quals.filter((q) => ((q.boards as string[] | null) ?? []).includes(b.id));

  return (
    <div className="stack gap-4">
      <header>
        <p className="faint" style={{ fontSize: '.78rem' }}><Link href="/app/learn">Curriculum</Link> / Exam boards</p>
        <h1 className="h2" style={{ marginTop: '.2rem' }}>{b.name}</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          {b.country === 'INT' ? 'International awarding body' : b.country === 'OTHER' ? 'Non-board option' : 'United Kingdom'}
        </p>
        {b.url && <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.84rem' }}>Official site ↗</a>}
      </header>

      <Alert tone="info" title="No affiliation">
        Revise AI is independent and is not affiliated with, endorsed by or sponsored by {b.name}. The name is
        used only to identify a curriculum.
      </Alert>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Qualifications offered ({offered.length})</h2>
        {offered.length === 0
          ? <p className="faint" style={{ fontSize: '.84rem' }}>No qualification pathways are registered for this provider yet.</p>
          : <div style={{ display: 'grid', gap: '.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))' }}>
              {offered.map((q) => (
                <div key={q.id} className="card" style={{ padding: '.7rem .85rem' }}>
                  <p style={{ fontSize: '.88rem', fontWeight: 560 }}>{q.name}</p>
                  <div className="row gap-1" style={{ marginTop: '.35rem' }}>
                    <Chip>{q.ageBand.replace(/_/g, ' ')}</Chip>
                  </div>
                </div>
              ))}
            </div>}
      </div>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.5rem' }}>Set this as your board</h2>
        <p className="muted" style={{ fontSize: '.86rem' }}>
          Choosing a board scopes tutor answers and generated material. It never silently changes a qualification
          you have already selected.
        </p>
        <Link href="/app/learn" className="btn btn-primary btn-sm" style={{ marginTop: '.8rem' }}>Choose in Curriculum</Link>
      </div>
    </div>
  );
}
