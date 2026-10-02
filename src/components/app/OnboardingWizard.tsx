'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Alert, ProgressBar } from '@/components/ui/primitives';
import { patch } from '@/lib/client';
import type { Board, Qual, Subject } from './CurriculumPicker';

const BANDS: [string, string][] = [
  ['EARLY_YEARS', 'Early years / Nursery'], ['PRIMARY', 'Primary'], ['SECONDARY', 'Secondary (KS3–KS4)'],
  ['POST_16', 'Post-16 (A level / equivalent)'], ['UNIVERSITY', 'University'], ['ADULT_LEARNER', 'Adult learner']
];
const LEVELS: [string, string][] = [
  ['SIMPLE', 'Keep it simple'], ['STANDARD', 'Standard detail'], ['DETAILED', 'Full working and caveats']
];

export function OnboardingWizard({ boards, quals, subjects, displayName }: {
  boards: Board[]; quals: Qual[]; subjects: Subject[]; displayName: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    ageBand: '', country: 'GB', qualificationId: '', examBoardId: '',
    subjectIds: [] as string[], explainLevel: 'STANDARD', search: ''
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = ['Your stage', 'Curriculum', 'Subjects', 'Preferences'];
  const selectedQual = quals.find((q) => q.id === f.qualificationId) ?? null;
  const allowedBoards = useMemo(
    () => (selectedQual && selectedQual.boards.length > 0 ? selectedQual.boards : boards.map((b) => b.id)),
    [selectedQual, boards]
  );

  const filtered = useMemo(() => {
    const n = f.search.trim().toLowerCase();
    if (!n) return subjects;
    return subjects.filter((s) => s.name.toLowerCase().includes(n) || s.category.toLowerCase().includes(n));
  }, [subjects, f.search]);

  const canContinue = [
    !!f.ageBand,
    true, // curriculum is optional — independent learners and custom university modules are valid
    f.subjectIds.length > 0,
    true
  ][step];

  const finish = async () => {
    setBusy(true); setError(null);
    try {
      await patch('/api/me', {
        ageBand: f.ageBand as never, country: f.country,
        qualificationId: f.qualificationId || null, examBoardId: f.examBoardId || null,
        subjectIds: f.subjectIds, explainLevel: f.explainLevel as never
      });
      router.push('/app/dashboard'); router.refresh();
    } catch (ex) { setError(ex instanceof Error ? ex.message : 'Could not save your setup.'); setBusy(false); }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '2rem 1.25rem' }}>
      <main id="main" className="anim-fade-up" style={{ width: '100%', maxWidth: 620 }}>
        <div className="card card-pad stack gap-4">
          <header>
            <p className="eyebrow" style={{ marginBottom: '.4rem' }}>Step {step + 1} of {steps.length}</p>
            <h1 className="h2">{steps[step]}</h1>
          </header>
          <ProgressBar value={step + 1} max={steps.length} label="Setup progress" />

          {error && <Alert tone="danger" title="Could not save">{error}</Alert>}

          {step === 0 && (
            <div className="stack gap-3">
              <p className="muted" style={{ fontSize: '.9rem' }}>
                Hello {displayName}. Which stage are you at? This shapes how explanations are written.
              </p>
              <div style={{ display: 'grid', gap: '.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))' }}>
                {BANDS.map(([id, label]) => (
                  <button key={id} onClick={() => setF({ ...f, ageBand: id })} className="mode-chip" aria-pressed={f.ageBand === id}
                    style={{ textAlign: 'left', padding: '.7rem .9rem' }}>{label}</button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="stack gap-3">
              <p className="muted" style={{ fontSize: '.9rem' }}>
                Pick your qualification and board if you have one. Independent learners and university students on
                custom modules can skip this.
              </p>
              <Select label="Qualification" name="qualificationId" value={f.qualificationId}
                onChange={(e) => { const id = e.target.value; setF({ ...f, qualificationId: id });
                  const q = quals.find((x) => x.id === id);
                  if (q && q.boards.length > 0 && !q.boards.includes(f.examBoardId)) setF({ ...f, qualificationId: id, examBoardId: q.boards[0]! });
                }}>
                <option value="">Not set / independent learner</option>
                {quals.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
              </Select>
              <Select label="Exam board" name="examBoardId" value={f.examBoardId}
                onChange={(e) => setF({ ...f, examBoardId: e.target.value })}>
                <option value="">Not set</option>
                {boards.filter((b) => allowedBoards.includes(b.id)).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
              <Input label="Country" name="country" maxLength={2} value={f.country}
                onChange={(e) => setF({ ...f, country: e.target.value.toUpperCase().slice(0, 2) })} />
            </div>
          )}

          {step === 2 && (
            <div className="stack gap-3">
              <p className="muted" style={{ fontSize: '.9rem' }}>Choose at least one subject. You can change these any time.</p>
              <Input label="" name="search" placeholder="Search subjects…" value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} />
              <div className="stack gap-1" style={{ maxHeight: 280, overflowY: 'auto', paddingRight: '.3rem' }}>
                {filtered.map((s) => {
                  const on = f.subjectIds.includes(s.id);
                  return (
                    <label key={s.id} className="row gap-2" style={{ fontSize: '.88rem', cursor: 'pointer', padding: '.35rem .45rem', borderRadius: 7, background: on ? 'var(--accent-soft)' : 'transparent' }}>
                      <input type="checkbox" checked={on}
                        onChange={() => setF({ ...f, subjectIds: on ? f.subjectIds.filter((x) => x !== s.id) : [...f.subjectIds, s.id] })} />
                      {s.name}
                      <span className="faint" style={{ fontSize: '.74rem', marginLeft: 'auto' }}>{s.category}</span>
                    </label>
                  );
                })}
              </div>
              <p className="faint" style={{ fontSize: '.78rem' }}>{f.subjectIds.length} selected</p>
            </div>
          )}

          {step === 3 && (
            <div className="stack gap-3">
              <p className="muted" style={{ fontSize: '.9rem' }}>How much detail do you want in explanations?</p>
              {LEVELS.map(([id, label]) => (
                <button key={id} onClick={() => setF({ ...f, explainLevel: id })} className="mode-chip" aria-pressed={f.explainLevel === id}
                  style={{ textAlign: 'left', padding: '.7rem .9rem', width: '100%' }}>{label}</button>
              ))}
              <p className="faint" style={{ fontSize: '.78rem', marginTop: '.5rem' }}>
                You can change all of this later in Curriculum and Settings.
              </p>
            </div>
          )}

          <div className="row spread gap-2">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
            {step < steps.length - 1
              ? <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>Continue</Button>
              : <Button onClick={finish} loading={busy} disabled={!canContinue}>Finish setup</Button>}
          </div>
        </div>
      </main>
    </div>
  );
}
