'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Alert } from '@/components/ui/primitives';
import { get, post, patch, del, ApiRequestError } from '@/lib/client';
import { useToast } from './Toaster';

type Note = { id: string; title: string; preview: string; body: string; updatedAt: string; version: number };

const AI_ACTIONS: [string, string][] = [
  ['summarise', 'Summarize'], ['flashcards', 'Make flashcards'], ['quiz', 'Create quiz'],
  ['clarify', 'Explain further']
];

export function NotesWorkspace() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [openId, setOpenId] = useState<string | null>(params.get('id'));
  const [note, setNote] = useState<Note | null>(null);
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadList = useCallback(async () => {
    try { const r = await get<{ notes: Note[] }>('/api/notes'); setNotes(r.notes); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load notes.'); }
  }, []);

  useEffect(() => { void loadList(); }, [loadList]);

  const open = useCallback(async (id: string) => {
    setOpenId(id);
    router.replace(`/app/notes?id=${id}`, { scroll: false });
    try {
      const n = await get<Note>(`/api/notes/${id}`);
      setNote(n); setBody(n.body); setTitle(n.title); setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not open that note.'); }
  }, [router]);

  useEffect(() => { const id = params.get('id'); if (id && id !== openId) void open(id); }, [params, openId, open]);

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = (e.currentTarget.elements.namedItem('newTitle') as HTMLInputElement).value.trim();
    if (!t) return;
    try {
      const n = await post<Note>('/api/notes', { title: t, body: '' });
      await loadList();
      await open(n.id);
      toast.push('Note created', 'success');
    } catch (ex) { setError(ex instanceof ApiRequestError ? ex.message : 'Could not create that note.'); }
  };

  const save = async () => {
    if (!note) return;
    setSaving(true);
    try {
      await patch(`/api/notes/${note.id}`, { title, body });
      setNote({ ...note, title, body, version: note.version + 1 });
      await loadList();
      toast.push('Saved', 'success');
    } catch (ex) { setError(ex instanceof ApiRequestError ? ex.message : 'Could not save.'); }
    finally { setSaving(false); }
  };

  const aiAction = async (action: string) => {
    if (!note) return;
    setBusy(true); setError(null);
    try {
      const r = await post<{ body: string; version: number; modelUsed: string }>(`/api/notes/${note.id}`, { action });
      setBody(r.body);
      setNote({ ...note, body: r.body, version: r.version });
      await loadList();
      toast.push(`Created version ${r.version} — your previous version is untouched`, 'success');
    } catch (ex) {
      setError(ex instanceof ApiRequestError ? ex.message : 'The AI action failed. Your note was not changed.');
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!note) return;
    if (!confirm('Delete this note permanently?')) return;
    try {
      await del(`/api/notes/${note.id}`);
      setNote(null); setOpenId(null); setBody(''); setTitle('');
      router.replace('/app/notes', { scroll: false });
      await loadList();
      toast.push('Note deleted', 'info');
    } catch (ex) { setError(ex instanceof ApiRequestError ? ex.message : 'Could not delete.'); }
  };

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Notes</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          AI actions write a new version. They never overwrite what you wrote.
        </p>
      </header>

      {error && <Alert tone="danger" title="Something went wrong">{error}</Alert>}

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'minmax(200px, 280px) 1fr', alignItems: 'start' }} className="notes-grid">
        <div className="card card-pad stack gap-3">
          <h2 className="h3">Your notes</h2>
          {notes.length === 0
            ? <p className="faint" style={{ fontSize: '.84rem' }}>No notes yet.</p>
            : <div className="stack gap-1" style={{ maxHeight: 420, overflowY: 'auto' }}>
                {notes.map((n) => (
                  <button key={n.id} onClick={() => void open(n.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '.55rem .65rem', borderRadius: 8, cursor: 'pointer',
                      border: 'none', background: openId === n.id ? 'var(--accent-soft)' : 'transparent',
                      color: openId === n.id ? 'var(--accent)' : 'var(--text)', fontSize: '.86rem'
                    }}>
                    <span style={{ display: 'block', fontWeight: openId === n.id ? 620 : 480 }}>{n.title}</span>
                    <span className="faint" style={{ fontSize: '.72rem' }}>{new Date(n.updatedAt).toLocaleDateString('en-GB')}</span>
                  </button>
                ))}
              </div>}
          <form onSubmit={create} className="row gap-2" style={{ marginTop: '.3rem' }}>
            <Input label="" name="newTitle" placeholder="New note title" required minLength={1} maxLength={200} />
            <Button type="submit" variant="outline">New</Button>
          </form>
        </div>

        <div className="card card-pad stack gap-3">
          {!note ? (
            <p className="muted" style={{ fontSize: '.88rem' }}>Select a note, or create one.</p>
          ) : (
            <>
              <div className="row spread wrap gap-2">
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200}
                  aria-label="Note title"
                  style={{ flex: 1, minWidth: 200, padding: '.4rem 0', border: 'none', background: 'transparent', color: 'var(--text)', fontSize: '1.05rem', fontWeight: 620, outline: 'none' }} />
                <span className="chip tnum">v{note.version}</span>
              </div>

              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={16} maxLength={60000}
                placeholder="Write your notes here…"
                style={{ width: '100%', padding: '.7rem .8rem', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '.88rem', lineHeight: 1.7, resize: 'vertical' }} />

              <div className="row spread wrap gap-2">
                <div className="row gap-1 wrap">
                  {AI_ACTIONS.map(([id, label]) => (
                    <button key={id} className="mode-chip" onClick={() => void aiAction(id)} disabled={busy || !body.trim()}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="row gap-2">
                  <Button variant="ghost" onClick={remove}>Delete</Button>
                  <Button onClick={save} loading={saving}>Save</Button>
                </div>
              </div>
              {busy && <p className="faint" style={{ fontSize: '.78rem' }}>Working on your notes…</p>}
            </>
          )}
        </div>
      </div>

      <style>{`@media (max-width: 760px) { .notes-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
