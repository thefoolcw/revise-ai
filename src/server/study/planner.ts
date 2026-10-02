/**
 * Revision-plan allocation engine (§14).
 * Deterministic and explainable: every scheduled item can state why it is there.
 */
export type PlanTopic = {
  id: string; title: string; subjectId?: string | null;
  /** 0–1 from real attempt data; defaults to neutral when unknown. */
  confidence?: number | null;
  attempts?: number;
  mistakes?: number;
  priorityBoost?: number;
};

export type PlanInput = {
  topics: PlanTopic[];
  targetDate: Date;
  hoursPerWeek: number;
  sessionMinutes: number;
  restDays?: number[];              // 0=Sun … 6=Sat
  startDate?: Date;
  maxItems?: number;
};

export type PlanItem = {
  topicId: string; topicTitle: string; subjectId: string | null;
  scheduledFor: Date; activity: 'LEARN' | 'PRACTICE' | 'RECALL' | 'REVIEW';
  durationMinutes: number; priority: number; reasonCode: string;
};

export type PlanHealth =
  | 'ON_TRACK' | 'NEEDS_ATTENTION' | 'BEHIND' | 'NOT_ENOUGH_TIME';

export type PlanResult = {
  items: PlanItem[];
  totalMinutes: number;
  availableMinutes: number;
  health: PlanHealth;
  warnings: string[];
};

export function rankTopics(topics: PlanTopic[]): (PlanTopic & { score: number })[] {
  return topics
    .map((t) => {
      const attempts = t.attempts ?? 0;
      const mistakes = t.mistakes ?? 0;
      // Weakness signal only where there is real data (>=3 attempts).
      const weakness = attempts >= 3 ? mistakes / attempts : 0;
      const confidenceGap = t.confidence == null ? 0.35 : Math.max(0, 1 - t.confidence);
      const score = round3(confidenceGap * 0.6 + weakness * 0.4 + (t.priorityBoost ?? 0));
      return { ...t, score };
    })
    .sort((a, b) => b.score - a.score);
}

export function allocate(input: PlanInput): PlanResult {
  const warnings: string[] = [];
  const start = startOfDay(input.startDate ?? new Date());
  const target = startOfDay(input.targetDate);
  const days = Math.max(0, Math.round((target.getTime() - start.getTime()) / 864e5));
  const restDays = new Set(input.restDays ?? []);

  if (input.topics.length === 0) {
    return { items: [], totalMinutes: 0, availableMinutes: 0, health: 'NOT_ENOUGH_TIME', warnings: ['Add at least one topic to plan.'] };
  }
  if (days === 0) {
    return { items: [], totalMinutes: 0, availableMinutes: 0, health: 'NOT_ENOUGH_TIME', warnings: ['Your target date is today — there is no time left to schedule.'] };
  }

  const studyDays: Date[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 864e5);
    if (!restDays.has(d.getDay())) studyDays.push(d);
  }
  if (studyDays.length === 0) {
    return { items: [], totalMinutes: 0, availableMinutes: 0, health: 'NOT_ENOUGH_TIME', warnings: ['Every day before your target is marked as a rest day.'] };
  }

  const requestedPerDay = Math.max(0, (input.hoursPerWeek * 60) / 7);
  const sessionMinutes = Math.max(10, Math.min(180, input.sessionMinutes));
  // A chosen session may legitimately be longer than the average daily budget.
  // Allow one such session per study day instead of producing an empty plan.
  const perDayMinutes = requestedPerDay >= sessionMinutes ? requestedPerDay : sessionMinutes;
  const availableMinutes = Math.floor(perDayMinutes * studyDays.length);

  if (requestedPerDay > 0 && requestedPerDay < sessionMinutes) {
    warnings.push(`Your ${sessionMinutes}-minute sessions are longer than your daily study budget, so at most one session is scheduled per day.`);
  }

  const ranked = rankTopics(input.topics);
  // Workload estimate: 2 learning passes + 1 recall pass per topic, scaled by weakness.
  const demand = ranked.reduce((sum, t) => sum + sessionMinutes * (2 + (t.score > 0.5 ? 1 : 0)), 0);

  const items: PlanItem[] = [];
  const maxItems = input.maxItems ?? 200;
  let dayCursor = 0;
  let usedToday = 0;
  let budget = availableMinutes;

  const passes: { topic: (typeof ranked)[number]; activity: PlanItem['activity']; reason: string }[] = [];
  for (const t of ranked) {
    passes.push({ topic: t, activity: 'LEARN', reason: 'First pass over the topic' });
    passes.push({ topic: t, activity: 'PRACTICE', reason: 'Retrieval practice after learning' });
    if (t.score > 0.5) passes.push({ topic: t, activity: 'RECALL', reason: 'Weak topic — extra spaced recall' });
  }

  for (const pass of passes) {
    if (items.length >= maxItems) { warnings.push(`Capped at ${maxItems} scheduled items.`); break; }
    if (budget < sessionMinutes) { warnings.push('Not enough time for all selected objectives — narrow your topics or extend your target date.'); break; }
    while (dayCursor < studyDays.length) {
      const day = studyDays[dayCursor]!;
      if (usedToday + sessionMinutes <= perDayMinutes + 0.5) {
        items.push({
          topicId: pass.topic.id, topicTitle: pass.topic.title,
          subjectId: pass.topic.subjectId ?? null,
          scheduledFor: withTime(day, 17), activity: pass.activity,
          durationMinutes: sessionMinutes,
          priority: pass.topic.score > 0.6 ? 1 : pass.topic.score > 0.35 ? 2 : 3,
          reasonCode: pass.reason
        });
        usedToday += sessionMinutes;
        budget -= sessionMinutes;
        break;
      }
      dayCursor += 1; usedToday = 0;
    }
    if (dayCursor >= studyDays.length) {
      warnings.push('Ran out of study days before covering every topic.');
      break;
    }
  }

  const totalMinutes = items.reduce((s, i) => s + i.durationMinutes, 0);
  const covered = new Set(items.map((i) => i.topicId));
  const uncovered = ranked.filter((t) => !covered.has(t.id));

  // Plain-language health, derived from what actually fitted (§14).
  let health: PlanHealth;
  if (items.length === 0) health = 'NOT_ENOUGH_TIME';
  else if (uncovered.length === 0) health = demand > availableMinutes * 1.15 ? 'NEEDS_ATTENTION' : 'ON_TRACK';
  else {
    const coveredRatio = covered.size / ranked.length;
    // Most of the syllabus cannot be covered in the time available.
    health = coveredRatio < 0.6 ? 'NOT_ENOUGH_TIME' : 'BEHIND';
  }

  return { items, totalMinutes, availableMinutes, health, warnings: dedupe(warnings) };
}

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function withTime(d: Date, hour: number) { const x = new Date(d); x.setHours(hour, 0, 0, 0); return x; }
function round3(n: number) { return Math.round(n * 1000) / 1000; }
function dedupe(a: string[]) { return [...new Set(a)]; }
