import { getYearMeta, type CurriculumLesson, type YearGroupId, type LessonDifficulty, type QuickRecallItem, type PracticeQuestion } from './types';

export type ActivityDetail = {
  isPremium?: boolean;
  difficulty?: LessonDifficulty;
  estimatedMinutes?: number;
  priorKnowledgeCheck?: QuickRecallItem[];
  memoryExplanation?: string;
  misconceptionCause?: string;
  additionalPractice?: Omit<PracticeQuestion, 'id'>[];
  revision?: string;
};
export type Activity = [title: string, objective: string, teaching: string, example: string,
  steps: string[], memory: string, mistake: string, correction: string,
  recall: string, recallAnswer: string, task: string, answer: string, detail?: ActivityDetail];
export type Topic = [title: string, activities: Activity[]];
export type Subject = [subject: string, topics: Topic[]];

function slug(text: string) { return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
export function compileActivities(year: YearGroupId, subjects: Subject[]): CurriculumLesson[] {
  let orderIndex = 0;
  return subjects.flatMap(([subject, topics]) => topics.flatMap(([topicTitle, activities], topicIndex) => activities.map((a, index) => {
    const [title, objective, teaching, problem, steps, memory, mistake, correction, recall, recallAnswer, task, answer, detail] = a;
    const topic = `${year}-${subject}-${slug(topicTitle)}`;
    const id = `${topic}-${slug(title)}`;
    const questions: PracticeQuestion[] = [
      { id: `${id}-q1`, question: task, answer, explanation: answer, difficulty: detail?.difficulty === 'Higher' || detail?.difficulty === 'Advanced' ? 'Stretch' : 'Standard' },
      ...(detail?.additionalPractice ?? []).map((q, i) => ({ ...q, id: `${id}-q${i + 2}` }))
    ];
    return {
      id, slug: id, educationStage: getYearMeta(year)!.stageId,
      year, subject, topic, topicTitle, subtopic: title, title, description: objective,
      difficulty: detail?.difficulty ?? (index ? 'Core' as const : 'Foundation' as const), isPremium: detail?.isPremium ?? index === 1,
      estimatedMinutes: detail?.estimatedMinutes ?? 8, orderIndex: detail ? orderIndex++ : topicIndex * 2 + index,
      learningObjectives: [objective],
      priorKnowledgeCheck: detail?.priorKnowledgeCheck ?? [{ prompt: recall, answer: recallAnswer }],
      content: [{ heading: year === 'nursery' || year === 'reception' ? 'Explore with a trusted adult' : 'Learn and apply', body: teaching }],
      examples: [{ title: 'Try it together', problem, steps, finalAnswer: steps[steps.length - 1]! }],
      memoryTips: [{ title: 'Remember together', mnemonicOrRule: memory, explanation: detail?.memoryExplanation ?? correction }],
      commonMistakes: [{ mistake, whyItHappens: detail?.misconceptionCause ?? 'This is a developing skill; model the activity and allow time to explore.', correction }],
      quickRecall: [{ prompt: recall, answer: recallAnswer }],
      practiceQuestions: questions,
      answers: questions.map(q => ({ questionId: q.id, answer: q.answer, explanation: q.explanation })),
      recap: [objective, memory, correction],
      spacedRevisionSuggestion: detail?.revision ?? 'Repeat the activity tomorrow using another familiar object or example. A trusted adult can record what the child explains or demonstrates; this is not a timed test.'
    };
  })));
}
