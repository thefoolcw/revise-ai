import { compileActivities } from '../authoredActivities';
import { year7Stem } from './batch06-year7-stem';
import { year7Humanities } from './batch06-year7-humanities';
import { year7Languages } from './batch06-year7-languages';
import { year7Practical } from './batch06-year7-practical';
export const batchYear7 = compileActivities('year-7', [...year7Stem, ...year7Humanities, ...year7Languages, ...year7Practical]);
