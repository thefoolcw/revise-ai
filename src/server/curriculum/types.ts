export type EducationStageId =
  | 'NURSERY'
  | 'RECEPTION'
  | 'PRIMARY'
  | 'SECONDARY'
  | 'SIXTH_FORM'
  | 'UNIVERSITY';

export type YearGroupId =
  | 'nursery'
  | 'reception'
  | 'year-1'
  | 'year-2'
  | 'year-3'
  | 'year-4'
  | 'year-5'
  | 'year-6'
  | 'year-7'
  | 'year-8'
  | 'year-9'
  | 'year-10'
  | 'year-11'
  | 'year-12'
  | 'year-13'
  | 'uni-foundation'
  | 'uni-year-1'
  | 'uni-year-2'
  | 'uni-year-3'
  | 'uni-year-4'
  | 'postgraduate';

export type AgeBand =
  | 'EARLY_YEARS'
  | 'PRIMARY'
  | 'SECONDARY'
  | 'POST_16'
  | 'UNIVERSITY'
  | 'ADULT_LEARNER';

export type LessonDifficulty = 'Foundation' | 'Core' | 'Higher' | 'Advanced';

export type LessonSection = {
  heading: string;
  body: string;
  keyFacts?: string[];
  analogy?: string;
};

export type WorkedExample = {
  title: string;
  problem: string;
  steps: string[];
  finalAnswer: string;
  whyItWorks?: string;
};

export type MemoryTip = {
  title: string;
  mnemonicOrRule: string;
  explanation: string;
};

export type CommonMistake = {
  mistake: string;
  whyItHappens: string;
  correction: string;
};

export type QuickRecallItem = {
  prompt: string;
  answer: string;
};

export type PracticeQuestion = {
  id: string;
  question: string;
  options?: string[];
  answer: string;
  acceptedAnswers?: string[];
  hint?: string;
  explanation: string;
  difficulty: 'Warm-up' | 'Standard' | 'Exam-style' | 'Stretch';
};

export type CurriculumLesson = {
  id: string;
  slug: string;
  educationStage: EducationStageId;
  year: YearGroupId;
  subject: string;
  topic: string;
  topicTitle: string;
  subtopic: string;
  title: string;
  description: string;
  difficulty: LessonDifficulty;
  isPremium: boolean;
  estimatedMinutes: number;
  orderIndex: number;
  learningObjectives: string[];
  priorKnowledgeCheck: QuickRecallItem[];
  content: LessonSection[];
  examples: WorkedExample[];
  memoryTips: MemoryTip[];
  commonMistakes: CommonMistake[];
  quickRecall: QuickRecallItem[];
  practiceQuestions: PracticeQuestion[];
  answers: { questionId: string; answer: string; explanation: string }[];
  recap: string[];
  spacedRevisionSuggestion: string;
};

export type YearGroupMeta = {
  id: YearGroupId;
  label: string;
  fullLabel: string;
  summary: string;
  stageId: EducationStageId;
  stageLabel: string;
  ageBand: AgeBand;
  defaultQualificationId: string;
  defaultExplainLevel: 'SIMPLE' | 'STANDARD' | 'DETAILED' | 'UNIVERSITY';
  subjectIds: string[];
};

export type EducationStageMeta = {
  id: EducationStageId;
  label: string;
  subtitle: string;
  ageBand: AgeBand;
  years: YearGroupMeta[];
};

const EYFS_SUBJECTS = [
  'ey-comm',
  'ey-literacy',
  'ey-maths',
  'ey-world',
  'ey-pse',
  'ey-phys',
  'ey-arts'
];

const KS1_SUBJECTS = [
  'maths',
  'english-lang',
  'english-lit',
  'science-combined',
  'history',
  'geography',
  'computer-science',
  'art',
  'design-tech',
  'music',
  'pe',
  'religious-studies',
  'pshe'
];

const KS2_SUBJECTS = [
  'maths',
  'english-lang',
  'english-lit',
  'science-combined',
  'history',
  'geography',
  'computer-science',
  'french',
  'spanish',
  'art',
  'design-tech',
  'music',
  'pe',
  'religious-studies',
  'pshe'
];

