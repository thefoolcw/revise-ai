'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { patch } from '@/lib/client';
import { Button, Select, Alert } from '@/components/ui/primitives';

type Row = { id: string; title: string; yearGroup: string; status: string; isPremium: boolean };
function EditLesson({ lesson }: { lesson: Row }) {
  const router = useRouter();
  const [status, setStatus] = useState(lesson.status);
  const [premium, setPremium] = useState(lesson.isPremium);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  return <form className="stack gap-2" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      await patch('/api/admin/content', { lessonId: lesson.id, status, isPremium: premium });
      setMessage('Publication settings saved.'); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not update lesson.'); }
    finally { setBusy(false); }
  }}>
    <Select name="lessonStatus" label="Publication status" value={status} onChange={e => setStatus(e.target.value)} disabled={busy}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft — hidden from learners</option></Select>
    <label className="row gap-2"><input type="checkbox" checked={premium} onChange={e => setPremium(e.target.checked)} disabled={busy} /> Premium access required</label>
    {error && <Alert tone="danger" title="Update failed">{error}</Alert>}
    {message && <p role="status">{message}</p>}
    <Button type="submit" loading={busy}>Save publication settings</Button>
  </form>;
}
export function ContentLessonControls({ lessons }: { lessons: Row[] }) {
  const [id, setId] = useState(lessons[0]?.id ?? '');
  const selected = lessons.find(l => l.id === id);
  return <section className="card card-pad stack gap-3"><h2 className="h3">Manage lesson publication</h2>
    <p className="muted">Teaching text is maintained in the reviewed source batches. Publication and access changes take effect on the next server request. Seeding preserves these publication and access settings.</p>
    <Select name="managedLesson" label="Lesson" value={id} onChange={e => setId(e.target.value)}>{lessons.map(l => <option key={l.id} value={l.id}>{l.yearGroup} · {l.title}</option>)}</Select>
    {selected && <EditLesson key={selected.id} lesson={selected} />}
  </section>;
}
