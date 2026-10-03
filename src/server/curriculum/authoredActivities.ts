import { getYearMeta, type CurriculumLesson, type YearGroupId } from './types';

export type Activity = [title: string, objective: string, teaching: string, example: string,
  steps: string[], memory: string, mistake: string, correction: string,
  recall: string, recallAnswer: string, task: string, answer: string];
export type Topic = [title: string, activities: [Activity, Activity]];
export type Subject = [subject: string, topics: [Topic, Topic]];

function slug(text: string) { return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
export function compileActivities(year: YearGroupId, subjects: Subject[]): CurriculumLesson[] {
  return subjects.flatMap(([subject, topics]) => topics.flatMap(([topicTitle, activities], topicIndex) => activities.map((a, index) => {
    const [title, objective, teaching, problem, steps, memory, mistake, correction, recall, recallAnswer, task, answer] = a;
    const topic = `${year}-${subject}-${slug(topicTitle)}`;
    const id = `${topic}-${slug(title)}`;
    return {
      id, slug: id, educationStage: getYearMeta(year)!.stageId,
      year, subject, topic, topicTitle, subtopic: title, title, description: objective,
      difficulty: index ? 'Core' as const : 'Foundation' as const, isPremium: index === 1,
      estimatedMinutes: 8, orderIndex: topicIndex * 2 + index,
      learningObjectives: [objective],
      priorKnowledgeCheck: [{ prompt: recall, answer: recallAnswer }],
      content: [{ heading: year === 'nursery' || year === 'reception' ? 'Explore with a trusted adult' : 'Learn and apply', body: teaching }],
      examples: [{ title: 'Try it together', problem, steps, finalAnswer: steps[steps.length - 1]! }],
      memoryTips: [{ title: 'Remember together', mnemonicOrRule: memory, explanation: correction }],
      commonMistakes: [{ mistake, whyItHappens: 'This is a developing skill; model the activity and allow time to explore.', correction }],
      quickRecall: [{ prompt: recall, answer: recallAnswer }],
      practiceQuestions: [{ id: `${id}-q1`, question: task, answer, explanation: answer, difficulty: 'Standard' as const }],
      answers: [{ questionId: `${id}-q1`, answer, explanation: answer }],
      recap: [objective, memory, correction],
      spacedRevisionSuggestion: 'Repeat the activity tomorrow using another familiar object or example. A trusted adult can record what the child explains or demonstrates; this is not a timed test.'
    };
  })));
}
