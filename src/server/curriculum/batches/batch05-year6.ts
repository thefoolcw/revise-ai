import { compileActivities } from '../authoredActivities';
import { year6Core } from './batch05-year6-core';
import { year6World } from './batch05-year6-world';
import { year6Practical } from './batch05-year6-practical';
export const batchYear6 = compileActivities('year-6', [...year6Core, ...year6World, ...year6Practical]);
