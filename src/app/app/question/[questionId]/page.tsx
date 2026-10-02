import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { Chip } from '@/components/ui/primitives';
import { renderMarkdown } from '@/lib/markdown';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';

export const dynamic = 'force-dynamic';

export default async function QuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await getDb();

  const [q] = await db.select().from(schema.questions)
    .where(and(eq(schema.questions.id, questionId), eq(schema.questions.userId, user.id))).limit(1);
  if (!q) notFound();

  const attempts = await db.select().from(schema.questionAttempts)
    .where(and(eq(schema.questionAttempts.questionId, q.id), eq(schema.questionAttempts.userId, user.id)))
    .orderBy(schema.questionAttempts.createdAt);

  return (
    <div className="stack gap-4">
      <header>
        <p className="faint" style={{ fontSize: '.78rem' }}><Link href="/app/library">Library</Link> / Solved question</p>
        <h1 className="h2" style={{ marginTop: '.2rem' }}>Solved question</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          {new Date(q.createdAt).toLocaleString('en-GB')}
          {q.topicTitle ? ` · ${q.topicTitle}` : ''}
        </p>
      </header>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.6rem' }}>Question</h2>
        <p style={{ fontSize: '.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{q.prompt}</p>
      </div>

      {attempts.some((a) => a.explanation) && (
        <div className="card card-pad">
          <h2 className="h3" style={{ marginBottom: '.6rem' }}>Worked solution</h2>
          <div className="prose-ai"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(attempts.map((a) => a.explanation).filter(Boolean).join('\n\n')) }} />
        </div>
      )}

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Attempts ({attempts.length})</h2>
        {attempts.length === 0
          ? <p className="faint" style={{ fontSize: '.84rem' }}>No attempts recorded for this question.</p>
          : <div className="table-wrap"><table className="data">
              <caption className="sr-only">Attempts at this question</caption>
              <thead><tr><th scope="col">When</th><th scope="col">Result</th><th scope="col">Confidence</th></tr></thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id}>
                    <td className="tnum faint">{new Date(a.createdAt).toLocaleString('en-GB')}</td>
                    <td><Chip tone={a.correct ? 'success' : 'danger'}>{a.correct ? 'CORRECT' : 'INCORRECT'}</Chip></td>
                    <td className="muted" style={{ fontSize: '.82rem' }}>{a.confidence ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>}
      </div>

      <div className="row gap-2 wrap">
        <Link href="/app/solve" className="btn btn-outline btn-sm">Solve another</Link>
        <Link href="/app/quiz" className="btn btn-outline btn-sm">Quiz me on this topic</Link>
      </div>
    </div>
  );
}