const KS3_SUBJECTS = [
  'maths',
  'english-lang',
  'english-lit',
  'biology',
  'chemistry',
  'physics',
  'science-combined',
  'history',
  'geography',
  'computer-science',
  'french',
  'spanish',
  'german',
  'religious-studies',
  'art',
  'design-tech',
  'music',
  'drama',
  'pe',
  'pshe'
];

const GCSE_SUBJECTS = [
  'maths',
  'english-lang',
  'english-lit',
  'biology',
  'chemistry',
  'physics',
  'science-combined',
  'history',
  'geography',
  'computer-science',
  'business',
  'economics',
  'french',
  'spanish',
  'german',
  'religious-studies',
  'art',
  'design-tech',
  'music',
  'pe',
  'psychology',
  'sociology',
  'drama',
  'media',
  'food-nutrition'
];

const SIXTH_FORM_SUBJECTS = [
  'maths',
  'further-maths',
  'english-lang',
  'english-lit',
  'biology',
  'chemistry',
  'physics',
  'computer-science',
  'history',
  'geography',
  'economics',
  'business',
  'psychology',
  'sociology',
  'politics',
  'philosophy',
  'religious-studies',
  'french',
  'spanish',
  'german',
  'art',
  'design-tech',
  'music',
  'pe',
  'media'
];

const UNIVERSITY_SUBJECTS = [
  'law',
  'uni-coding',
  'computer-science',
  'maths',
  'uni-stats',
  'biology',
  'chemistry',
  'physics',
  'engineering',
  'economics',
  'business',
  'psychology',
  'history',
  'english-lit',
  'uni-essay',
  'uni-research',
  'uni-dissertation'
];

