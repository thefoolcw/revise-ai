import { ALL_YEAR_GROUPS } from './types';
import { SUBJECTS } from './subjectRegistry';
import type { SubjectAvailability } from './selection';

/** Enrich DB metadata without importing the authored lesson catalogue into UI
 * or navigation bundles. Required years and available years are different. */
export function subjectMetadata(subjectId: string, availability: SubjectAvailability) {
  const definition = SUBJECTS.find(subject => subject.id === subjectId);
  const requiredYears = ALL_YEAR_GROUPS.filter(year => year.subjectIds.includes(subjectId));
  const availableYears = requiredYears.filter(year => availability[year.id]?.includes(subjectId));
  return {
    description: definition?.description ?? definition?.skills.join(' · ') ?? '',
    jurisdiction: definition?.jurisdiction ?? null,
    educationStages: [...new Set(requiredYears.map(year => year.stageId))],
    qualificationIds: [...new Set(requiredYears.map(year => year.defaultQualificationId))],
    requiredYears: requiredYears.map(year => year.id),
    availableYears: availableYears.map(year => year.id),
    publicationStatus: availableYears.length ? 'PUBLISHED' as const : 'UNAVAILABLE' as const
  };
}
