import { createHash } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { getKeyProvider } from './provider';
import { EntitlementService } from './entitlements';
import { audit } from '../audit';
import { redact } from '../api/respond';

export type RedeemResultState =
  | 'VERIFIED' | 'INVALID' | 'EXPIRED' | 'REVOKED' | 'ALREADY_USED' | 'SERVICE_UNAVAILABLE' | 'VALIDATION_ERROR';

export type RedeemResult = {
  state: RedeemResultState;
  message: string;
  retryable: boolean;
  entitlementId?: string;
  verificationId?: string;
  /** Safe: last 4 characters only. The raw key is never returned or logged. */
  keyHint?: string;
};

export function keyHash(rawKey: string): string {
  return createHash('sha256').update(rawKey.trim()).digest('hex');
}

/** Stable signed int32 derived from a hash, for use as an advisory-lock key. */
export function lockKeyFor(hash: string): number {
  const n = parseInt(hash.slice(0, 8), 16);
  return n > 0x7fffffff ? n - 0x100000000 : n;
}
export function keyHint(rawKey: string): string {
  const t = rawKey.trim();
  return t.length <= 4 ? '****' : `…${t.slice(-4)}`;
}

/** Input shape check only — real validation is the provider's job. */
export function validateKeyFormat(raw: string): string | null {
  const k = (raw ?? '').trim();
  if (!k) return 'Enter your Premium key.';
  if (k.length < 8) return 'That key looks too short.';
  if (k.length > 256) return 'That key looks too long.';
  if (!/^[A-Za-z0-9\-_.:]+$/.test(k)) return 'Keys contain only letters, numbers, hyphens and underscores.';
  return null;
}

/**
 * Redeems a Premium key.
 *
 * Concurrency guarantee: `key_verifications.key_hash` carries a UNIQUE index,
 * and the row is inserted with `ON CONFLICT DO NOTHING ... RETURNING`. Exactly
 * one of N simultaneous requests can obtain a returned row, so exactly one can
 * go on to grant an entitlement. A transaction-level advisory lock serialises
 * attempts on the same key as a second line of defence.
 */
