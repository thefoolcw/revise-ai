import { eq } from 'drizzle-orm';
import { Alert, Chip } from '@/components/ui/primitives';
import { getDb, schema } from '@/server/db';

export const metadata = { title: 'Exam boards' };
export const dynamic = 'force-dynamic';

export default async function AdminExamBoards() {
  const db = await getDb();
  const [boards, quals] = await Promise.all([
    db.select().from(schema.examBoards),
    db.select().from(schema.qualifications)
  ]);
  const nameOf = (id: string) => boards.find((b) => b.id === id)?.shortName ?? id;

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Exam boards &amp; qualifications</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          The registry that constrains what learners can select. Only combinations that exist here are offered.
        </p>
      </header>

      <Alert tone="info" title="No affiliation">
        Revise AI is independent. Board names identify curricula only and imply no endorsement. Add a board only
        when it is a real awarding body, and link its official site.
      </Alert>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Boards &amp; providers ({boards.length})</h2>
        <div className="table-wrap"><table className="data">
          <caption className="sr-only">Registered exam boards</caption>
          <thead><tr><th scope="col">Name</th><th scope="col">Short</th><th scope="col">Region</th><th scope="col">Official site</th><th scope="col">Status</th></tr></thead>
          <tbody>
            {boards.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 560 }}>{b.name}</td>
                <td className="faint">{b.shortName}</td>
                <td className="faint">{b.country === 'INT' ? 'International' : b.country === 'OTHER' ? 'Non-board' : b.country}</td>
                <td className="faint" style={{ fontSize: '.78rem' }}>{b.url ? <a href={b.url} target="_blank" rel="noopener noreferrer">{new URL(b.url).hostname}</a> : '—'}</td>
                <td><Chip tone={b.status === 'ACTIVE' ? 'success' : 'default'}>{b.status}</Chip></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Qualification pathways ({quals.length})</h2>
        <div className="table-wrap"><table className="data">
          <caption className="sr-only">Qualification pathways and their boards</caption>
          <thead><tr><th scope="col">Qualification</th><th scope="col">Level</th><th scope="col">Stage</th><th scope="col">Boards</th></tr></thead>
          <tbody>
            {quals.map((q) => (
              <tr key={q.id}>
                <td style={{ fontWeight: 560 }}>{q.name}</td>
                <td className="faint">{q.level ?? '—'}</td>
                <td><span className="chip">{q.ageBand.replace(/_/g, ' ')}</span></td>
                <td className="muted" style={{ fontSize: '.82rem' }}>
                  {(q.boards as string[] | null)?.length ? (q.boards as string[]).map(nameOf).join(', ') : 'Not board-specific'}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
