import { getYearMeta } from '@/server/curriculum/types';
import { getSubjectAvailability } from '@/server/curriculum/availability';
import { assertPublishedSelection } from '@/server/curriculum/selection';
import { curriculumProfileUpdate } from '@/server/curriculum/profile';
import { z } from 'zod';
import { eq, like } from 'drizzle-orm';
import { handler, parse, needUser } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { EntitlementService } from '@/server/premium/entitlements';
import { getUsageSnapshot } from '@/server/usage/ledger';
import { getPremiumProduct } from '@/server/premium/product';
import { destroySession, revokeAllSessions } from '@/server/auth/session';
import { audit } from '@/server/audit';

export const GET = handler(async (ctx) => {
  const u = needUser(ctx);
  const db = await getDb();
  const [profile] = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, u.id)).limit(1);
  const access = await EntitlementService.hasPremium(u.id);
  const usage = await getUsageSnapshot(u.id);
  const product = getPremiumProduct();
  return {
    user: {
      id: u.id, email: u.email, displayName: u.displayName, roles: u.roles,
      ageBand: u.ageBand, educationStage: u.educationStage, yearGroup: u.yearGroup,
      country: u.country, explainLevel: u.explainLevel,
      examBoardId: u.examBoardId, qualificationId: u.qualificationId, subjectIds: u.subjectIds,
      onboarded: !!u.onboardedAt
    },
    profile,
    premium: {
      active: access.hasPremium,
      source: access.hasPremium ? (access as any).source : null,
      expiresAt: access.hasPremium ? (access as any).expiresAt : null,
      denialReason: access.hasPremium ? null : (access as any).reason
    },
    usage,
    product: {
      slug: product.slug, displayPrice: product.displayPrice, priceMinor: product.priceMinor,
      currency: product.currency, features: product.features,
      discord: product.discord
    }
  };
});

const Patch = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  ageBand: z.enum(['EARLY_YEARS', 'PRIMARY', 'SECONDARY', 'POST_16', 'UNIVERSITY', 'ADULT_LEARNER']).optional(),
  educationStage: z.string().max(40).nullable().optional(),
  yearGroup: z.string().max(40).nullable().optional(),
  country: z.string().length(2).optional(),
  timezone: z.string().max(64).optional(),
  examBoardId: z.string().max(40).nullable().optional(),
  qualificationId: z.string().max(40).nullable().optional(),
  subjectIds: z.array(z.string().max(40)).max(35).optional(),
  goals: z.array(z.string().max(40)).max(10).optional(),
  targetExamDate: z.string().datetime().nullable().optional(),
  explainLevel: z.enum(['SIMPLE', 'STANDARD', 'DETAILED', 'UNIVERSITY']).optional(),
  defaultModelId: z.string().max(160).nullable().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  reducedMotion: z.boolean().optional(),
  completeOnboarding: z.boolean().optional()
});

export const PATCH = handler(async (ctx, body) => {
  const u = needUser(ctx);
  const patch = parse(Patch, body);
  const db = await getDb();
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.displayName !== undefined) update.displayName = patch.displayName;
  if (patch.ageBand !== undefined) update.ageBand = patch.ageBand;
  if (patch.educationStage !== undefined) update.educationStage = patch.educationStage;
  if (patch.yearGroup !== undefined) update.yearGroup = patch.yearGroup;
  if (patch.country !== undefined) update.country = patch.country;
  if (patch.timezone !== undefined) update.timezone = patch.timezone;
  if (patch.examBoardId !== undefined) update.examBoardId = patch.examBoardId;
  if (patch.qualificationId !== undefined) update.qualificationId = patch.qualificationId;
  if (patch.subjectIds !== undefined) update.subjectIds = patch.subjectIds;
  if (patch.goals !== undefined) update.goals = patch.goals;
  if (patch.targetExamDate !== undefined) update.targetExamDate = patch.targetExamDate ? new Date(patch.targetExamDate) : null;
  if (patch.explainLevel !== undefined) update.explainLevel = patch.explainLevel;
  if (patch.defaultModelId !== undefined) update.defaultModelId = patch.defaultModelId;
  if (patch.theme !== undefined) update.theme = patch.theme;
  if (patch.reducedMotion !== undefined) update.reducedMotion = patch.reducedMotion;
  const curriculumUpdate = curriculumProfileUpdate(u, patch);
  if (curriculumUpdate.yearGroup && (patch.subjectIds !== undefined || patch.yearGroup !== undefined || patch.completeOnboarding)) {
    assertPublishedSelection(u, curriculumUpdate.yearGroup, curriculumUpdate.subjectIds ?? [], await getSubjectAvailability(), !!patch.completeOnboarding);
  }
  Object.assign(update, curriculumUpdate);
  const year = getYearMeta(curriculumUpdate.yearGroup ?? u.yearGroup);
  if (patch.qualificationId || (patch.yearGroup && patch.yearGroup !== u.yearGroup && patch.qualificationId === undefined)) {
    const qualificationId = patch.qualificationId || year?.defaultQualificationId;
    const [qualification] = qualificationId ? await db.select().from(schema.qualifications)
      .where(eq(schema.qualifications.id, qualificationId)).limit(1) : [];
    if (!year || !qualification || qualification.level !== year.ageBand) {
      throw new z.ZodError([{ code: 'custom', path: ['qualificationId'], message: 'Choose a qualification for your selected education stage and year.' }]);
    }
    update.qualificationId = qualification.id;
    // Do not carry an incompatible board into a new pathway.
    const board = patch.examBoardId !== undefined ? patch.examBoardId : u.examBoardId;
    if (board && !qualification.boards.includes(board)) update.examBoardId = null;
  }
  if (patch.completeOnboarding) {
    update.onboardedAt = new Date();
  }

  await db.update(schema.profiles).set(update).where(eq(schema.profiles.userId, u.id));
  return { updated: true };
});

/**
 * Account deletion. Cascades from the `users` row remove the learner's content;
 * we additionally revoke sessions, cancel queued jobs and wipe the rate-limit
 * window so the action is complete and immediate.
 */
export const DELETE = handler(async (ctx) => {
  const u = needUser(ctx);
  const db = await getDb();
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, u.id));
  // `jobs` is not user-scoped; the rate-limit bucket is keyed `route:identity`.
  await db.delete(schema.rateLimits).where(like(schema.rateLimits.bucket, `%:${u.id}`));
  await db.delete(schema.users).where(eq(schema.users.id, u.id));
  await audit({ actorId: u.id, action: 'ACCOUNT_DELETED', target: u.id, ipHint: ctx.ip });
  await destroySession();
  return { deleted: true };
});
