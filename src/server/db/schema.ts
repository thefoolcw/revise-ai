import {
  pgTable, text, integer, boolean, timestamp, jsonb, real, index, uniqueIndex, primaryKey
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/* ── Shared column helpers ─────────────────────────────────────────── */
const id = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();
const deletedAt = () => timestamp('deleted_at', { withTimezone: true });

/* ══ IDENTITY & ACCESS ═════════════════════════════════════════════ */

export const users = pgTable('users', {
  id: id(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt()
}, (t) => [uniqueIndex('users_email_uq').on(sql`lower(${t.email})`)]);

export const profiles = pgTable('profiles', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  ageBand: text('age_band').notNull().default('SECONDARY'),
  educationStage: text('education_stage'),
  yearGroup: text('year_group'),
  country: text('country').notNull().default('GB'),
  timezone: text('timezone').notNull().default('Europe/London'),
  examBoardId: text('exam_board_id'),
  qualificationId: text('qualification_id'),
  subjectIds: jsonb('subject_ids').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  goals: jsonb('goals').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  targetExamDate: timestamp('target_exam_date', { withTimezone: true }),
  explainLevel: text('explain_level').notNull().default('STANDARD'),
  defaultModelId: text('default_model_id'),
  theme: text('theme').notNull().default('system'),
  reducedMotion: boolean('reduced_motion').notNull().default(false),
  onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const userRoles = pgTable('user_roles', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  grantedBy: text('granted_by'),
  grantedAt: createdAt()
}, (t) => [primaryKey({ columns: [t.userId, t.role] })]);

export const sessions = pgTable('sessions', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  userAgent: text('user_agent'),
  ipHint: text('ip_hint'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: createdAt()
}, (t) => [uniqueIndex('sessions_token_uq').on(t.tokenHash), index('sessions_user_idx').on(t.userId)]);

export const passwordResets = pgTable('password_resets', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: createdAt()
}, (t) => [uniqueIndex('password_resets_token_uq').on(t.tokenHash)]);

/* ══ CURRICULUM REGISTRY ═══════════════════════════════════════════ */

export const examBoards = pgTable('exam_boards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  country: text('country').notNull().default('GB'),
  url: text('url'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const qualifications = pgTable('qualifications', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  level: text('level').notNull(),
  ageBand: text('age_band').notNull(),
  country: text('country').notNull().default('GB'),
  boards: jsonb('boards').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const subjects = pgTable('subjects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  levels: jsonb('levels').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  skills: jsonb('skills').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const subjectAliases = pgTable('subject_aliases', {
  alias: text('alias').primaryKey(),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' })
});

export const specifications = pgTable('specifications', {
  id: id(),
  boardId: text('board_id').notNull().references(() => examBoards.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  qualificationId: text('qualification_id').notNull().references(() => qualifications.id, { onDelete: 'cascade' }),
  code: text('code'),
  title: text('title').notNull(),
  status: text('status').notNull().default('DRAFT'),
  sourceUrl: text('source_url'),
  contentVersion: text('content_version'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (t) => [index('specs_board_subject_idx').on(t.boardId, t.subjectId)]);

export const topics = pgTable('topics', {
  id: id(),
  slug: text('slug').notNull(),
  parentId: text('parent_id'),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
  specificationId: text('specification_id').references(() => specifications.id, { onDelete: 'cascade' }),
  educationStage: text('education_stage'),
  yearGroup: text('year_group'),
  title: text('title').notNull(),
  summary: text('summary'),
  orderIndex: integer('order_index').notNull().default(0),
  provenance: text('provenance').notNull().default('ILLUSTRATIVE'),
  status: text('status').notNull().default('PUBLISHED'),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (t) => [
  index('topics_subject_idx').on(t.subjectId),
  index('topics_year_subject_idx').on(t.yearGroup, t.subjectId),
  uniqueIndex('topics_slug_uq').on(t.slug)
]);

export const lessons = pgTable('lessons', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  educationStage: text('education_stage').notNull(),
  yearGroup: text('year_group').notNull(),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  topicSlug: text('topic_slug').notNull(),
  topicTitle: text('topic_title').notNull(),
  subtopicTitle: text('subtopic_title').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  difficulty: text('difficulty').notNull().default('Core'),
  isPremium: boolean('is_premium').notNull().default(false),
  estimatedMinutes: integer('estimated_minutes').notNull().default(15),
  orderIndex: integer('order_index').notNull().default(0),
  learningObjectives: jsonb('learning_objectives').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  priorKnowledgeCheck: jsonb('prior_knowledge_check').$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
  content: jsonb('content').$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
  examples: jsonb('examples').$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
  memoryTips: jsonb('memory_tips').$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
  commonMistakes: jsonb('common_mistakes').$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
  quickRecall: jsonb('quick_recall').$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
  practiceQuestions: jsonb('practice_questions').$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
  answers: jsonb('answers').$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
  recap: jsonb('recap').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  spacedRevisionSuggestion: text('spaced_revision_suggestion'),
  status: text('status').notNull().default('PUBLISHED'),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (t) => [
  uniqueIndex('lessons_slug_uq').on(t.slug),
  index('lessons_year_subject_idx').on(t.yearGroup, t.subjectId),
  index('lessons_topic_idx').on(t.topicSlug)
]);

export const lessonProgress = pgTable('lesson_progress', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id').notNull(),
  subjectId: text('subject_id').notNull(),
  yearGroup: text('year_group').notNull(),
  status: text('status').notNull().default('IN_PROGRESS'),
  practiceAttempted: integer('practice_attempted').notNull().default(0),
  practiceCorrect: integer('practice_correct').notNull().default(0),
  lastScorePercent: integer('last_score_percent'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  lastVisitedAt: timestamp('last_visited_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: updatedAt()
}, (t) => [
  uniqueIndex('lesson_progress_user_lesson_uq').on(t.userId, t.lessonId),
  index('lesson_progress_user_subject_idx').on(t.userId, t.subjectId)
]);

export const contentSources = pgTable('content_sources', {
  id: id(),
  title: text('title').notNull(),
  publisher: text('publisher'),
  url: text('url'),
  kind: text('kind').notNull().default('USER_CREATED'),
  trust: text('trust').notNull().default('UNVERIFIED'),
  subjectId: text('subject_id'),
  version: integer('version').notNull().default(1),
  effectiveFrom: timestamp('effective_from', { withTimezone: true }),
  licence: text('licence'),
  ownerId: text('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

/* ══ AI: MODELS, CONVERSATIONS, RUNS ═══════════════════════════════ */

export const modelRegistry = pgTable('model_registry', {
  modelId: text('model_id').primaryKey(),
  provider: text('provider').notNull().default('nvidia'),
  displayName: text('display_name'),
  description: text('description'),
  ownedBy: text('owned_by'),
  discoveredAt: timestamp('discovered_at', { withTimezone: true }),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  available: boolean('available').notNull().default(true),
  enabled: boolean('enabled').notNull().default(false),
  premiumOnly: boolean('premium_only').notNull().default(false),
  tasks: jsonb('tasks').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  inputModalities: jsonb('input_modalities').$type<string[]>().notNull().default(sql`'["text"]'::jsonb`),
  outputModalities: jsonb('output_modalities').$type<string[]>().notNull().default(sql`'["text"]'::jsonb`),
  contextLength: integer('context_length'),
  fallbackRank: integer('fallback_rank').notNull().default(100),
  maxOutputTokens: integer('max_output_tokens').notNull().default(2048),
  experimental: boolean('experimental').notNull().default(false),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (t) => [index('models_enabled_idx').on(t.enabled, t.available)]);

export const modelHealth = pgTable('model_health', {
  id: id(),
  modelId: text('model_id').notNull().references(() => modelRegistry.modelId, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  latencyMs: integer('latency_ms'),
  errorCode: text('error_code'),
  checkedAt: createdAt()
}, (t) => [index('model_health_idx').on(t.modelId, t.checkedAt)]);

export const aiConversations = pgTable('ai_conversations', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('New conversation'),
  mode: text('mode').notNull().default('EXPLAIN'),
  subjectId: text('subject_id'),
  topicId: text('topic_id'),
  examBoardId: text('exam_board_id'),
  qualificationId: text('qualification_id'),
  memoryEnabled: boolean('memory_enabled').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (t) => [index('conv_user_idx').on(t.userId, t.createdAt)]);

export const aiMessages = pgTable('ai_messages', {
  id: id(),
  conversationId: text('conversation_id').notNull().references(() => aiConversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  modelId: text('model_id'),
  promptVersion: text('prompt_version'),
  runId: text('run_id'),
  sourceRefs: jsonb('source_refs').$type<unknown[]>(),
  createdAt: createdAt()
}, (t) => [index('messages_conv_idx').on(t.conversationId, t.createdAt)]);

export const aiRuns = pgTable('ai_runs', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  requestId: text('request_id').notNull(),
  feature: text('feature').notNull(),
  task: text('task').notNull(),
  requestedModelId: text('requested_model_id'),
  actualModelId: text('actual_model_id'),
  fallbackUsed: boolean('fallback_used').notNull().default(false),
  promptVersion: text('prompt_version'),
  status: text('status').notNull(),
  errorCode: text('error_code'),
  latencyMs: integer('latency_ms'),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  entitlementSource: text('entitlement_source'),
  startedAt: createdAt(),
  completedAt: timestamp('completed_at', { withTimezone: true })
}, (t) => [index('runs_user_idx').on(t.userId, t.startedAt), index('runs_model_idx').on(t.actualModelId)]);

export const promptTemplates = pgTable('prompt_templates', {
  id: id(),
  name: text('name').notNull(),
  version: integer('version').notNull().default(1),
  template: text('template').notNull(),
  variables: jsonb('variables').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  status: text('status').notNull().default('PUBLISHED'),
  createdAt: createdAt(),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow()
}, (t) => [uniqueIndex('prompt_name_version_uq').on(t.name, t.version)]);

/* ══ USAGE LEDGER (append-only) ════════════════════════════════════ */

export const usageLedger = pgTable('usage_ledger', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  metric: text('metric').notNull(),
  amount: integer('amount').notNull().default(1),
  modelId: text('model_id'),
  feature: text('feature'),
  requestId: text('request_id'),
  entitlementSource: text('entitlement_source'),
  occurredAt: createdAt()
}, (t) => [index('usage_user_metric_idx').on(t.userId, t.metric, t.occurredAt)]);

/* ══ PREMIUM: ENTITLEMENTS + KEY VERIFICATION ══════════════════════ */

export const entitlements = pgTable('entitlements', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productSlug: text('product_slug').notNull(),
  source: text('source').notNull(),
  status: text('status').notNull().default('ACTIVE'),
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokeReason: text('revoke_reason'),
  keyVerificationId: text('key_verification_id'),
  providerEventId: text('provider_event_id'),
  createdBy: text('created_by'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (t) => [index('entitlements_user_idx').on(t.userId, t.status), index('entitlements_kv_idx').on(t.keyVerificationId)]);

export const keyVerifications = pgTable('key_verifications', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull().default('junkie'),
  keyHash: text('key_hash').notNull(),
  keyHint: text('key_hint').notNull(),
  state: text('state').notNull(),
  providerStatus: integer('provider_status'),
  providerReference: text('provider_reference'),
  providerMeta: jsonb('provider_meta').$type<Record<string, unknown>>(),
  grantedEntitlementId: text('granted_entitlement_id'),
  latencyMs: integer('latency_ms'),
  verifiedAt: createdAt()
}, (t) => [
  uniqueIndex('key_verifications_hash_uq').on(t.keyHash),
  index('key_verifications_user_idx').on(t.userId, t.verifiedAt)
]);

/* ══ STUDY: SESSIONS, PLANS, QUESTIONS ═════════════════════════════ */

export const studyPlans = pgTable('study_plans', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  targetDate: timestamp('target_date', { withTimezone: true }),
  hoursPerWeek: real('hours_per_week').notNull().default(5),
  sessionMinutes: integer('session_minutes').notNull().default(45),
  restDays: jsonb('rest_days').$type<number[]>().notNull().default(sql`'[]'::jsonb`),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (t) => [index('plans_user_idx').on(t.userId, t.status)]);

export const studyPlanItems = pgTable('study_plan_items', {
  id: id(),
  planId: text('plan_id').notNull().references(() => studyPlans.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
  subjectId: text('subject_id'),
  topicId: text('topic_id'),
  topicTitle: text('topic_title').notNull(),
  activity: text('activity').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  priority: integer('priority').notNull().default(2),
  status: text('status').notNull().default('PLANNED'),
  notes: text('notes'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (t) => [index('plan_items_sched_idx').on(t.userId, t.scheduledFor), index('plan_items_plan_idx').on(t.planId)]);

export const studySessions = pgTable('study_sessions', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planItemId: text('plan_item_id'),
  kind: text('kind').notNull(),
  subjectId: text('subject_id'),
  topicId: text('topic_id'),
  plannedMinutes: integer('planned_minutes'),
  actualMinutes: integer('actual_minutes').notNull().default(0),
  questionsAttempted: integer('questions_attempted').notNull().default(0),
  questionsCorrect: integer('questions_correct').notNull().default(0),
  cardsReviewed: integer('cards_reviewed').notNull().default(0),
  summary: text('summary'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true })
}, (t) => [index('study_sessions_user_idx').on(t.userId, t.startedAt)]);

export const questions = pgTable('questions', {
  id: id(),
  userId: text('user_id').notNull(),
  source: text('source').notNull().default('USER'),
  prompt: text('prompt').notNull(),
  subjectId: text('subject_id'),
  topicId: text('topic_id'),
  topicTitle: text('topic_title'),
  difficulty: text('difficulty').notNull().default('MEDIUM'),
  createdAt: createdAt()
}, (t) => [index('questions_user_idx').on(t.userId, t.createdAt)]);

export const questionAttempts = pgTable('question_attempts', {
  id: id(),
  questionId: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  correct: boolean('correct'),
  confidence: text('confidence'),
  timeMs: integer('time_ms'),
  explanation: text('explanation'),
  createdAt: createdAt()
}, (t) => [index('attempts_user_idx').on(t.userId, t.createdAt)]);

/* ══ QUIZZES ═══════════════════════════════════════════════════════ */

export const quizzes = pgTable('quizzes', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  subjectId: text('subject_id'),
  topicId: text('topic_id'),
  source: text('source').notNull().default('GENERATED'),
  createdAt: createdAt()
}, (t) => [index('quizzes_user_idx').on(t.userId, t.createdAt)]);

export const quizQuestions = pgTable('quiz_questions', {
  id: id(),
  quizId: text('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  prompt: text('prompt').notNull(),
  options: jsonb('options').$type<{ id: string; label: string }[]>().notNull().default(sql`'[]'::jsonb`),
  answer: jsonb('answer').notNull(),
  explanation: text('explanation'),
  difficulty: text('difficulty').notNull().default('MEDIUM'),
  topicTitle: text('topic_title'),
  orderIndex: integer('order_index').notNull().default(0)
}, (t) => [index('qq_quiz_idx').on(t.quizId, t.orderIndex)]);

export const quizAttempts = pgTable('quiz_attempts', {
  id: id(),
  quizId: text('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  score: integer('score').notNull().default(0),
  total: integer('total').notNull().default(0),
  answers: jsonb('answers').$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp('submitted_at', { withTimezone: true })
}, (t) => [index('quiz_attempts_user_idx').on(t.userId, t.submittedAt)]);

/* ══ FLASHCARDS ════════════════════════════════════════════════════ */

export const flashcardDecks = pgTable('flashcard_decks', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  subjectId: text('subject_id'),
  topicId: text('topic_id'),
  source: text('source').notNull().default('MANUAL'),
  archived: boolean('archived').notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (t) => [index('decks_user_idx').on(t.userId, t.archived)]);

export const flashcards = pgTable('flashcards', {
  id: id(),
  deckId: text('deck_id').notNull().references(() => flashcardDecks.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull().default('BASIC'),
  front: text('front').notNull(),
  back: text('back').notNull(),
  hint: text('hint'),
  tags: jsonb('tags').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  ease: real('ease').notNull().default(2.5),
  intervalDays: real('interval_days').notNull().default(0),
  repetitions: integer('repetitions').notNull().default(0),
  dueAt: timestamp('due_at', { withTimezone: true }).notNull().defaultNow(),
  lapses: integer('lapses').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (t) => [index('cards_due_idx').on(t.userId, t.dueAt)]);

export const flashcardReviews = pgTable('flashcard_reviews', {
  id: id(),
  cardId: text('card_id').notNull().references(() => flashcards.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: text('rating').notNull(),
  easeBefore: real('ease_before'),
  intervalBefore: real('interval_before'),
  easeAfter: real('ease_after'),
  intervalAfter: real('interval_after'),
  reviewedAt: createdAt()
}, (t) => [index('reviews_user_idx').on(t.userId, t.reviewedAt)]);

/* ══ NOTES & DOCUMENTS ═════════════════════════════════════════════ */

export const notes = pgTable('notes', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body: text('body').notNull().default(''),
  subjectId: text('subject_id'),
  topicId: text('topic_id'),
  tags: jsonb('tags').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  version: integer('version').notNull().default(1),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (t) => [index('notes_user_idx').on(t.userId, t.updatedAt)]);

export const documents = pgTable('documents', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  pageCount: integer('page_count'),
  status: text('status').notNull().default('PROCESSING'),
  error: text('error'),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (t) => [index('docs_user_idx').on(t.userId, t.createdAt)]);

export const documentChunks = pgTable('document_chunks', {
  id: id(),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  page: integer('page').notNull().default(1),
  chunkIndex: integer('chunk_index').notNull().default(0),
  text: text('text').notNull(),
  createdAt: createdAt()
}, (t) => [index('chunks_doc_idx').on(t.documentId, t.page, t.chunkIndex)]);

/* ══ PLATFORM ══════════════════════════════════════════════════════ */

export const featureFlags = pgTable('feature_flags', {
  key: text('key').primaryKey(),
  enabled: boolean('enabled').notNull().default(false),
  description: text('description'),
  rolloutPercent: integer('rollout_percent').notNull().default(100),
  allowlist: jsonb('allowlist').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  updatedAt: updatedAt()
});

export const auditLogs = pgTable('audit_logs', {
  id: id(),
  actorId: text('actor_id'),
  action: text('action').notNull(),
  target: text('target'),
  reason: text('reason'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  ipHint: text('ip_hint'),
  createdAt: createdAt()
}, (t) => [index('audit_action_idx').on(t.action, t.createdAt), index('audit_actor_idx').on(t.actorId)]);

export const analyticsEvents = pgTable('analytics_events', {
  id: id(),
  userId: text('user_id'),
  category: text('category').notNull(),
  subjectId: text('subject_id'),
  topicId: text('topic_id'),
  props: jsonb('props').$type<Record<string, unknown>>(),
  createdAt: createdAt()
}, (t) => [index('events_user_idx').on(t.userId, t.category, t.createdAt)]);

export const supportTickets = pgTable('support_tickets', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subject: text('subject').notNull(),
  category: text('category').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('OPEN'),
  priority: text('priority').notNull().default('NORMAL'),
  reply: text('reply'),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (t) => [index('tickets_user_idx').on(t.userId, t.createdAt)]);

export const notifications = pgTable('notifications', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: createdAt()
}, (t) => [index('notif_user_idx').on(t.userId, t.readAt)]);

export const rateLimits = pgTable('rate_limits', {
  bucket: text('bucket').primaryKey(),
  count: integer('count').notNull().default(0),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull().defaultNow()
});

export const jobs = pgTable('jobs', {
  id: id(),
  type: text('type').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>(),
  status: text('status').notNull().default('QUEUED'),
  progress: integer('progress').notNull().default(0),
  attemptCount: integer('attempt_count').notNull().default(0),
  lastErrorRedacted: text('last_error_redacted'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  createdAt: createdAt()
}, (t) => [index('jobs_status_idx').on(t.status, t.createdAt)]);
