import { getCurriculumCoverage } from './coverage';

/** Publication availability is not the required syllabus. Never use this to
 * reduce strict coverage obligations. No lesson bodies cross this boundary. */
export async function getSubjectAvailability(): Promise<Record<string, string[]>> {
  const coverage = await getCurriculumCoverage();
  return Object.fromEntries(coverage.map(year => [year.year,
    year.subjects.filter(subject => subject.covered).map(subject => subject.subject)
  ]));
}
