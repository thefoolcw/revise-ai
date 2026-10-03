import { compileActivities } from '../authoredActivities';
import { year8Maths } from './batchA-year8-maths';
import { year8Biology } from './batchA-year8-biology';
import { year8Chemistry } from './batchA-year8-chemistry';
import { year8Physics } from './batchA-year8-physics';
import { year8Combined } from './batchA-year8-combined';
import { year8Computing } from './batchA-year8-computing';
export const batchYear8 = compileActivities('year-8', [year8Maths, year8Biology, year8Chemistry, year8Physics, year8Combined, year8Computing]);
