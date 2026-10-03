import { YearSubjectFields } from './YearSubjectFields';
import Link from 'next/link';
import { getYearMeta } from '@/server/curriculum/types';
import { LessonSearch, searchLessons } from '@/server/curriculum/search';
import { EntitlementService } from '@/server/premium/entitlements';

type Params = Record<string, string | string[] | undefined>;
export async function LessonBrowser({ userId, savedYear, subjects, params }: {
  userId: string; savedYear: string | null; subjects: { id: string; name: string }[]; params: Params;
}) {
  const flat = Object.fromEntries(Object.entries(params).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
  const year = getYearMeta(flat.year ?? savedYear);
  const parsed = LessonSearch.safeParse({ ...flat, year: year?.id });
  const [results, entitlement] = await Promise.all([
    parsed.success ? searchLessons(parsed.data) : null,
    EntitlementService.hasPremium(userId)
  ]);
  const pageLink = (page: number) => `/app/learn?${new URLSearchParams({ ...flat, year: year?.id ?? '', page: String(page) })}`;
  return <section className="stack gap-3" aria-labelledby="browse-title">
    <h2 id="browse-title" className="h3">Browse lessons</h2>
    <p className="muted">Browse another year without changing your profile. Original lessons are not an exam-board-verified syllabus.</p>
    <form action="/app/learn" className="card card-pad stack gap-3">
      <div style={{ display: 'grid', gap: '0.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        <YearSubjectFields key={`${year?.id}-${flat.subject ?? ""}`} initialYear={year?.id ?? ""} initialSubject={flat.subject ?? ""} subjects={subjects} />
        <label className="stack gap-1">Search<input className="input" name="q" maxLength={120} defaultValue={flat.q} placeholder="Title, concept or topic" /></label>
        <label className="stack gap-1">Topic<input className="input" name="topic" maxLength={120} defaultValue={flat.topic} /></label>
        <label className="stack gap-1">Difficulty<select className="input" name="difficulty" defaultValue={flat.difficulty ?? ''}><option value="">All levels</option>{['Foundation', 'Core', 'Higher', 'Advanced'].map(d => <option key={d}>{d}</option>)}</select></label>
        <label className="stack gap-1">Access<select className="input" name="access" defaultValue={flat.access ?? ''}><option value="">Free & Premium</option><option value="free">Free</option><option value="premium">Premium</option></select></label>
      </div>
      <div className="row wrap gap-2"><button className="btn btn-primary" type="submit">Find lessons</button><Link className="btn btn-outline" href={`/app/learn?year=${year?.id ?? ''}`}>Clear filters</Link></div>
    </form>
    {!parsed.success && <p role="alert">Choose a valid year and check the search filters.</p>}
    {results && <>
      <p role="status">{results.total} matching lessons · {year?.fullLabel}</p>
      <div className="stack gap-2">{results.items.map(l => <Link key={l.id} href={`/app/lessons/${l.slug}`} className="card card-pad stack gap-1">
        <div className="row spread wrap gap-2"><h3 className="h3">{l.title}</h3><span className={l.isPremium ? 'chip chip-gold' : 'chip'}>{l.isPremium ? entitlement.hasPremium ? 'Premium' : 'Premium Locked' : 'Free'}</span></div>
        <p>{l.description}</p><p className="faint">{subjects.find(s => s.id === l.subjectId)?.name} · {l.topicTitle} · {l.difficulty} · {l.estimatedMinutes} min</p>
      </Link>)}</div>
      {!results.items.length && <p>No published lessons match these filters. Try clearing the filters or choosing another year.</p>}
      <nav aria-label="Lesson result pages" className="row spread">{results.page > 1 && <Link href={pageLink(results.page - 1)}>← Previous</Link>}{results.page * results.pageSize < results.total && <Link href={pageLink(results.page + 1)}>Next →</Link>}</nav>
    </>}
  </section>;
}
