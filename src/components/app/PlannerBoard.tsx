'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Alert, ProgressBar } from '@/components/ui/primitives';
import { post, patch } from '@/lib/client';
import { useToast } from './Toaster';

export type Topic = { id: string; title: string; subjectName: string; provenance: string };
export type PlanItem = {
  id: string; title: string; reason: string; status: string;
  scheduledFor: string | null; orderIndex: number; minutes: number; topicId: string | null
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function PlannerBoard({ topics, items: initial, planTitle }: {
  topics: Topic[]; items: PlanItem[] | null; planTitle: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    title: '', targetDate: '', hoursPerWeek: '6', sessionMinutes: '45', restDays: [] as number[]
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [items, setItems] = useState<PlanItem[]>(initial ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<string | null>(null);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) { setError('Pick at least one topic to plan.'); return; }
    if (!form.targetDate) { setError('Choose a target date.'); return; }
    setBusy(true); setError(null);
    try {
      await post('/api/planner/generate', {
        title: form.title || 'Revision plan',
        targetDate: form.targetDate,
        hoursPerWeek: Number(form.hoursPerWeek),
        sessionMinutes: Number(form.sessionMinutes),
        restDays: form.restDays,
        topicIds: selected
      });
      toast.push('Plan generated', 'success');
      router.refresh();
    } catch (ex) { setError(ex instanceof Error ? ex.message : 'Could not generate a plan.'); }
    finally { setBusy(false); }
  };

  const act = async (itemId: string, action: 'COMPLETE' | 'SKIP', title: string) => {
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, status: action === 'COMPLETE' ? 'DONE' : 'SKIPPED' } : i));
    try { await patch('/api/planner/items', { itemId, action }); router.refresh(); }
    catch { setItems(initial ?? []); toast.push('Could not update that item.', 'danger'); }
    void title;
  };

  const done = items.filter((i) => i.status === 'DONE').length;

  if (!initial || initial.length === 0) {
    return (
      <div className="stack gap-4">
        <header>
          <h1 className="h2">Revision planner</h1>
          <p className="muted" style={{ fontSize: '.88rem', marginTop: '.25rem' }}>
            Sessions are allocated from your target date and weekly hours, then ordered by real accuracy —
            topics you get wrong more often come first, with spaced recall built in.
          </p>
        </header>

        {error && <Alert tone="danger" title="Cannot build that plan">{error}</Alert>}

        {topics.length === 0 ? (
          <Alert tone="info" title="No topics yet">
            Your profile has no subjects selected, so there is nothing to plan against.{' '}
            <a href="/app/learn" style={{ color: 'var(--accent)', fontWeight: 600 }}>Choose your subjects first</a>.
          </Alert>
        ) : (
          <form onSubmit={generate} className="stack gap-4">
            <div className="card card-pad stack gap-3">
              <div style={{ display: 'grid', gap: '.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))' }}>
                <Input label="Plan name" name="title" maxLength={120} value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Optional" />
                <Input label="Target date" name="targetDate" type="date" required value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
                <Select label="Hours per week" name="hoursPerWeek" value={form.hoursPerWeek}
                  onChange={(e) => setForm({ ...form, hoursPerWeek: e.target.value })}>
                  {[2, 4, 6, 8, 10, 14, 20].map((h) => <option key={h} value={h}>{h}</option>)}
                </Select>
                <Select label="Session length" name="sessionMinutes" value={form.sessionMinutes}
                  onChange={(e) => setForm({ ...form, sessionMinutes: e.target.value })}>
                  {[20, 30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} min</option>)}
                </Select>
              </div>
              <fieldset style={{ border: 'none', padding: 0 }}>
                <legend className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem' }}>Rest days</legend>
                <div className="row gap-1 wrap">
                  {DAYS.map((d, i) => {
                    const on = form.restDays.includes(i);
                    return (
                      <button key={d} type="button" onClick={() => setForm({
                        ...form, restDays: on ? form.restDays.filter((x) => x !== i) : [...form.restDays, i]
                      })} className="mode-chip" aria-pressed={on}>{d}</button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <div className="card card-pad">
              <div className="row spread wrap gap-2" style={{ marginBottom: '.8rem' }}>
                <h2 className="h3">Topics to cover</h2>
                <span className="faint" style={{ fontSize: '.8rem' }}>{selected.length} selected</span>
              </div>
              <div style={{ display: 'grid', gap: '.4rem', maxHeight: 340, overflowY: 'auto', paddingRight: '.3rem' }}>
                {topics.map((t) => {
                  const on = selected.includes(t.id);
                  return (
                    <label key={t.id} className="row gap-2" style={{ padding: '.45rem .6rem', borderRadius: 8, cursor: 'pointer', fontSize: '.86rem',
                      background: on ? 'var(--accent-soft)' : 'transparent', border: `1px solid ${on ? 'var(--accent)' : 'transparent'}` }}>
                      <input type="checkbox" checked={on}
                        onChange={() => setSelected(on ? selected.filter((x) => x !== t.id) : [...selected, t.id])} />
                      <span>{t.title}</span>
                      <span className="faint" style={{ fontSize: '.74rem', marginLeft: 'auto' }}>{t.subjectName}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <Button type="submit" loading={busy} block size="lg">Build my plan</Button>
          </form>
        )}
      </div>
    );
  }

  const byDay = new Map<string, PlanItem[]>();
  for (const it of items) {
    const key = it.scheduledFor ? new Date(it.scheduledFor).toDateString() : 'Unscheduled';
    const arr = byDay.get(key) ?? [];
    arr.push(it); byDay.set(key, arr);
  }

  return (
    <div className="stack gap-4">
      <header className="row spread wrap gap-2">
        <div>
          <h1 className="h2">{planTitle ?? 'Your plan'}</h1>
          <p className="muted" style={{ fontSize: '.84rem', marginTop: '.2rem' }}>{done} of {items.length} sessions complete</p>
        </div>
        <span className="chip">{health ?? 'ACTIVE'}</span>
      </header>
      <ProgressBar value={done} max={items.length} label="Plan completion" showValue />

      {[...byDay.entries()].map(([day, list], di) => (
        <section key={day} className="anim-fade-up" style={{ animationDelay: `${Math.min(di, 6) * 60}ms` }}>
          <h2 className="h3" style={{ marginBottom: '.6rem', fontSize: '.95rem', color: 'var(--text-muted)' }}>{day}</h2>
          <div className="stack gap-2">
            {list.map((it) => {
              const isDone = it.status === 'DONE';
              const skipped = it.status === 'SKIPPED';
              return (
                <div key={it.id} className="card card-pad row gap-3" style={{ alignItems: 'flex-start', opacity: isDone || skipped ? .6 : 1, transition: 'opacity 260ms' }}>
                  <span aria-hidden="true" style={{
                    width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 2,
                    display: 'grid', placeItems: 'center', fontSize: '.72rem', fontWeight: 700,
                    border: `1.5px solid ${isDone ? 'var(--success)' : 'var(--border-strong)'}`,
                    background: isDone ? 'var(--success)' : 'transparent', color: isDone ? '#fff' : 'transparent'
                  }}>✓</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '.9rem', fontWeight: 560, textDecoration: isDone ? 'line-through' : 'none' }}>{it.title}</p>
                    <p className="faint" style={{ fontSize: '.76rem', marginTop: '.25rem', lineHeight: 1.55 }}>
                      {it.minutes} min{it.reason ? ` · ${it.reason}` : ''}
                    </p>
                  </div>
                  <div className="row gap-1">
                    {!isDone && <button onClick={() => void act(it.id, 'COMPLETE', it.title)} className="btn btn-outline btn-sm">Done</button>}
                    {!skipped && !isDone && <button onClick={() => void act(it.id, 'SKIP', it.title)} className="btn btn-ghost btn-sm">Skip</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
