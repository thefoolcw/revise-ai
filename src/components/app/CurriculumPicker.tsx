'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Alert } from '@/components/ui/primitives';
import { publishedSubjects, type SubjectAvailability } from '@/server/curriculum/selection';
import { patch } from '@/lib/client';
import { filterSubjectsForYear, getYearMeta } from '@/server/curriculum/types';
import { useToast } from './Toaster';

export type Board = { id: string; name: string; shortName: string; country: string };
export type Qual = { id: string; name: string; level: string; boards: string[] };
export type Subject = { id: string; name: string; category: string };

/**
 * Curriculum selection. Only board/qualification combinations that exist in
 * the registry are offered, and an already-selected qualification is never
 * silently changed by a search (§05).
 */
export function CurriculumPicker({
  boards, quals, subjects, current, availability
}: {
  boards: Board[]; quals: Qual[]; subjects: Subject[]; availability: SubjectAvailability;
  current: { yearGroup: string | null; examBoardId: string | null; qualificationId: string | null; subjectIds: string[] };
}) {
  const router = useRouter();
  const toast = useToast();
  const [boardId, setBoardId] = useState(current.examBoardId ?? '');
  const [qualId, setQualId] = useState(current.qualificationId ?? '');
  const [subjectIds, setSubjectIds] = useState<string[]>(current.subjectIds ?? []);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedQual = quals.find((q) => q.id === qualId) ?? null;
  const allowedBoards = useMemo(
    () => (selectedQual && selectedQual.boards.length > 0 ? selectedQual.boards : boards.map((b) => b.id)),
    [selectedQual, boards]
  );

  const yearSubjects = useMemo(() => publishedSubjects(current.yearGroup, filterSubjectsForYear(current.yearGroup, subjects), availability), [current.yearGroup, subjects, availability]);
  const filtered = useMemo(() => {
    const n = search.trim().toLowerCase();
    if (!n) return yearSubjects;
    return yearSubjects.filter((s) => s.name.toLowerCase().includes(n) || s.category.toLowerCase().includes(n) || s.id.includes(n));
  }, [yearSubjects, search]);

  const grouped = useMemo(() => {
    const m = new Map<string, Subject[]>();
    for (const s of filtered) { const a = m.get(s.category) ?? []; a.push(s); m.set(s.category, a); }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const save = async () => {
    setBusy(true); setError(null);
    try {
      await patch('/api/me', {
        examBoardId: boardId || null, qualificationId: qualId || null, ...(getYearMeta(current.yearGroup) ? { subjectIds: subjectIds.filter(id => yearSubjects.some(s => s.id === id) || current.subjectIds.includes(id)) } : {})
      });
      toast.push('Curriculum saved', 'success');
      router.refresh();
    } catch (ex) { setError(ex instanceof Error ? ex.message : 'Could not save your curriculum.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="stack gap-4">
      {error && <Alert tone="danger" title="Could not save">{error}</Alert>}

      <div className="card card-pad stack gap-3">
        <h2 className="h3">Exam board & qualification</h2>
        <div style={{ display: 'grid', gap: '.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))' }}>
          <Select label="Qualification" name="qualificationId" value={qualId}
            onChange={(e) => { const id = e.target.value; setQualId(id);
              const q = quals.find((x) => x.id === id);
              // Keep a still-valid board; drop one the new qualification does not offer.
              if (q && q.boards.length > 0 && !q.boards.includes(boardId)) setBoardId(q.boards[0]!);
            }}>
            <option value="">Not set</option>
            {quals.filter(q => q.level === getYearMeta(current.yearGroup)?.ageBand).map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
          </Select>
          <Select label="Exam board" name="examBoardId" value={boardId} onChange={(e) => setBoardId(e.target.value)}>
            <option value="">Not set</option>
            {boards.filter((b) => allowedBoards.includes(b.id)).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </div>
        {selectedQual && selectedQual.boards.length === 0 && (
          <p className="faint" style={{ fontSize: '.78rem' }}>
            {selectedQual.name} is not board-specific, so any board or no board is valid.
          </p>
        )}
      </div>

      <div className="card card-pad stack gap-3">
        <div className="row spread wrap gap-2">
          <h2 className="h3">Subjects</h2>
          <span className="faint" style={{ fontSize: '.8rem' }}>{subjectIds.length} selected</span>
        </div>
        <Input label="" name="subjectSearch" placeholder="Search subjects…" value={search} onChange={(e) => setSearch(e.target.value)} />
        {grouped.length === 0 && <p className="faint" style={{ fontSize: '.84rem' }}>No subjects match that search.</p>}
        <div style={{ display: 'grid', gap: '1.1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', maxHeight: 420, overflowY: 'auto', paddingRight: '.3rem' }}>
          {grouped.map(([cat, list]) => (
            <div key={cat}>
              <p className="faint" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.45rem' }}>{cat}</p>
              <div className="stack gap-1">
                {list.map((s) => {
                  const on = subjectIds.includes(s.id);
                  return (
                    <label key={s.id} className="row gap-2" style={{ fontSize: '.86rem', cursor: 'pointer', padding: '.25rem .35rem', borderRadius: 7, background: on ? 'var(--accent-soft)' : 'transparent' }}>
                      <input type="checkbox" checked={on}
                        onChange={() => setSubjectIds(on ? subjectIds.filter((x) => x !== s.id) : [...subjectIds, s.id])} />
                      {s.name}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="row gap-2">
        <Button onClick={save} loading={busy}>Save curriculum</Button>
      </div>
    </div>
  );
}