export async function redeemPremiumKey(input: {
  userId: string;
  rawKey: string;
  ipHint?: string | null;
}): Promise<RedeemResult> {
  const raw = (input.rawKey ?? '').trim();
  const hint = keyHint(raw);

  const formatError = validateKeyFormat(raw);
  if (formatError) return { state: 'VALIDATION_ERROR', message: formatError, retryable: false };

  const hash = keyHash(raw);
  const db = await getDb();

  // Fast path: this key has already been processed. Replay is refused.
  const [prior] = await db.select().from(schema.keyVerifications).where(eq(schema.keyVerifications.keyHash, hash)).limit(1);
  if (prior) {
    if (prior.state === 'VERIFIED' && prior.userId === input.userId && prior.grantedEntitlementId) {
      // Same user resubmitting their own key → idempotent success, no new entitlement.
      const [ent] = await db.select().from(schema.entitlements).where(eq(schema.entitlements.id, prior.grantedEntitlementId)).limit(1);
      if (ent && ent.status === 'ACTIVE') {
        return { state: 'VERIFIED', message: 'Premium Activated', retryable: false, entitlementId: ent.id, verificationId: prior.id, keyHint: hint };
      }
      return { state: 'ALREADY_USED', message: 'This key has already been redeemed on your account.', retryable: false, verificationId: prior.id, keyHint: hint };
    }
    if (prior.state === 'VERIFIED') {
      return { state: 'ALREADY_USED', message: 'This key has already been used.', retryable: false, verificationId: prior.id, keyHint: hint };
    }
    // Terminal negative states are cached; transient ones are allowed to retry.
    if (prior.state !== 'SERVICE_UNAVAILABLE') {
      return {
        state: prior.state as RedeemResultState,
        message: messageFor(prior.state),
        retryable: false, verificationId: prior.id, keyHint: hint
      };
    }
  }

  const provider = getKeyProvider();
  const started = Date.now();
  const outcome = await provider.verifyKey(raw);
  const latencyMs = Date.now() - started;

  // ── Provider says no ──────────────────────────────────────────────
  if (!outcome.ok) {
    const state: RedeemResultState =
      outcome.state === 'SERVICE_UNAVAILABLE' ? 'SERVICE_UNAVAILABLE'
      : outcome.state === 'ALREADY_USED' ? 'ALREADY_USED'
      : outcome.state === 'REDEEMED' ? 'ALREADY_USED'
      : (outcome.state as RedeemResultState);

    // Only persist definitive provider answers. A transient outage must not
    // poison the key, so it is audited but not written to the unique index.
    if (state !== 'SERVICE_UNAVAILABLE') {
      await recordVerification({
        userId: input.userId, hash, hint, state,
        providerStatus: null, reference: outcome.reference ?? null,
        meta: {}, latencyMs
      }).catch((e) => console.error('[redeem] could not record verification:', redact(String(e))));
    }
    await audit({
      actorId: input.userId, action: 'PREMIUM_KEY_VERIFICATION', target: hint,
      reason: state, metadata: { outcome: state, latencyMs, retryable: outcome.retryable }
    });
    return { state, message: messageFor(state), retryable: outcome.retryable, keyHint: hint };
  }

  // ── Provider says valid: claim the key atomically ─────────────────
  const claimed = await db.transaction(async (tx) => {
    // Serialise concurrent attempts on this exact key. The lock key is derived
    // in JS as a plain int32 — pg_advisory_xact_lock(bigint) returns a value
    // some drivers cannot serialise, so we avoid it deliberately.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${lockKeyFor(hash)})`);

    const inserted = await tx.insert(schema.keyVerifications).values({
      userId: input.userId, provider: provider.name, keyHash: hash, keyHint: hint,
      state: 'VERIFIED', providerReference: outcome.reference, providerMeta: outcome.meta, latencyMs
    }).onConflictDoNothing({ target: schema.keyVerifications.keyHash }).returning();

    // No row returned ⇒ another request already claimed this key.
    if (inserted.length === 0) return { won: false as const };
    return { won: true as const, verification: inserted[0]! };
  });

  if (!claimed.won) {
    await audit({
      actorId: input.userId, action: 'PREMIUM_KEY_VERIFICATION', target: hint,
      reason: 'ALREADY_USED', metadata: { outcome: 'ALREADY_USED', race: true, latencyMs }
    });
    return { state: 'ALREADY_USED', message: 'This key has already been used.', retryable: false, keyHint: hint };
  }

  const verification = claimed.verification;

  const { entitlement, created } = await EntitlementService.grantPremium({
    userId: input.userId,
    source: 'PREMIUM_KEY',
    keyVerificationId: verification.id,
    providerEventId: outcome.reference,
    metadata: { provider: provider.name, keyHint: hint, providerMeta: outcome.meta }
  });

  if (created) {
    const db2 = await getDb();
    await db2.update(schema.keyVerifications)
      .set({ grantedEntitlementId: entitlement.id })
      .where(eq(schema.keyVerifications.id, verification.id));
  }

  await audit({
    actorId: input.userId, action: 'PREMIUM_KEY_VERIFICATION', target: hint,
    reason: 'VERIFIED', metadata: { outcome: 'VERIFIED', latencyMs, idempotentReplay: !created }
  });

  return {
    state: 'VERIFIED', message: 'Premium Activated', retryable: false,
    entitlementId: entitlement.id, verificationId: verification.id, keyHint: hint
  };
}

async function recordVerification(v: {
  userId: string; hash: string; hint: string; state: RedeemResultState;
  providerStatus: number | null; reference: string | null; meta: Record<string, unknown>; latencyMs: number;
}) {
  const db = await getDb();
  await db.insert(schema.keyVerifications).values({
    userId: v.userId, provider: 'junkie', keyHash: v.hash, keyHint: v.hint, state: v.state,
    providerStatus: v.providerStatus, providerReference: v.reference, providerMeta: v.meta, latencyMs: v.latencyMs
  }).onConflictDoNothing({ target: schema.keyVerifications.keyHash });
}

function messageFor(state: string): string {
  switch (state) {
    case 'VERIFIED': return 'Premium Activated';
    case 'INVALID': return 'That key was not recognised.';
    case 'EXPIRED': return 'This key has expired.';
    case 'REVOKED': return 'This key has been revoked.';
    case 'ALREADY_USED': return 'This key has already been used.';
    case 'SERVICE_UNAVAILABLE': return "We couldn't verify that key right now. Please try again.";
    default: return 'Verification failed.';
  }
}
