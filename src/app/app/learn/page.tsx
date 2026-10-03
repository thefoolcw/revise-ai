import { getSubjectAvailability } from '@/server/curriculum/availability';
import { LessonBrowser } from '@/components/app/LessonBrowser';
import { FreeTierAdBanner } from '@/components/app/FreeTierAdBanner';
import { CurriculumPicker } from '@/components/app/CurriculumPicker';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';
import { eq } from 'drizzle-orm';
import { Alert } from '@/components/ui/primitives';

export const metadata = { title: 'Curriculum' };
export const dynamic = 'force-dynamic';

export default async function LearnPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await getDb();
  const availability = await getSubjectAvailability();

  const [boards, quals, subjects, specs] = await Promise.all([
    db.select().from(schema.examBoards).where(eq(schema.examBoards.status, 'ACTIVE')),
    db.select().from(schema.qualifications),
    db.select({ id: schema.subjects.id, name: schema.subjects.name, category: schema.subjects.category }).from(schema.subjects),
    db.select({ id: schema.specifications.id }).from(schema.specifications).limit(1)
  ]);

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Curriculum</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Only board and qualification combinations that actually exist are offered. Nothing here is silently
          changed by a search.
        </p>
      </header>

      {specs.length === 0 && (
        <Alert tone="info" title="Topic trees are illustrative">
          No verified specifications have been attached yet, so topic lists are marked illustrative. Board and
          qualification names are still accurate — the detailed topic breakdown is not yet sourced from an
          official specification.
        </Alert>
      )}

      <LessonBrowser availability={availability} userId={user.id} savedYear={user.yearGroup} subjects={subjects} params={await searchParams} />
      <details className="card card-pad"><summary>Manage exam board, qualification & selected subjects</summary>
      <CurriculumPicker availability={availability}
        boards={boards.map((b) => ({ id: b.id, name: b.name, shortName: b.shortName, country: b.country }))}
        quals={quals.map((q) => ({ id: q.id, name: q.name, level: q.level, boards: (q.boards as string[]) ?? [] }))}
        subjects={subjects}
        current={{ yearGroup: user.yearGroup, examBoardId: user.examBoardId, qualificationId: user.qualificationId, subjectIds: user.subjectIds }}
      />
      </details>
      <FreeTierAdBanner />
    </div>
  );
}