export const EDUCATION_STAGES: EducationStageMeta[] = [
  {
    id: 'NURSERY',
    label: 'Nursery',
    subtitle: 'Ages 3–4 · Early Years Foundation Stage (EYFS)',
    ageBand: 'EARLY_YEARS',
    years: [
      {
        id: 'nursery',
        label: 'Nursery',
        fullLabel: 'Nursery (EYFS)',
        summary: 'Playful early listening, sound awareness, counting to 5, shapes, and exploring the world.',
        stageId: 'NURSERY',
        stageLabel: 'Nursery',
        ageBand: 'EARLY_YEARS',
        defaultQualificationId: 'eyfs',
        defaultExplainLevel: 'SIMPLE',
        subjectIds: EYFS_SUBJECTS
      }
    ]
  },
  {
    id: 'RECEPTION',
    label: 'Reception',
    subtitle: 'Ages 4–5 · Early Years Foundation Stage (EYFS)',
    ageBand: 'EARLY_YEARS',
    years: [
      {
        id: 'reception',
        label: 'Reception',
        fullLabel: 'Reception (EYFS)',
        summary: 'Phase 2–3 phonics blending, number bonds to 10, early sentence building, and seasonal science.',
        stageId: 'RECEPTION',
        stageLabel: 'Reception',
        ageBand: 'EARLY_YEARS',
        defaultQualificationId: 'eyfs',
        defaultExplainLevel: 'SIMPLE',
        subjectIds: EYFS_SUBJECTS
      }
    ]
  },
  {
    id: 'PRIMARY',
    label: 'Primary School',
    subtitle: 'Years 1–6 · Key Stage 1 & Key Stage 2',
    ageBand: 'PRIMARY',
    years: [
      {
        id: 'year-1',
        label: 'Year 1',
        fullLabel: 'Year 1 (KS1)',
        summary: 'Place value to 20 and 100, Phase 5 phonics, everyday materials, plants, and local geography.',
        stageId: 'PRIMARY',
        stageLabel: 'Primary School',
        ageBand: 'PRIMARY',
        defaultQualificationId: 'ks1',
        defaultExplainLevel: 'SIMPLE',
        subjectIds: KS1_SUBJECTS
      },
      {
        id: 'year-2',
        label: 'Year 2',
        fullLabel: 'Year 2 (KS1)',
        summary: '2, 5 and 10 times tables, fractions of amounts, expanded noun phrases, habitats, and Great Fire of London.',
        stageId: 'PRIMARY',
        stageLabel: 'Primary School',
        ageBand: 'PRIMARY',
        defaultQualificationId: 'ks1',
        defaultExplainLevel: 'SIMPLE',
        subjectIds: KS1_SUBJECTS
      },
      {
        id: 'year-3',
        label: 'Year 3',
        fullLabel: 'Year 3 (Lower KS2)',
        summary: '3, 4 and 8 times tables, column addition/subtraction, rocks and fossils, forces and magnets, Stone to Iron Age.',
        stageId: 'PRIMARY',
        stageLabel: 'Primary School',
        ageBand: 'PRIMARY',
        defaultQualificationId: 'ks2',
        defaultExplainLevel: 'SIMPLE',
        subjectIds: KS2_SUBJECTS
      },
      {
        id: 'year-4',
        label: 'Year 4',
        fullLabel: 'Year 4 (Lower KS2)',
        summary: 'All times tables to 12×12, decimals and tenths, fronted adverbials, states of matter, electricity, and Roman Britain.',
        stageId: 'PRIMARY',
        stageLabel: 'Primary School',
        ageBand: 'PRIMARY',
        defaultQualificationId: 'ks2',
        defaultExplainLevel: 'STANDARD',
        subjectIds: KS2_SUBJECTS
      },
      {
        id: 'year-5',
        label: 'Year 5',
        fullLabel: 'Year 5 (Upper KS2)',
        summary: 'Fractions, decimals and percentages, prime numbers, relative clauses, Earth and space, life cycles, Anglo-Saxons and Vikings.',
        stageId: 'PRIMARY',
        stageLabel: 'Primary School',
        ageBand: 'PRIMARY',
        defaultQualificationId: 'ks2',
        defaultExplainLevel: 'STANDARD',
        subjectIds: KS2_SUBJECTS
      },
      {
        id: 'year-6',
        label: 'Year 6',
        fullLabel: 'Year 6 (Upper KS2 & SATs)',
        summary: 'Ratio, algebra foundations, long division, SATs reading & SPaG mastery, circulatory system, evolution, and electricity.',
        stageId: 'PRIMARY',
        stageLabel: 'Primary School',
        ageBand: 'PRIMARY',
        defaultQualificationId: 'ks2',
        defaultExplainLevel: 'STANDARD',
        subjectIds: KS2_SUBJECTS
      }
    ]
  },
  {
    id: 'SECONDARY',
    label: 'Secondary School',
    subtitle: 'Years 7–11 · Key Stage 3 & GCSE (KS4)',
    ageBand: 'SECONDARY',
    years: [
      {
        id: 'year-7',
        label: 'Year 7',
        fullLabel: 'Year 7 (KS3)',
        summary: 'Algebraic expressions, directed numbers, cells and particles, energy stores, Norman Conquest, and map skills.',
        stageId: 'SECONDARY',
        stageLabel: 'Secondary School',
        ageBand: 'SECONDARY',
        defaultQualificationId: 'ks3',
        defaultExplainLevel: 'STANDARD',
        subjectIds: KS3_SUBJECTS
      },
      {
        id: 'year-8',
        label: 'Year 8',
        fullLabel: 'Year 8 (KS3)',
        summary: 'Linear equations and graphs, ratio and proportion, digestion and respiration, periodic table, rivers and coasts, Tudors and Stuarts.',
        stageId: 'SECONDARY',
        stageLabel: 'Secondary School',
        ageBand: 'SECONDARY',
        defaultQualificationId: 'ks3',
        defaultExplainLevel: 'STANDARD',
        subjectIds: KS3_SUBJECTS
      },
      {
        id: 'year-9',
        label: 'Year 9',
        fullLabel: 'Year 9 (KS3 / GCSE Transition)',
        summary: 'Pythagoras and trigonometry, simultaneous equations, atomic structure, cell biology, 20th-century history, and tectonic hazards.',
        stageId: 'SECONDARY',
        stageLabel: 'Secondary School',
        ageBand: 'SECONDARY',
        defaultQualificationId: 'ks3',
        defaultExplainLevel: 'STANDARD',
        subjectIds: KS3_SUBJECTS
      },
      {
        id: 'year-10',
        label: 'Year 10',
        fullLabel: 'Year 10 (GCSE)',
        summary: 'Core GCSE Paper 1 topics across Maths, Sciences, English Language & Literature, Humanities, Computing, Business, and Languages.',
        stageId: 'SECONDARY',
        stageLabel: 'Secondary School',
        ageBand: 'SECONDARY',
        defaultQualificationId: 'gcse',
        defaultExplainLevel: 'STANDARD',
        subjectIds: GCSE_SUBJECTS
      },
      {
        id: 'year-11',
        label: 'Year 11',
        fullLabel: 'Year 11 (GCSE Exam Year)',
        summary: 'Full GCSE Paper 2 & Higher mastery, quantitative chemistry, homeostasis, electromagnetism, unseen poetry, and exam technique.',
        stageId: 'SECONDARY',
        stageLabel: 'Secondary School',
        ageBand: 'SECONDARY',
        defaultQualificationId: 'gcse',
        defaultExplainLevel: 'DETAILED',
        subjectIds: GCSE_SUBJECTS
      }
    ]
  },
  {
    id: 'SIXTH_FORM',
    label: 'Sixth Form / College',
    subtitle: 'Years 12–13 · AS & A Level / Post-16',
    ageBand: 'POST_16',
    years: [
      {
        id: 'year-12',
        label: 'Year 12',
        fullLabel: 'Year 12 (AS / A Level Year 1)',
        summary: 'Pure calculus & proof, physical/organic chemistry, biological molecules, mechanics & waves, macro/microeconomics, and A Level essay craft.',
        stageId: 'SIXTH_FORM',
        stageLabel: 'Sixth Form / College',
        ageBand: 'POST_16',
        defaultQualificationId: 'alevel',
        defaultExplainLevel: 'DETAILED',
        subjectIds: SIXTH_FORM_SUBJECTS
      },
      {
        id: 'year-13',
        label: 'Year 13',
        fullLabel: 'Year 13 (A Level Year 2)',
        summary: 'Differential equations, integration techniques, aromatic chemistry, gene expression, fields & nuclear physics, and synoptic A Level mastery.',
        stageId: 'SIXTH_FORM',
        stageLabel: 'Sixth Form / College',
        ageBand: 'POST_16',
        defaultQualificationId: 'alevel',
        defaultExplainLevel: 'DETAILED',
        subjectIds: SIXTH_FORM_SUBJECTS
      }
    ]
  },
  {
    id: 'UNIVERSITY',
    label: 'University',
    subtitle: 'Foundation Year to Postgraduate',
    ageBand: 'UNIVERSITY',
    years: [
      {
        id: 'uni-foundation',
        label: 'Foundation Year',
        fullLabel: 'University Foundation Year',
        summary: 'Bridging mathematics, scientific method, academic writing, programming fundamentals, and quantitative reasoning.',
        stageId: 'UNIVERSITY',
        stageLabel: 'University',
        ageBand: 'UNIVERSITY',
        defaultQualificationId: 'university',
        defaultExplainLevel: 'UNIVERSITY',
        subjectIds: UNIVERSITY_SUBJECTS
      },
      {
        id: 'uni-year-1',
        label: 'Year 1',
        fullLabel: 'University Year 1',
        summary: 'Linear algebra & multivariable calculus, data structures & algorithms, statistical inference, micro/macro theory, and critical reading.',
        stageId: 'UNIVERSITY',
        stageLabel: 'University',
        ageBand: 'UNIVERSITY',
        defaultQualificationId: 'university',
        defaultExplainLevel: 'UNIVERSITY',
        subjectIds: UNIVERSITY_SUBJECTS
      },
      {
        id: 'uni-year-2',
        label: 'Year 2',
        fullLabel: 'University Year 2',
        summary: 'Operating systems & databases, differential equations, econometrics & regression, experimental design, and intermediate domain modules.',
        stageId: 'UNIVERSITY',
        stageLabel: 'University',
        ageBand: 'UNIVERSITY',
        defaultQualificationId: 'university',
        defaultExplainLevel: 'UNIVERSITY',
        subjectIds: UNIVERSITY_SUBJECTS
      },
      {
        id: 'uni-year-3',
        label: 'Year 3',
        fullLabel: 'University Year 3',
        summary: 'Distributed systems & machine learning, advanced theory, Honours dissertation planning, literature reviews, and specialist modules.',
        stageId: 'UNIVERSITY',
        stageLabel: 'University',
        ageBand: 'UNIVERSITY',
        defaultQualificationId: 'university',
        defaultExplainLevel: 'UNIVERSITY',
        subjectIds: UNIVERSITY_SUBJECTS
      },
      {
        id: 'uni-year-4',
        label: 'Year 4',
        fullLabel: 'University Year 4 (Integrated Masters)',
        summary: 'Integrated Masters (MEng/MSci) advanced modelling, research seminars, replication studies, and capstone thesis defence.',
        stageId: 'UNIVERSITY',
        stageLabel: 'University',
        ageBand: 'UNIVERSITY',
        defaultQualificationId: 'university',
        defaultExplainLevel: 'UNIVERSITY',
        subjectIds: UNIVERSITY_SUBJECTS
      },
      {
        id: 'postgraduate',
        label: 'Postgraduate',
        fullLabel: 'Postgraduate (MSc / MA / PhD)',
        summary: 'Postgraduate research methodology, causal inference, systematic reviews, thesis architecture, and peer-review writing.',
        stageId: 'UNIVERSITY',
        stageLabel: 'University',
        ageBand: 'UNIVERSITY',
        defaultQualificationId: 'university',
        defaultExplainLevel: 'UNIVERSITY',
        subjectIds: UNIVERSITY_SUBJECTS
      }
    ]
  }
];

