import { year9Physics } from './batchB-year9-physics';
import { year9Computing } from './batchB-year9-computing';
import { year9Biology } from './batchB-year9-biology';
import { year9Chemistry } from './batchB-year9-chemistry';
import { compileActivities } from '../authoredActivities';
import { year9Maths } from './batchB-year9-maths';
export const batchYear9 = compileActivities('year-9', [year9Maths, year9Biology, year9Chemistry, year9Physics, year9Computing]);
