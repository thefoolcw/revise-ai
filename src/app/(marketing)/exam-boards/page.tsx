import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading, Alert } from '@/components/ui/primitives';
import { getDb, schema } from '@/server/db';

export const metadata: Metadata = { title: 'Exam boards', description: 'Exam boards and qualification pathways supported by Revise AI.' };
export const dynamic = 'force-dynamic';

export default async function ExamBoardsPage() {
  const db = await getDb();
  const [boards, quals] = await Promise.all([db.select().from(schema.examBoards), db.select().from(schema.qualifications)]);
  const nameOf = (id: string) => boards.find((b) => b.id === id)?.shortName ?? id;

  return (
    <div className="container-x" style={{ paddingBlock: '3.5rem' }}>
      <Reveal><SectionHeading eyebrow="Exam boards" title="Boards, providers and pathways" lede="Revise AI only offers board and qualification combinations that exist in its registry — never every subject under every board." /></Reveal>
      <Reveal delay={80}>
        <div style={{ marginTop: '2rem' }}>
          <Alert tone="info" title="No affiliation">
            Revise AI is independent. Exam board names are used only to identify curricula. Nothing here implies
            endorsement by any board, and no specification codes are published until verified against an official source.
          </Alert>
        </div>
      </Reveal>
      <div style={{ marginTop: '2.25rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))' }}>
        {boards.map((b, i) => (
          <Reveal key={b.id} delay={Math.min(i, 8) * 55}>
            <div className="card card-pad" style={{ height: '100%' }}>
              <h2 className="h3" style={{ marginBottom: '.3rem' }}>{b.name}</h2>
              <p className="faint" style={{ fontSize: '.8rem', marginBottom: '.6rem' }}>{b.country === 'INT' ? 'International' : b.country === 'OTHER' ? 'Non-board option' : 'United Kingdom'}</p>
              {b.url && <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.82rem' }}>Official site ↗</a>}
            </div>
          </Reveal>
        ))}
      </div>
      <h2 className="h2" style={{ marginTop: '3.25rem', marginBottom: '1.1rem' }}>Qualification pathways</h2>
      <div className="table-wrap">
        <table className="data">
          <caption className="sr-only">Qualification pathways and the boards that offer them</caption>
          <thead><tr><th scope="col">Qualification</th><th scope="col">Stage</th><th scope="col">Available boards</th></tr></thead>
          <tbody>
            {quals.map((q) => (
              <tr key={q.id}>
                <td style={{ fontWeight: 580 }}>{q.name}</td>
                <td><span className="chip">{q.ageBand.replace(/_/g, ' ')}</span></td>
                <td className="muted" style={{ fontSize: '.84rem' }}>{(q.boards as string[]).map(nameOf).join(', ') || 'Not board-specific'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
