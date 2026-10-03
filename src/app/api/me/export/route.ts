import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { getDb, schema } from '@/server/db';
import { getCurrentUser } from '@/server/auth/session';
import { audit } from '@/server/audit';

/**
 * Data export. Deliberately excludes anything secret-bearing: key hashes,
 * session tokens and provider payloads are never included.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'You need to sign in.', retryable: false } },
      { status: 401 }
    );
  }

  const db = await getDb();
  const [profile] = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, user.id)).limit(1);

  const conversations = await db.select({ id: schema.aiConversations.id, title: schema.aiConversations.title, mode: schema.aiConversations.mode, createdAt: schema.aiConversations.createdAt })
    .from(schema.aiConversations).where(eq(schema.aiConversations.userId, user.id));

  // `ai_messages` is scoped through its conversation, not by a direct user column.
  const messages = conversations.length === 0 ? [] : await db.select({
    id: schema.aiMessages.id, conversationId: schema.aiMessages.conversationId,
    role: schema.aiMessages.role, content: schema.aiMessages.content, createdAt: schema.aiMessages.createdAt
  }).from(schema.aiMessages).where(inArray(schema.aiMessages.conversationId, conversations.map((c) => c.id)));

  const [notes, decks, cards, quizzes, quizAttempts, plans, planItems, studySessions, flashcardReviews] = await Promise.all([
    db.select({ id: schema.notes.id, title: schema.notes.title, body: schema.notes.body, tags: schema.notes.tags, version: schema.notes.version, createdAt: schema.notes.createdAt, updatedAt: schema.notes.updatedAt }).from(schema.notes).where(eq(schema.notes.userId, user.id)),
    db.select({ id: schema.flashcardDecks.id, name: schema.flashcardDecks.name, source: schema.flashcardDecks.source, createdAt: schema.flashcardDecks.createdAt }).from(schema.flashcardDecks).where(eq(schema.flashcardDecks.userId, user.id)),
    db.select({ id: schema.flashcards.id, deckId: schema.flashcards.deckId, front: schema.flashcards.front, back: schema.flashcards.back, hint: schema.flashcards.hint, ease: schema.flashcards.ease, intervalDays: schema.flashcards.intervalDays, repetitions: schema.flashcards.repetitions, dueAt: schema.flashcards.dueAt }).from(schema.flashcards).where(eq(schema.flashcards.userId, user.id)),
    db.select({ id: schema.quizzes.id, title: schema.quizzes.title, source: schema.quizzes.source, createdAt: schema.quizzes.createdAt }).from(schema.quizzes).where(eq(schema.quizzes.userId, user.id)),
    db.select({ id: schema.quizAttempts.id, quizId: schema.quizAttempts.quizId, score: schema.quizAttempts.score, total: schema.quizAttempts.total, submittedAt: schema.quizAttempts.submittedAt }).from(schema.quizAttempts).where(eq(schema.quizAttempts.userId, user.id)),
    db.select({ id: schema.studyPlans.id, title: schema.studyPlans.title, targetDate: schema.studyPlans.targetDate, hoursPerWeek: schema.studyPlans.hoursPerWeek, status: schema.studyPlans.status, createdAt: schema.studyPlans.createdAt }).from(schema.studyPlans).where(eq(schema.studyPlans.userId, user.id)),
    db.select({ id: schema.studyPlanItems.id, planId: schema.studyPlanItems.planId, topicTitle: schema.studyPlanItems.topicTitle, activity: schema.studyPlanItems.activity, scheduledFor: schema.studyPlanItems.scheduledFor, status: schema.studyPlanItems.status, durationMinutes: schema.studyPlanItems.durationMinutes }).from(schema.studyPlanItems).where(eq(schema.studyPlanItems.userId, user.id)),
    db.select({ id: schema.studySessions.id, startedAt: schema.studySessions.startedAt, endedAt: schema.studySessions.endedAt, actualMinutes: schema.studySessions.actualMinutes }).from(schema.studySessions).where(eq(schema.studySessions.userId, user.id)),
    db.select({ id: schema.flashcardReviews.id, cardId: schema.flashcardReviews.cardId, rating: schema.flashcardReviews.rating, reviewedAt: schema.flashcardReviews.reviewedAt }).from(schema.flashcardReviews).where(eq(schema.flashcardReviews.userId, user.id))
  ]);

  const lessonProgress = await db.select().from(schema.lessonProgress).where(eq(schema.lessonProgress.userId, user.id));

  await audit({ actorId: user.id, action: 'DATA_EXPORTED', target: user.id });

  const payload = {
    exportedAt: new Date().toISOString(),
    account: { email: user.email, displayName: user.displayName, roles: user.roles },
    profile: profile ? {
      educationStage: profile.educationStage, yearGroup: profile.yearGroup,
      ageBand: profile.ageBand, country: profile.country, timezone: profile.timezone,
      examBoardId: profile.examBoardId, qualificationId: profile.qualificationId,
      subjectIds: profile.subjectIds, goals: profile.goals, explainLevel: profile.explainLevel,
      targetExamDate: profile.targetExamDate, onboardedAt: profile.onboardedAt
    } : null,
    notes, decks, cards, quizzes, quizAttempts, plans, planItems,
    studySessions, conversations, messages, flashcardReviews, lessonProgress
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="revise-ai-export-${new Date().toISOString().slice(0, 10)}.json"`,
      'Cache-Control': 'no-store'
    }
  });
}
