import { batchYear8 } from './batches/batchA-year8';
import { batchYear7 } from './batches/batch06-year7';
import { batchYear6 } from './batches/batch05-year6';
import { batchYear5 } from './batches/batch05-year5';
import { batchYear4 } from './batches/batch04-year4';
import { batch04 } from './batches/batch04-year3';
import { batch03 } from './batches/batch03-year2';
import { batch02 } from './batches/batch02-year1';
import { batch01 } from './batches/batch01-early-years';

/** Only authored, checked batches belong here. Never manufacture coverage. */
export const curriculumLessons = [...batch01, ...batch02, ...batch03, ...batch04, ...batchYear4, ...batchYear5, ...batchYear6, ...batchYear7, ...batchYear8];
export const curriculumCoverage = () => {
  const years: Record<string, Record<string, Record<string, number>>> = {};
  for (const lesson of curriculumLessons) {
    const subjects = years[lesson.year] ??= {};
    const topics = subjects[lesson.subject] ??= {};
    topics[lesson.topicTitle] = (topics[lesson.topicTitle] ?? 0) + 1;
  }
  return years;
};
