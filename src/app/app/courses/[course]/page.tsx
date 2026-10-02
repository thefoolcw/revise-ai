import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { Alert } from '@/components/ui/primitives';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';

export const dynamic = 'force-dynamic';

/**
 * University mode is module/course based. Revise AI never presents a fabricated
 * universal university syllabus — if a course has no verified specification, that
 * is stated plainly rather than invented.
 */
export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params;
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await getDb();

  const specs = await db.select().from(schema.specifications).where(eq(schema.specifications.id, course)).limit(1);
  const spec = specs[0] ?? null;
  const qual = spec ? (await db.select().from(schema.qualifications).where(eq(schema.qualifications.id, spec.qualificationId)).limit(1))[0] : null;
  if (!spec && !qual) notFound();

  return (
    <div className="stack gap-4">
      <header>
        <p className="faint" style={{ fontSize: '.78rem' }}><Link href="/app/learn">Curriculum</Link> / Courses</p>
        <h1 className="h2" style={{ marginTop: '.2rem' }}>{spec?.title ?? qual?.name ?? 'Course'}</h1>
        {spec?.code && <p className="faint tnum" style={{ fontSize: '.8rem', marginTop: '.25rem' }}>{spec.code}</p>}
      </header>

      {!spec ? (
        <Alert tone="warning" title="No verified module specification">
          Revise AI does not invent university module content. Attach a verified specification with an official
          source and version, or upload your own lecture material in the Library and work from that instead.
        </Alert>
      ) : (
        <div className="card card-pad stack gap-2">
          <div className="table-wrap"><table className="data">
            <caption className="sr-only">Specification record</caption>
            <tbody>
              <tr><td>Status</td><td>{spec.status}</td></tr>
              <tr><td>Version</td><td>{spec.contentVersion ?? 'not recorded'}</td></tr>
              <tr><td>Verified</td><td>{spec.verifiedAt ? new Date(spec.verifiedAt).toLocaleDateString('en-GB') : 'not verified'}</td></tr>
              {spec.sourceUrl && <tr><td>Source</td><td><a href={spec.sourceUrl} target="_blank" rel="noopener noreferrer">{new URL(spec.sourceUrl).hostname}</a></td></tr>}
            </tbody>
          </table></div>
        </div>
      )}

      <div className="row gap-2 wrap">
        <Link href="/app/tutor" className="btn btn-primary btn-sm">Ask the tutor</Link>
        <Link href="/app/library" className="btn btn-outline btn-sm">Upload lecture material</Link>
        <Link href="/app/planner" className="btn btn-outline btn-sm">Plan revision</Link>
      </div>
    </div>
  );
}
