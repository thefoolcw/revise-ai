import { year10Combined } from './batchC-year10-combined';
import { year10Computing } from './batchC-year10-computing';
import { year10Physics } from './batchC-year10-physics';
import { year10Chemistry } from './batchC-year10-chemistry';
import { year10Biology } from './batchC-year10-biology';
import { year10Application } from './batchC-year10-maths-application';
import { compileActivities } from '../authoredActivities';
import { year10Number } from './batchC-year10-maths-number';
export const batchYear10 = compileActivities('year-10', [['maths', [...year10Number, ...year10Application]], year10Biology, year10Chemistry, year10Physics, year10Computing, year10Combined]);
