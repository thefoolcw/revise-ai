'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_YEAR_GROUPS, getYearMeta, filterSubjectsForYear } from '@/server/curriculum/types';
import { patch } from '@/lib/client';
import { Button, Alert, Input, Select } from '@/components/ui/primitives';

type Subject = { id: string; name: string };
export function SubjectManager({ yearGroup, selectedIds, subjects, allowYearChange = false }: {
  yearGroup: string | null; selectedIds: string[]; subjects: Subject[]; allowYearChange?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [year, setYear] = useState(yearGroup ?? '');
  const [selected, setSelected] = useState(selectedIds);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const valid = filterSubjectsForYear(year, subjects);
  const visible = valid.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));

  async function save() {
    setBusy(true); setError('');
    try {
      await patch('/api/me', { yearGroup: year, subjectIds: selected.filter(id => valid.some(s => s.id === id)) });
      dialog.current?.close();
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save subjects.'); }
    finally { setBusy(false); }
  }
  return <>
    <Button variant="outline" onClick={() => {
      setYear(yearGroup ?? ''); setSelected(selectedIds); setQuery(''); setError(''); dialog.current?.showModal();
    }}>{allowYearChange ? 'Manage year & subjects' : '+ Add Subject'}</Button>
    <dialog ref={dialog} aria-labelledby="subject-manager-title" className="card card-pad" style={{ width: 'min(620px, calc(100vw - 2rem))', margin: 'auto', maxHeight: '85dvh', overflowY: 'auto', color: 'var(--text)' }}>
      <div className="stack gap-3">
        <div className="row spread gap-2">
          <h2 id="subject-manager-title" className="h3">{allowYearChange ? 'Your year & subjects' : '+ Add another subject'}</h2>
          <Button variant="ghost" onClick={() => dialog.current?.close()}>Close</Button>
        </div>
        {error && <Alert tone="danger" title="Could not save">{error}</Alert>}
        {allowYearChange ? <Select name="manageYear" label="Year group" value={year} onChange={e => {
          const next = e.target.value; setYear(next);
          setSelected(ids => ids.filter(id => getYearMeta(next)?.subjectIds.includes(id)));
        }}>
          <option value="" disabled>Choose your year</option>
          {ALL_YEAR_GROUPS.map(y => <option key={y.id} value={y.id}>{y.fullLabel}</option>)}
        </Select> : <p>{getYearMeta(year)?.fullLabel ?? 'Choose a year in Settings first.'}</p>}
        {allowYearChange && <p className="muted">When you change year, only subjects offered in the new year remain selected. Your previous study progress is kept.</p>}
        <Input name="manageSubjectsSearch" label="Search subjects" value={query} onChange={e => setQuery(e.target.value)} />
        <fieldset className="stack gap-2" disabled={busy}>
          <legend className="sr-only">Subjects for your selected year</legend>
          {visible.map(s => <label key={s.id} className="card card-pad row gap-2">
            <input type="checkbox" checked={selected.includes(s.id)} onChange={e => setSelected(ids => e.target.checked ? [...ids, s.id] : ids.filter(id => id !== s.id))} />
            {s.name}
          </label>)}
          {!visible.length && <p>No subjects match. Try another search or select your year.</p>}
        </fieldset>
        <Button loading={busy} disabled={!getYearMeta(year)} onClick={() => void save()}>Save subjects</Button>
      </div>
    </dialog>
  </>;
}
