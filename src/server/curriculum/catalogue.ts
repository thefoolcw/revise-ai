import { batch04 } from './batches/batch04-year3';
import { batch03 } from './batches/batch03-year2';
import { batch02 } from './batches/batch02-year1';
import { batch01 } from './batches/batch01-early-years';

/** Only authored, checked batches belong here. Never manufacture coverage. */
export const curriculumLessons = [...batch01, ...batch02, ...batch03, ...batch04];
export const curriculumCoverage = () => {
  const years: Record<string, Record<string, Record<string, number>>> = {};
  for (const lesson of curriculumLessons) {
    const subjects = years[lesson.year] ??= {};
    const topics = subjects[lesson.subject] ??= {};
    topics[lesson.topicTitle] = (topics[lesson.topicTitle] ?? 0) + 1;
  }
  return years;
};
