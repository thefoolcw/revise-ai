import { compileActivities } from '../authoredActivities';
import { year5Core } from './batch05-year5-core';
import { year5World } from './batch05-year5-world';
import { year5Practical } from './batch05-year5-practical';
export const batchYear5 = compileActivities('year-5', [...year5Core, ...year5World, ...year5Practical]);
