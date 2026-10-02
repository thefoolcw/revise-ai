import { sql } from 'drizzle-orm';
import { getDb } from '../db';

export type TopicStat = { topic: string; attempts: number; correct: number; accuracyPercent: number | null };

export type ProgressReport = {
  windowDays: number;
  studyMinutes: number;
  questions: { attempted: number; correct: number; accuracyPercent: number | null; sufficientData: boolean };
  quizzes: { attempts: number; averageScorePercent: number | null; sufficientData: boolean };
  flashcards: { reviews: number; retentionPercent: number | null; sufficientData: boolean };
  weakest: TopicStat[];
  strongest: TopicStat[];
  explainability: string;
};

/**
 * Progress is always computed from stored records. Where the sample is too
 * small to be meaningful, we say so instead of inventing precision (§15, §20).
 *
 * Shared by the API route and the Progress page so the two can never disagree.
 */
export async function computeProgress(userId: string, windowDays = 30): Promise<ProgressReport> {
  const db = await getDb();
  const since = new Date(Date.now() - windowDays * 864e5);

  type Row = Record<string, unknown>;
  const first = (r: unknown): Row => {
    const rows = r as { rows?: Row[] } | Row[];
    const list = Array.isArray(rows) ? rows : rows.rows ?? [];
    return list[0] ?? {};
  };
  const num = (v: unknown) => Number(v ?? 0);

  const [attemptsRes, minutesRes, byTopicRes, quizRes, reviewsRes] = await Promise.all([
    db.execute(sql`
      SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE correct)::int AS correct
      FROM question_attempts WHERE user_id = ${userId} AND created_at >= ${since}`),
    db.execute(sql`
      SELECT COALESCE(SUM(actual_minutes),0)::int AS total
      FROM study_sessions WHERE user_id = ${userId} AND started_at >= ${since}`),
    db.execute(sql`
      SELECT q.topic_title AS topic,
             COUNT(*)::int AS attempts,
             COUNT(*) FILTER (WHERE qa.correct)::int AS correct
      FROM question_attempts qa JOIN questions q ON q.id = qa.question_id
      WHERE qa.user_id = ${userId} AND q.topic_title IS NOT NULL AND qa.created_at >= ${since}
      GROUP BY q.topic_title HAVING COUNT(*) >= 3
      ORDER BY COUNT(*) DESC LIMIT 12`),
    db.execute(sql`
      SELECT COUNT(*)::int AS attempts,
             COALESCE(AVG(CASE WHEN total > 0 THEN score::float / total END), 0) AS avg_score
      FROM quiz_attempts WHERE user_id = ${userId} AND submitted_at IS NOT NULL AND submitted_at >= ${since}`),
    db.execute(sql`
      SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE rating <> 'AGAIN')::int AS remembered
      FROM flashcard_reviews WHERE user_id = ${userId} AND created_at >= ${since}`)
  ]);

  const attempts = first(attemptsRes);
  const totalAttempts = num(attempts.total);
  const correctAttempts = num(attempts.correct);
  const reviewTotal = num(first(reviewsRes).total);
  const remembered = num(first(reviewsRes).remembered);
  const quizCount = num(first(quizRes).attempts);

  const topicRows = (byTopicRes as { rows?: Row[] }).rows ?? (byTopicRes as unknown as Row[]);
  const topicStats: TopicStat[] = (Array.isArray(topicRows) ? topicRows : [])
    .map((r) => {
      const a = num(r.attempts), c = num(r.correct);
      return { topic: String(r.topic ?? ''), attempts: a, correct: c, accuracyPercent: a > 0 ? Math.round((c / a) * 100) : null };
    })
    .sort((a, b) => (a.accuracyPercent ?? 101) - (b.accuracyPercent ?? 101));

  return {
    windowDays,
    studyMinutes: num(first(minutesRes).total),
    questions: {
      attempted: totalAttempts, correct: correctAttempts,
      accuracyPercent: totalAttempts >= 5 ? Math.round((correctAttempts / totalAttempts) * 100) : null,
      sufficientData: totalAttempts >= 5
    },
    quizzes: {
      attempts: quizCount,
      averageScorePercent: quizCount >= 2 ? Math.round(num(first(quizRes).avg_score) * 100) : null,
      sufficientData: quizCount >= 2
    },
    flashcards: {
      reviews: reviewTotal,
      retentionPercent: reviewTotal >= 10 ? Math.round((remembered / reviewTotal) * 100) : null,
      sufficientData: reviewTotal >= 10
    },
    weakest: topicStats.slice(0, 4),
    strongest: [...topicStats].sort((a, b) => (b.accuracyPercent ?? 0) - (a.accuracyPercent ?? 0)).slice(0, 4),
    explainability: 'Accuracy = correct ÷ attempted. Figures are hidden until at least 5 attempts (topics: 3, retention: 10 reviews) so percentages are meaningful.'
  };
}
