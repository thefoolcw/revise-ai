import { and, eq, desc, isNull, or, gt, lte } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { getPremiumProduct, FREE_LIMITS } from './product';
import { audit } from '../audit';

export type EntitlementSource = 'PREMIUM_KEY' | 'ADMIN_GRANT' | 'PROMOTIONAL_ENTITLEMENT';
export type EntitlementStatus = 'PENDING' | 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export type DenialReason =
  | 'NO_PREMIUM_ENTITLEMENT' | 'USAGE_LIMIT' | 'MODEL_NOT_INCLUDED'
  | 'EXPIRED_ENTITLEMENT' | 'ACCOUNT_RESTRICTED' | 'SERVICE_UNAVAILABLE';

export type AccessState =
  | { hasPremium: true; source: EntitlementSource; entitlementId: string; expiresAt: Date | null }
  | { hasPremium: false; reason: DenialReason };

export const EntitlementService = {
  async getUserEntitlements(userId: string) {
    const db = await getDb();
    return db.select().from(schema.entitlements)
      .where(eq(schema.entitlements.userId, userId))
      .orderBy(desc(schema.entitlements.grantedAt));
  },

  /**
   * The only authority on "does this user have Premium right now?".
   * Always derived from server-side rows; never from client state.
   */
  async hasPremium(userId: string): Promise<AccessState> {
    const db = await getDb();
    const rows = await db.select().from(schema.entitlements)
      .where(and(eq(schema.entitlements.userId, userId), eq(schema.entitlements.status, 'ACTIVE')))
      .orderBy(desc(schema.entitlements.grantedAt));

    const now = new Date();
    const live = rows.find((r) => !r.expiresAt || new Date(r.expiresAt) > now);
    if (live) {
      return {
        hasPremium: true,
        source: live.source as EntitlementSource,
        entitlementId: live.id,
        expiresAt: live.expiresAt ? new Date(live.expiresAt) : null
      };
    }
    // An ACTIVE row that has passed its expiry is treated as expired, not absent.
    const expired = rows.find((r) => r.expiresAt && new Date(r.expiresAt) <= now);
    return { hasPremium: false, reason: expired ? 'EXPIRED_ENTITLEMENT' : 'NO_PREMIUM_ENTITLEMENT' };
  },

  /**
   * Grants Premium. Idempotent per keyVerificationId: a second call for the
   * same verification returns the existing entitlement instead of creating
   * another one.
   */
  async grantPremium(input: {
    userId: string;
    source: EntitlementSource;
    keyVerificationId?: string;
    providerEventId?: string;
    expiresAt?: Date | null;
    createdBy?: string | null;
    metadata?: Record<string, unknown>;
    actorId?: string | null;
    reason?: string | null;
  }) {
    const db = await getDb();
    const product = getPremiumProduct();

    if (input.keyVerificationId) {
      const existing = await db.select().from(schema.entitlements)
        .where(eq(schema.entitlements.keyVerificationId, input.keyVerificationId)).limit(1);
      if (existing[0]) return { entitlement: existing[0], created: false };
    }

    const [entitlement] = await db.insert(schema.entitlements).values({
      userId: input.userId,
      productSlug: product.slug,
      source: input.source,
      status: 'ACTIVE',
      startsAt: new Date(),
      expiresAt: input.expiresAt ?? null,
      keyVerificationId: input.keyVerificationId ?? null,
      providerEventId: input.providerEventId ?? null,
      createdBy: input.createdBy ?? null,
      metadata: input.metadata ?? {}
    }).returning();

    await audit({
      actorId: input.actorId ?? input.userId,
      action: 'PREMIUM_ENTITLEMENT_GRANTED',
      target: entitlement!.id,
      reason: input.reason ?? null,
      metadata: { userId: input.userId, source: input.source, productSlug: product.slug, providerEventId: input.providerEventId ?? null }
    });
    return { entitlement: entitlement!, created: true };
  },

  async revokePremium(input: { entitlementId: string; actorId: string; reason: string }) {
    const db = await getDb();
    const [row] = await db.select().from(schema.entitlements).where(eq(schema.entitlements.id, input.entitlementId)).limit(1);
    if (!row) { const e = new Error('Entitlement not found.'); (e as Error & { code: string }).code = 'NOT_FOUND'; throw e; }
    if (row.status === 'REVOKED') return { entitlement: row, alreadyRevoked: true };

    const [updated] = await db.update(schema.entitlements)
      .set({ status: 'REVOKED', revokedAt: new Date(), revokeReason: input.reason, updatedAt: new Date() })
      .where(and(eq(schema.entitlements.id, input.entitlementId), eq(schema.entitlements.status, row.status)))
      .returning();
    if (!updated) { const e = new Error('Entitlement changed concurrently.'); (e as Error & { code: string }).code = 'CONFLICT'; throw e; }

    await audit({
      actorId: input.actorId, action: 'PREMIUM_ENTITLEMENT_REVOKED', target: row.id,
      reason: input.reason, metadata: { userId: row.userId, previousStatus: row.status }
    });
    return { entitlement: updated, alreadyRevoked: false };
  },

  async auditPremiumChange(input: { actorId: string; action: 'ENTITLEMENT_MANUAL_GRANT' | 'PREMIUM_ENTITLEMENT_REVOKED'; target: string; reason: string; metadata?: Record<string, unknown> }) {
    await audit({ actorId: input.actorId, action: input.action, target: input.target, reason: input.reason, metadata: input.metadata });
  },

  async limitsFor(userId: string) {
    const access = await this.hasPremium(userId);
    return access.hasPremium ? getPremiumProduct().limits : FREE_LIMITS;
  }
};
