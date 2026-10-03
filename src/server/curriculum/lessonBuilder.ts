/** Compatibility export for authored content. This compiler only maps supplied
 * teaching data into records; it never invents questions or duplicates lessons
 * across years to claim coverage. */
export { compileActivities } from './authoredActivities';
export type { Activity, Topic, Subject } from './authoredActivities';
