'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Alert, ProgressBar, Chip } from '@/components/ui/primitives';
import { Brand } from './Brand';
import { publishedSubjects, type SubjectAvailability } from '@/server/curriculum/selection';
import { patch } from '@/lib/client';
import {
  EDUCATION_STAGES,
  getYearMeta,
  filterSubjectsForYear,
  type EducationStageId,
  type YearGroupId
} from '@/server/curriculum/types';
import type { Board, Qual, Subject } from './CurriculumPicker';

const LEVELS: [string, string, string][] = [
  ['SIMPLE', 'Keep it simple', 'Clear, everyday language with short steps and visual analogies.'],
  ['STANDARD', 'Standard detail', 'Balanced explanations, worked examples, and key terminology.'],
  ['DETAILED', 'Full working & exam depth', 'Complete derivations, mark-scheme phrasing, and edge cases.']
];

export function OnboardingWizard({
  boards,
  quals,
  subjects,
  displayName,
  availability
}: {
  boards: Board[];
  quals: Qual[];
  subjects: Subject[];
  displayName: string;
  availability: SubjectAvailability;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [openStageId, setOpenStageId] = useState<EducationStageId | null>('SECONDARY');
  const [f, setF] = useState({
    educationStage: '' as EducationStageId | '',
    yearGroup: '' as YearGroupId | '',
    ageBand: '',
    country: 'GB',
    qualificationId: '',
    examBoardId: '',
    subjectIds: [] as string[],
    explainLevel: 'STANDARD',
    search: ''
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { label: 'Stage & Year', title: 'Choose your education stage and year' },
    { label: 'Subjects', title: 'Select your subjects' },
    { label: 'Preferences', title: 'Optional preferences' }
  ];

  const selectedYearMeta = useMemo(() => getYearMeta(f.yearGroup), [f.yearGroup]);

  const yearSubjects = useMemo(() => {
    return publishedSubjects(f.yearGroup, filterSubjectsForYear(f.yearGroup, subjects), availability);
  }, [f.yearGroup, subjects, availability]);

  const filteredSubjects = useMemo(() => {
    const n = f.search.trim().toLowerCase();
    if (!n) return yearSubjects;
    return yearSubjects.filter(
      (s) => s.name.toLowerCase().includes(n) || s.category.toLowerCase().includes(n)
    );
  }, [yearSubjects, f.search]);

  const groupedSubjects = useMemo(() => {
    const map = new Map<string, Subject[]>();
    for (const s of filteredSubjects) {
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return [...map.entries()];
  }, [filteredSubjects]);

  const selectedQual = quals.find((q) => q.id === f.qualificationId) ?? null;
  const allowedBoards = useMemo(
    () => (selectedQual && selectedQual.boards.length > 0 ? selectedQual.boards : boards.map((b) => b.id)),
    [selectedQual, boards]
  );

  const selectYear = (yearId: YearGroupId) => {
    const meta = getYearMeta(yearId);
    if (!meta) return;
    const allowedSet = new Set(availability[yearId] ?? []);
    const validExistingSubjects = f.subjectIds.filter((id) => allowedSet.has(id));
    setF((prev) => ({
      ...prev,
      educationStage: meta.stageId,
      yearGroup: yearId,
      ageBand: meta.ageBand,
      qualificationId: meta.defaultQualificationId,
      explainLevel: meta.defaultExplainLevel === 'UNIVERSITY' ? 'DETAILED' : meta.defaultExplainLevel,
      subjectIds: validExistingSubjects
    }));
  };

  const toggleSubject = (id: string) => {
    setF((prev) => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(id)
        ? prev.subjectIds.filter((x) => x !== id)
        : [...prev.subjectIds, id]
    }));
  };

  const canContinue = [
    !!f.yearGroup && !!f.educationStage && yearSubjects.length > 0,
    f.subjectIds.length > 0,
    true
  ][step];

  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      await patch('/api/me', {
        ageBand: (f.ageBand || 'SECONDARY') as never,
        educationStage: f.educationStage || null,
        yearGroup: f.yearGroup || null,
        country: f.country,
        qualificationId: f.qualificationId || null,
        examBoardId: f.examBoardId || null,
        subjectIds: f.subjectIds,
        explainLevel: f.explainLevel as never,
        completeOnboarding: true
      });
      router.push('/app/dashboard');
      router.refresh();
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : 'Could not save your setup.');
      setBusy(false);
    }
  };

  return (
    <div className="surface-2" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '2rem 1rem' }}>
      <main id="main" className="anim-fade-up" style={{ width: '100%', maxWidth: 680 }}>
        <div className="row spread" style={{ marginBottom: '1rem', paddingInline: '.25rem' }}>
          <Brand size={22} />
          {selectedYearMeta && (
            <div className="row gap-2">
              <Chip tone="accent">{selectedYearMeta.stageLabel}</Chip>
              <Chip tone="accent">{selectedYearMeta.label}</Chip>
            </div>
          )}
        </div>

        <div className="card card-pad stack gap-4">
          <header className="stack gap-2">
            <div className="row spread wrap gap-2">
              <p className="eyebrow">Step {step + 1} of {steps.length} · {steps[step]!.label}</p>
              <div className="row gap-1">
                {steps.map((s, idx) => (
                  <span
                    key={s.label}
                    style={{
                      width: idx === step ? 22 : 8,
                      height: 8,
                      borderRadius: 99,
                      background: idx <= step ? 'var(--accent)' : 'var(--border-strong)',
                      transition: 'width 240ms var(--ease-out), background-color 240ms var(--ease-out)'
                    }}
                  />
                ))}
              </div>
            </div>
            <h1 className="h2">{steps[step]!.title}</h1>
            <ProgressBar value={step + 1} max={steps.length} label="Onboarding progress" />
          </header>

          {error && <Alert tone="danger" title="Could not save">{error}</Alert>}

          {/* ── STEP 0: EXPANDABLE EDUCATION STAGE & YEAR ─────────── */}
          {step === 0 && (
            <div className="stack gap-3 anim-fade-in">
              <p className="muted" style={{ fontSize: '.92rem' }}>
                Welcome, <strong>{displayName}</strong>. Select an education stage below to expand its year groups, then pick your current year.
              </p>

              {selectedYearMeta && (
                <div
                  className="anim-scale-in row spread wrap gap-2"
                  style={{
                    padding: '.75rem 1rem',
                    borderRadius: 10,
                    background: 'var(--surface-3)',
                    border: '1px solid color-mix(in srgb, var(--accent) 28%, transparent)'
                  }}
                >
                  <div>
                    <span className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      Selected Year
                    </span>
                    <p style={{ fontWeight: 650, fontSize: '.95rem', color: 'var(--accent)' }}>
                      {selectedYearMeta.stageLabel} — {selectedYearMeta.fullLabel}
                    </p>
                  </div>
                  <Chip tone="accent">✓ Ready for subjects</Chip>
                </div>
              )}

              <div className="stack gap-2" role="region" aria-label="Education stages">
                {EDUCATION_STAGES.map((stage) => {
                  const isOpen = openStageId === stage.id;
                  const hasSelectedYear = stage.years.some((y) => y.id === f.yearGroup);
                  return (
                    <div
                      key={stage.id}
                      className="card"
                      style={{
                        borderColor: hasSelectedYear ? 'var(--accent)' : isOpen ? 'var(--border-strong)' : 'var(--border)',
                        overflow: 'hidden'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenStageId(isOpen ? null : stage.id)}
                        aria-expanded={isOpen}
                        aria-controls={`stage-panel-${stage.id}`}
                        className="row spread"
                        style={{
                          width: '100%',
                          padding: '.9rem 1.05rem',
                          background: hasSelectedYear ? 'color-mix(in srgb, var(--accent-soft) 45%, var(--surface))' : 'var(--surface)',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 180ms var(--ease-out)'
                        }}
                      >
                        <div>
                          <div className="row gap-2 wrap">
                            <span style={{ fontWeight: 660, fontSize: '.98rem', color: 'var(--text)' }}>{stage.label}</span>
                            {hasSelectedYear && selectedYearMeta && (
                              <span className="chip chip-accent" style={{ fontSize: '.72rem' }}>
                                {selectedYearMeta.label} selected
                              </span>
                            )}
                          </div>
                          <p className="muted" style={{ fontSize: '.8rem', marginTop: '.15rem' }}>{stage.subtitle}</p>
                        </div>
                        <span className="chevron-rotate" data-open={isOpen ? 'true' : 'false'} aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>

                      <div id={`stage-panel-${stage.id}`} className="expand-wrap" data-open={isOpen ? 'true' : 'false'}>
                        <div className="expand-inner">
                          <div
                            style={{
                              padding: '.75rem 1.05rem 1rem',
                              borderTop: '1px solid var(--border)',
                              background: 'var(--surface-2)',
                              display: 'grid',
                              gap: '.55rem',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))'
                            }}
                          >
                            {stage.years.map((yr) => {
                              const active = f.yearGroup === yr.id;
                              return (
                                <button
                                  key={yr.id}
                                  type="button"
                                  disabled={!availability[yr.id]?.length}
                                  title={!availability[yr.id]?.length ? "No published courses for this year" : undefined}
                                  onClick={() => selectYear(yr.id)}
                                  aria-pressed={active}
                                  className={`card card-interactive ${active ? 'card-selected' : ''}`}
                                  style={{
                                    padding: '.75rem .85rem',
                                    textAlign: 'left',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '.25rem'
                                  }}
                                >
                                  <div className="row spread gap-2">
                                    <span style={{ fontWeight: 650, fontSize: '.9rem', color: active ? 'var(--accent)' : 'var(--text)' }}>
                                      {yr.label}
                                    </span>
                                    {active && (
                                      <span
                                        className="anim-scale-in"
                                        style={{
                                          width: 18,
                                          height: 18,
                                          borderRadius: 99,
                                          background: 'var(--accent)',
                                          color: '#fff',
                                          fontSize: '.7rem',
                                          display: 'grid',
                                          placeItems: 'center',
                                          fontWeight: 700
                                        }}
                                      >
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                  <span className="muted" style={{ fontSize: '.75rem', lineHeight: 1.45 }}>
                                    {yr.summary}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 1: SUBJECTS FOR SELECTED YEAR ────────────────── */}
          {step === 1 && (
            <div className="stack gap-3 anim-fade-in">
              <div className="row spread wrap gap-2">
                <p className="muted" style={{ fontSize: '.9rem' }}>
                  Showing subjects for <strong>{selectedYearMeta?.fullLabel ?? 'your year'}</strong>. Pick the subjects you want on your dashboard — you can add or remove subjects at any time.
                </p>
                <Chip tone="accent">{f.subjectIds.length} selected</Chip>
              </div>

              <div className="row gap-2 wrap">
                <div style={{ flex: 1, minWidth: 200 }}>
                  <Input
                    label=""
                    name="search"
                    placeholder={`Search ${selectedYearMeta?.label ?? ''} subjects…`}
                    value={f.search}
                    onChange={(e) => setF({ ...f, search: e.target.value })}
                  />
                </div>
                {f.subjectIds.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setF({ ...f, subjectIds: [] })}>
                    Clear selection
                  </Button>
                )}
              </div>

              <div className="stack gap-3" style={{ maxHeight: 370, overflowY: 'auto', paddingRight: '.25rem' }}>
                {groupedSubjects.length === 0 && (
                  <p className="faint" style={{ fontSize: '.86rem', padding: '1rem 0', textAlign: 'center' }}>
                    No subjects match &ldquo;{f.search}&rdquo;.
                  </p>
                )}
                {groupedSubjects.map(([category, list]) => (
                  <div key={category} className="stack gap-2">
                    <p className="eyebrow" style={{ fontSize: '.7rem' }}>{category}</p>
                    <div style={{ display: 'grid', gap: '.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))' }}>
                      {list.map((s) => {
                        const on = f.subjectIds.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleSubject(s.id)}
                            aria-pressed={on}
                            className={`card card-interactive ${on ? 'card-selected' : ''}`}
                            style={{
                              padding: '.68rem .85rem',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '.5rem'
                            }}
                          >
                            <span style={{ fontSize: '.88rem', fontWeight: on ? 640 : 540, color: on ? 'var(--accent)' : 'var(--text)' }}>
                              {s.name}
                            </span>
                            <span
                              aria-hidden="true"
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 5,
                                border: on ? '1px solid var(--accent)' : '1px solid var(--border-strong)',
                                background: on ? 'var(--accent)' : 'var(--surface)',
                                color: '#fff',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: '.7rem',
                                fontWeight: 700,
                                flexShrink: 0,
                                transition: 'all 150ms var(--ease-out)'
                              }}
                            >
                              {on ? '✓' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: OPTIONAL PREFERENCES ──────────────────────── */}
          {step === 2 && (
            <div className="stack gap-4 anim-fade-in">
              <div
                style={{
                  padding: '.85rem 1rem',
                  borderRadius: 10,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)'
                }}
              >
                <p className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Your Personalised Setup
                </p>
                <p style={{ fontWeight: 640, fontSize: '.94rem', marginTop: '.2rem' }}>
                  {selectedYearMeta?.stageLabel} · {selectedYearMeta?.fullLabel}
                </p>
                <div className="row gap-1 wrap" style={{ marginTop: '.5rem' }}>
                  {f.subjectIds.map((id) => {
                    const subj = subjects.find((s) => s.id === id);
                    return subj ? <Chip key={id} tone="accent">{subj.name}</Chip> : null;
                  })}
                </div>
              </div>

              <div className="stack gap-2">
                <p className="label" style={{ marginBottom: '.15rem' }}>Explanation style</p>
                <div className="stack gap-2">
                  {LEVELS.map(([id, title, desc]) => {
                    const active = f.explainLevel === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setF({ ...f, explainLevel: id })}
                        aria-pressed={active}
                        className={`card card-interactive ${active ? 'card-selected' : ''}`}
                        style={{ padding: '.75rem 1rem', textAlign: 'left' }}
                      >
                        <div className="row spread">
                          <span style={{ fontWeight: 640, fontSize: '.9rem', color: active ? 'var(--accent)' : 'var(--text)' }}>{title}</span>
                          {active && <Chip tone="accent">Selected</Chip>}
                        </div>
                        <p className="muted" style={{ fontSize: '.8rem', marginTop: '.2rem' }}>{desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
                <Select
                  label="Exam board (optional)"
                  name="examBoardId"
                  value={f.examBoardId}
                  onChange={(e) => setF({ ...f, examBoardId: e.target.value })}
                >
                  <option value="">Any / Not applicable</option>
                  {boards.filter((b) => allowedBoards.includes(b.id)).map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Select>

                <Select
                  label="Qualification pathway"
                  name="qualificationId"
                  value={f.qualificationId}
                  onChange={(e) => setF({ ...f, qualificationId: e.target.value })}
                >
                  <option value="">Automatic for {selectedYearMeta?.label ?? 'year'}</option>
                  {quals.filter(q => q.level === selectedYearMeta?.ageBand).map((q) => (
                    <option key={q.id} value={q.id}>{q.name}</option>
                  ))}
                </Select>
              </div>

              <p className="faint" style={{ fontSize: '.78rem' }}>
                You can add or remove subjects or change your year group at any time from your Dashboard or Settings.
              </p>
            </div>
          )}

          <div className="row spread gap-2" style={{ paddingTop: '.4rem', borderTop: '1px solid var(--border)' }}>
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || busy}
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
                Continue to {steps[step + 1]!.label} →
              </Button>
            ) : (
              <Button onClick={finish} loading={busy} disabled={!canContinue}>
                Finish &amp; open My Subjects →
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
