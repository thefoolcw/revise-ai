import { z } from 'zod';
import { getYearMeta } from './types';

/** Derive dependent fields atomically; a saved explicit year is never inferred away. */
export function curriculumProfileUpdate(
  current: { yearGroup: string | null; subjectIds: string[] },
  patch: { yearGroup?: string | null; educationStage?: string | null; subjectIds?: string[]; completeOnboarding?: boolean; ageBand?: string }
) {
  const yearId = patch.yearGroup !== undefined ? patch.yearGroup : current.yearGroup;
  const fail = (path: string, message: string): never => {
    throw new z.ZodError([{ code: 'custom', path: [path], message }]);
  };
  if (patch.yearGroup !== undefined && !getYearMeta(patch.yearGroup)) {
    fail('yearGroup', 'Choose a supported year group.');
  }
  const year = getYearMeta(yearId);
  if (!year) {
    if (patch.subjectIds !== undefined || patch.completeOnboarding || patch.educationStage !== undefined) {
      fail('yearGroup', 'Choose your year group before selecting subjects.');
    }
    return {};
  }
  if (patch.educationStage !== undefined && patch.educationStage !== year.stageId) {
    fail('educationStage', 'The education stage must match the selected year.');
  }
  const selected = [...new Set(patch.subjectIds ?? current.subjectIds)];
  if (patch.subjectIds && selected.some(id => !year.subjectIds.includes(id))) {
    fail('subjectIds', 'One or more subjects are not offered for the selected year.');
  }
  // Changing year retains only still-valid choices; the settings UI previews this.
  const subjectIds = selected.filter(id => year.subjectIds.includes(id));
  if (patch.completeOnboarding && !subjectIds.length) fail('subjectIds', 'Choose at least one subject.');
  if (patch.yearGroup === undefined && patch.subjectIds === undefined && patch.educationStage === undefined && !patch.completeOnboarding) {
    return patch.ageBand !== undefined ? { ageBand: year.ageBand } : {};
  }
  return { yearGroup: year.id, educationStage: year.stageId, ageBand: year.ageBand, subjectIds };
}