export const ALL_YEAR_GROUPS: YearGroupMeta[] = EDUCATION_STAGES.flatMap((s) => s.years);

const YEAR_MAP = new Map<string, YearGroupMeta>(ALL_YEAR_GROUPS.map((y) => [y.id, y]));
const STAGE_MAP = new Map<string, EducationStageMeta>(EDUCATION_STAGES.map((s) => [s.id, s]));

export function getYearMeta(yearId: string | null | undefined): YearGroupMeta | null {
  if (!yearId) return null;
  return YEAR_MAP.get(yearId) ?? null;
}

export function getStageMeta(stageId: string | null | undefined): EducationStageMeta | null {
  if (!stageId) return null;
  return STAGE_MAP.get(stageId) ?? null;
}

/**
 * Resolves the active YearGroupMeta for a user. If a pre-existing user profile
 * does not yet have `yearGroup` set, derives the best match from `qualificationId`
 * or `ageBand` so every user always has a valid year context.
 */
export function resolveUserYearGroup(user: {
  yearGroup?: string | null;
  educationStage?: string | null;
  qualificationId?: string | null;
  ageBand?: string | null;
}): YearGroupMeta {
  if (user.yearGroup) {
    const explicit = YEAR_MAP.get(user.yearGroup);
    if (!explicit) throw new Error('Unsupported saved year group; select a valid year in Settings.');
    return explicit;
  }
  if (user.qualificationId === 'eyfs') return YEAR_MAP.get('reception')!;
  if (user.qualificationId === 'ks1') return YEAR_MAP.get('year-2')!;
  if (user.qualificationId === 'ks2' || user.qualificationId === 'sats-7plus') return YEAR_MAP.get('year-6')!;
  if (user.qualificationId === 'ks3') return YEAR_MAP.get('year-8')!;
  if (user.qualificationId === 'gcse' || user.qualificationId === 'igcse' || user.qualificationId === 'national5') {
    return YEAR_MAP.get('year-10')!;
  }
  if (user.qualificationId === 'as') return YEAR_MAP.get('year-12')!;
  if (user.qualificationId === 'alevel' || user.qualificationId === 'higher' || user.qualificationId === 'ib-dp') {
    return YEAR_MAP.get('year-12')!;
  }
  if (user.qualificationId === 'university') return YEAR_MAP.get('uni-year-1')!;

  switch (user.ageBand) {
    case 'EARLY_YEARS': return YEAR_MAP.get('reception')!;
    case 'PRIMARY': return YEAR_MAP.get('year-5')!;
    case 'POST_16': return YEAR_MAP.get('year-12')!;
    case 'UNIVERSITY':
    case 'ADULT_LEARNER': return YEAR_MAP.get('uni-year-1')!;
    default: return YEAR_MAP.get('year-10')!;
  }
}

export function filterSubjectsForYear<T extends { id: string }>(yearId: string | null | undefined, allSubjects: T[]): T[] {
  const meta = getYearMeta(yearId);
  if (!meta) return [];
  const allowed = new Set(meta.subjectIds);
  const order = new Map(meta.subjectIds.map((id, i) => [id, i]));
  return allSubjects
    .filter((s) => allowed.has(s.id))
    .sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
}
