import { year10Application } from './batchC-year10-maths-application';
import { compileActivities } from '../authoredActivities';
import { year10Number } from './batchC-year10-maths-number';
export const batchYear10 = compileActivities('year-10', [['maths', [...year10Number, ...year10Application]]]);
