import { z } from 'zod';

export type SubjectAvailability = Record<string, string[]>;
export function publishedSubjects<T extends { id: string }>(
  year: string | null | undefined, subjects: T[], availability: SubjectAvailability
): T[] {
  const ids = new Set(availability[year ?? ''] ?? []);
  return subjects.filter(subject => ids.has(subject.id));
}

/** Reject NEW empty-course selections; never silently erase historical choices. */
export function assertPublishedSelection(current: { yearGroup: string | null; subjectIds: string[] },
  year: string, selected: string[], availability: SubjectAvailability, onboarding = false) {
  const available = new Set(availability[year] ?? []);
  const retained = current.yearGroup === year && !onboarding ? new Set(current.subjectIds) : new Set<string>();
  if (selected.some(id => !available.has(id) && !retained.has(id))) {
    throw new z.ZodError([{ code: 'custom', path: ['subjectIds'],
      message: 'A selected subject does not have a published course for this year. Refresh the catalogue and choose an available subject.' }]);
  }
}
