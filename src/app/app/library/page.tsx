import Link from 'next/link';
import { desc, eq, sql } from 'drizzle-orm';
import { EmptyState } from '@/components/ui/primitives';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';

export const metadata = { title: 'Library' };
export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await getDb();

  const [notes, decks, quizzes, conversations, questions] = await Promise.all([
    db.select({ id: schema.notes.id, title: schema.notes.title, updatedAt: schema.notes.updatedAt, version: schema.notes.version })
      .from(schema.notes).where(eq(schema.notes.userId, user.id)).orderBy(desc(schema.notes.updatedAt)).limit(50),
    db.select({ id: schema.flashcardDecks.id, name: schema.flashcardDecks.name, createdAt: schema.flashcardDecks.createdAt,
      n: sql<number>`(select count(*)::int from flashcards f where f.deck_id = ${schema.flashcardDecks.id})` })
      .from(schema.flashcardDecks).where(eq(schema.flashcardDecks.userId, user.id)).orderBy(desc(schema.flashcardDecks.createdAt)).limit(50),
    db.select({ id: schema.quizzes.id, title: schema.quizzes.title, createdAt: schema.quizzes.createdAt })
      .from(schema.quizzes).where(eq(schema.quizzes.userId, user.id)).orderBy(desc(schema.quizzes.createdAt)).limit(50),
    db.select({ id: schema.aiConversations.id, title: schema.aiConversations.title, updatedAt: schema.aiConversations.updatedAt })
      .from(schema.aiConversations).where(eq(schema.aiConversations.userId, user.id)).orderBy(desc(schema.aiConversations.updatedAt)).limit(50),
    db.select({ id: schema.questions.id, prompt: schema.questions.prompt, createdAt: schema.questions.createdAt })
      .from(schema.questions).where(eq(schema.questions.userId, user.id)).orderBy(desc(schema.questions.createdAt)).limit(50)
  ]);

  const empty = notes.length + decks.length + quizzes.length + conversations.length + questions.length === 0;

  const SECTION = (title: string, href: (id: string) => string, rows: { id: string; label: string; meta: string }[]) => (
    <section className="card card-pad">
      <h2 className="h3" style={{ marginBottom: '.8rem' }}>{title} <span className="faint" style={{ fontSize: '.8rem', fontWeight: 400 }}>({rows.length})</span></h2>
      {rows.length === 0
        ? <p className="faint" style={{ fontSize: '.84rem' }}>Nothing here yet.</p>
        : <ul className="stack gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {rows.map((r) => (
              <li key={r.id} className="row spread gap-2" style={{ fontSize: '.88rem' }}>
                <Link href={href(r.id)} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</Link>
                <span className="faint" style={{ fontSize: '.74rem', flexShrink: 0 }}>{r.meta}</span>
              </li>
            ))}
          </ul>}
    </section>
  );

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Library</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Everything you have created, scoped to your account.
        </p>
      </header>

      {empty && (
        <EmptyState title="Your library is empty"
          body="Notes, decks, quizzes, solved questions and conversations will collect here as you work."
          action={<Link href="/app/tutor" className="btn btn-primary btn-sm">Start with the tutor</Link>} />
      )}

      {!empty && (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
          {SECTION('Notes', (id) => `/app/notes?id=${id}`, notes.map((n) => ({ id: n.id, label: n.title, meta: `v${n.version}` })))}
          {SECTION('Flashcard decks', (id) => `/app/flashcards`, decks.map((d) => ({ id: d.id, label: d.name, meta: `${d.n} cards` })))}
          {SECTION('Quizzes', (id) => `/app/quiz?id=${id}`, quizzes.map((q) => ({ id: q.id, label: q.title, meta: new Date(q.createdAt).toLocaleDateString('en-GB') })))}
          {SECTION('Conversations', (id) => `/app/tutor?c=${id}`, conversations.map((c) => ({ id: c.id, label: c.title || 'Untitled', meta: new Date(c.updatedAt).toLocaleDateString('en-GB') })))}
          {SECTION('Solved questions', (id) => `/app/question/${id}`, questions.map((q) => ({ id: q.id, label: q.prompt.slice(0, 90) + (q.prompt.length > 90 ? '…' : ''), meta: new Date(q.createdAt).toLocaleDateString('en-GB') })))}
        </div>
      )}
    </div>
  );
}
