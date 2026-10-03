'use client';
import { publishedSubjects, type SubjectAvailability } from '@/server/curriculum/selection';
import { useState } from 'react';
import { ALL_YEAR_GROUPS, filterSubjectsForYear } from '@/server/curriculum/types';

export function YearSubjectFields({ initialYear, initialSubject, subjects, availability }: {
  availability: SubjectAvailability; initialYear: string; initialSubject: string; subjects: { id: string; name: string }[];
}) {
  const [year, setYear] = useState(initialYear);
  const [subject, setSubject] = useState(initialSubject);
  return <>
    <label className="stack gap-1">Year<select className="input" name="year" value={year} required onChange={e => { setYear(e.target.value); setSubject(''); }}>
      <option value="" disabled>Choose a year</option>{ALL_YEAR_GROUPS.map(y => <option key={y.id} value={y.id} disabled={!availability[y.id]?.length}>{y.fullLabel}</option>)}
    </select></label>
    <label className="stack gap-1">Subject<select className="input" name="subject" value={subject} onChange={e => setSubject(e.target.value)}>
      <option value="">All subjects in this year</option>{publishedSubjects(year, filterSubjectsForYear(year, subjects), availability).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select></label>
  </>;
}
