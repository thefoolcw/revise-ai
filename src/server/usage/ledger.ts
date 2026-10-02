import { and, eq, gte, sql } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { EntitlementService } from '../premium/entitlements';
import { FREE_LIMITS } from '../premium/product';

export type Metric =
  | 'ai_requests' | 'input_tokens' | 'output_tokens' | 'image_requests'
  | 'document_pages' | 'quiz_generation' | 'flashcard_generation' | 'storage_bytes';

/** Append-only usage record. Token counts come from the provider or are null. */
export async function recordUsage(input: {
  userId: string; metric: Metric; amount?: number;
  modelId?: string | null; feature?: string | null;
  requestId?: string | null; entitlementSource?: string | null;
}) {
  const db = await getDb();
  await db.insert(schema.usageLedger).values({
    userId: input.userId, metric: input.metric, amount: input.amount ?? 1,
    modelId: input.modelId ?? null, feature: input.feature ?? null,
    requestId: input.requestId ?? null, entitlementSource: input.entitlementSource ?? null
  });
}

export async function usageSince(userId: string, since: Date, metric: Metric): Promise<number> {
  const db = await getDb();
  const rows = await db.execute(
    sql`SELECT COALESCE(SUM(amount),0)::int AS total FROM usage_ledger
        WHERE user_id = ${userId} AND metric = ${metric} AND created_at >= ${since}`
  );
  return Number((rows.rows[0] as { total: number } | undefined)?.total ?? 0);
}

function startOfUtcDay(d = new Date()): Date {
  const x = new Date(d); x.setUTCHours(0, 0, 0, 0); return x;
}

export type UsageSnapshot = {
  premium: boolean;
  source: string;
  aiRequests: { used: number; limit: number; remaining: number };
  quizGeneration: { used: number; limit: number; remaining: number };
  flashcardGeneration: { used: number; limit: number; remaining: number };
  documentPages: { used: number; limit: number; remaining: number };
  tokensToday: { input: number | null; output: number | null };
  resetsAt: string;
};

export async function getUsageSnapshot(userId: string): Promise<UsageSnapshot> {
  const access = await EntitlementService.hasPremium(userId);
  const premium = access.hasPremium;
  const limits = premium
    ? (await EntitlementService.limitsFor(userId))
    : FREE_LIMITS;
  const since = startOfUtcDay();

  const [ai, quiz, cards, docs, tokIn, tokOut] = await Promise.all([
    usageSince(userId, since, 'ai_requests'),
    usageSince(userId, since, 'quiz_generation'),
    usageSince(userId, since, 'flashcard_generation'),
    usageSince(userId, since, 'document_pages'),
    usageSince(userId, since, 'input_tokens'),
    usageSince(userId, since, 'output_tokens')
  ]);

  const resets = new Date(since); resets.setUTCDate(resets.getUTCDate() + 1);

  return {
    premium,
    source: premium ? (access as { source: string }).source : 'FREE',
    aiRequests: { used: ai, limit: limits.aiRequestsPerDay, remaining: Math.max(0, limits.aiRequestsPerDay - ai) },
    quizGeneration: { used: quiz, limit: limits.quizGenerationsPerDay, remaining: Math.max(0, limits.quizGenerationsPerDay - quiz) },
    flashcardGeneration: { used: cards, limit: limits.flashcardGenerationsPerDay, remaining: Math.max(0, limits.flashcardGenerationsPerDay - cards) },
    documentPages: { used: docs, limit: limits.documentPagesPerDay, remaining: Math.max(0, limits.documentPagesPerDay - docs) },
    tokensToday: { input: tokIn || null, output: tokOut || null },
    resetsAt: resets.toISOString()
  };
}

export type LimitCheck =
  | { allowed: true; snapshot: UsageSnapshot }
  | { allowed: false; reason: 'USAGE_LIMIT'; metric: string; snapshot: UsageSnapshot; message: string };

/** Checked BEFORE the expensive call (§26, §41). */
export async function checkLimit(userId: string, metric: 'ai_requests' | 'quiz_generation' | 'flashcard_generation' | 'document_pages'): Promise<LimitCheck> {
  const snapshot = await getUsageSnapshot(userId);
  const bucket =
    metric === 'ai_requests' ? snapshot.aiRequests
    : metric === 'quiz_generation' ? snapshot.quizGeneration
    : metric === 'flashcard_generation' ? snapshot.flashcardGeneration
    : snapshot.documentPages;

  if (bucket.remaining <= 0) {
    const label = metric.replace('_', ' ');
    return {
      allowed: false, reason: 'USAGE_LIMIT', metric, snapshot,
      message: snapshot.premium
        ? `You have reached today's ${label} limit. It resets at midnight UTC.`
        : `You have used today's free ${label} allowance. Premium raises this limit.`
    };
  }
  return { allowed: true, snapshot };
}
