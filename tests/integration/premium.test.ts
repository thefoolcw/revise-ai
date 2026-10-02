import { describe, it, expect, beforeAll } from 'vitest';
import { redeemPremiumKey, keyHash, keyHint, validateKeyFormat } from '../../src/server/premium/redeem';
import { EntitlementService } from '../../src/server/premium/entitlements';
import { getDb, schema } from '../../src/server/db';
import { eq } from 'drizzle-orm';
import { makeUser } from '../helpers';

/**
 * Acceptance Modules 16–18, 21. Uses the DEV mock provider so the full
 * pipeline (validate → provider → atomic claim → entitlement → audit) runs
 * without consuming real keys.
 */

/**
 * Keys are globally unique by design (one key ⇒ at most one entitlement), so
 * every test uses its own key rather than sharing one.
 */
let n = 0;
const unique = (prefix: string) => `${prefix}TEST-${Date.now()}-${++n}`;
const VALID = () => unique('DEV-VALID-');
const INVALID = () => unique('DEV-INVALID-');
const EXPIRED = () => unique('DEV-EXPIRED-');
const REVOKED = () => unique('DEV-REVOKED-');
const TIMEOUT = () => unique('DEV-TIMEOUT-');

async function countEntitlements(userId: string) {
  const db = await getDb();
  const rows = await db.select().from(schema.entitlements).where(eq(schema.entitlements.userId, userId));
  return rows;
}

describe('input validation', () => {
  it('rejects empty, short, overlong and malformed keys before any provider call', () => {
    expect(validateKeyFormat('')).toBeTruthy();
    expect(validateKeyFormat('abc')).toBeTruthy();
    expect(validateKeyFormat('a'.repeat(300))).toBeTruthy();
    expect(validateKeyFormat('bad key with spaces')).toBeTruthy();
    expect(validateKeyFormat('DEV-VALID-KEY-0001')).toBeNull();
  });

  it('never stores the raw key — only a hash and a 4-char hint', () => {
    expect(keyHash('DEV-VALID-KEY-0001')).toMatch(/^[a-f0-9]{64}$/);
    expect(keyHash('DEV-VALID-KEY-0001')).not.toContain('DEV-VALID');
    expect(keyHint('DEV-VALID-KEY-0001')).toBe('…0001');
    expect(keyHint('ab')).toBe('****');
  });
});

describe('key verification states', () => {
  it('grants an ACTIVE entitlement for a valid key', async () => {
    const u = await makeUser();
    const r = await redeemPremiumKey({ userId: u.id, rawKey: VALID() });
    expect(r.state).toBe('VERIFIED');
    expect(r.entitlementId).toBeTruthy();

    const access = await EntitlementService.hasPremium(u.id);
    expect(access.hasPremium).toBe(true);
    if (access.hasPremium) expect(access.source).toBe('PREMIUM_KEY');
  });

  it('grants nothing for an invalid key', async () => {
    const u = await makeUser();
    const r = await redeemPremiumKey({ userId: u.id, rawKey: INVALID() });
    expect(r.state).toBe('INVALID');
    expect(r.entitlementId).toBeUndefined();
    const access = await EntitlementService.hasPremium(u.id);
    expect(access.hasPremium).toBe(false);
    if (!access.hasPremium) expect(access.reason).toBe('NO_PREMIUM_ENTITLEMENT');
  });

  it('grants nothing for an expired key', async () => {
    const u = await makeUser();
    const r = await redeemPremiumKey({ userId: u.id, rawKey: EXPIRED() });
    expect(r.state).toBe('EXPIRED');
    expect((await EntitlementService.hasPremium(u.id)).hasPremium).toBe(false);
  });

  it('grants nothing for a revoked key', async () => {
    const u = await makeUser();
    const r = await redeemPremiumKey({ userId: u.id, rawKey: REVOKED() });
    expect(r.state).toBe('REVOKED');
    expect((await EntitlementService.hasPremium(u.id)).hasPremium).toBe(false);
  });

  it('does not grant Premium when the provider is unreachable, and does not poison the key', async () => {
    const u = await makeUser();
    const timeoutKey = TIMEOUT();
    const r = await redeemPremiumKey({ userId: u.id, rawKey: timeoutKey });
    expect(r.state).toBe('SERVICE_UNAVAILABLE');
    expect(r.retryable).toBe(true);
    expect((await EntitlementService.hasPremium(u.id)).hasPremium).toBe(false);

    // A transient outage must not have written a terminal record for the key.
    const db = await getDb();
    const rows = await db.select().from(schema.keyVerifications).where(eq(schema.keyVerifications.keyHash, keyHash(timeoutKey)));
    expect(rows).toHaveLength(0);
  });

  it('records the verification without ever storing the raw key', async () => {
    const u = await makeUser();
    const key = VALID();
    await redeemPremiumKey({ userId: u.id, rawKey: key });
    const db = await getDb();
    const rows = await db.select().from(schema.keyVerifications).where(eq(schema.keyVerifications.userId, u.id));
    expect(rows.length).toBeGreaterThan(0);
    const dumped = JSON.stringify(rows);
    expect(dumped).not.toContain(key);
    expect(rows[0]!.keyHint).toMatch(/^….{4}$/);
  });
});

describe('replay and idempotency', () => {
  it('returns the same result on a duplicate submission without creating a second entitlement', async () => {
    const u = await makeUser();
    const key = VALID();
    const first = await redeemPremiumKey({ userId: u.id, rawKey: key });
    const second = await redeemPremiumKey({ userId: u.id, rawKey: key });
    expect(first.state).toBe('VERIFIED');
    expect(second.state).toBe('VERIFIED'); // idempotent re-submit by the same user
    expect(second.entitlementId).toBe(first.entitlementId);
    const ents = await countEntitlements(u.id);
    expect(ents).toHaveLength(1);
  });

  it('refuses to let a second user redeem the same key', async () => {
    const a = await makeUser();
    const b = await makeUser();
    const key = VALID();
    const first = await redeemPremiumKey({ userId: a.id, rawKey: key });
    const second = await redeemPremiumKey({ userId: b.id, rawKey: key });
    expect(first.state).toBe('VERIFIED');
    expect(second.state).toBe('ALREADY_USED');
    expect(second.entitlementId).toBeUndefined();
    expect((await EntitlementService.hasPremium(b.id)).hasPremium).toBe(false);
  });

  it('produces exactly one entitlement under concurrent redemption attempts', async () => {
    const u = await makeUser();
    const key = VALID(); // one key, five simultaneous attempts
    const results = await Promise.all(
      Array.from({ length: 5 }, () => redeemPremiumKey({ userId: u.id, rawKey: key }))
    );
    const verified = results.filter((r) => r.state === 'VERIFIED');
    const alreadyUsed = results.filter((r) => r.state === 'ALREADY_USED');
    expect(verified.length).toBeGreaterThanOrEqual(1);
    expect(verified.length + alreadyUsed.length).toBe(5);
    const ents = await countEntitlements(u.id);
    expect(ents.filter((e) => e.status === 'ACTIVE')).toHaveLength(1);
  });

  it('guarantees one verification row per key at the database level', async () => {
    const db = await getDb();
    const u1 = await makeUser();
    const u2 = await makeUser();
    const uniqueKey = `DEV-UNIQUE-${Date.now()}`;
    // Simulate two writers racing to insert the same key hash.
    const insert = (userId: string) => db.insert(schema.keyVerifications).values({
      userId, provider: 'junkie', keyHash: keyHash(uniqueKey), keyHint: keyHint(uniqueKey), state: 'VERIFIED'
    }).onConflictDoNothing({ target: schema.keyVerifications.keyHash }).returning();

    const [a, b] = await Promise.all([insert(u1.id), insert(u2.id)]);
    expect(a.length + b.length).toBe(1); // exactly one winner
  });
});

describe('entitlement persistence and revocation', () => {
  it('persists across a fresh read (simulating a browser refresh)', async () => {
    const u = await makeUser();
    await redeemPremiumKey({ userId: u.id, rawKey: VALID() });
    // New resolver call = what the server does on the next page load.
    const again = await EntitlementService.hasPremium(u.id);
    expect(again.hasPremium).toBe(true);
  });

  it('removes access immediately on revocation and writes an audit event', async () => {
    const u = await makeUser();
    const r = await redeemPremiumKey({ userId: u.id, rawKey: VALID() });
    const admin = await makeUser('admin@example.com', ['ADMIN']);

    const before = await EntitlementService.hasPremium(u.id);
    expect(before.hasPremium).toBe(true);

    await EntitlementService.revokePremium({ entitlementId: r.entitlementId!, actorId: admin.id, reason: 'Refund issued' });

    const after = await EntitlementService.hasPremium(u.id);
    expect(after.hasPremium).toBe(false);

    const db = await getDb();
    const audits = await db.select().from(schema.auditLogs)
      .where(eq(schema.auditLogs.action, 'PREMIUM_ENTITLEMENT_REVOKED'));
    expect(audits.length).toBeGreaterThan(0);
    expect(audits.some((a) => a.reason === 'Refund issued')).toBe(true);
  });

  it('is idempotent when revoking twice', async () => {
    const u = await makeUser();
    const r = await redeemPremiumKey({ userId: u.id, rawKey: VALID() });
    const admin = await makeUser('admin2@example.com', ['ADMIN']);
    const first = await EntitlementService.revokePremium({ entitlementId: r.entitlementId!, actorId: admin.id, reason: 'r1' });
    const second = await EntitlementService.revokePremium({ entitlementId: r.entitlementId!, actorId: admin.id, reason: 'r2' });
    expect(first.alreadyRevoked).toBe(false);
    expect(second.alreadyRevoked).toBe(true);
  });

  it('never exposes one user entitlement to another user', async () => {
    const a = await makeUser();
    const b = await makeUser();
    await redeemPremiumKey({ userId: a.id, rawKey: VALID() });
    expect((await EntitlementService.hasPremium(b.id)).hasPremium).toBe(false);
    const bEnts = await EntitlementService.getUserEntitlements(b.id);
    expect(bEnts).toHaveLength(0);
  });

  it('cannot be granted from client-controlled state — only via the service', async () => {
    const u = await makeUser();
    // There is no code path where a request body sets premium=true.
    const access = await EntitlementService.hasPremium(u.id);
    expect(access.hasPremium).toBe(false);
    const db = await getDb();
    const rows = await db.select().from(schema.users).where(eq(schema.users.id, u.id));
    expect('premium' in rows[0]!).toBe(false); // no premium column exists to flip
  });
});

describe('audit trail', () => {
  it('records a verification audit event for both success and failure', async () => {
    const u = await makeUser();
    const goodKey = VALID(); const badKey = INVALID();
    await redeemPremiumKey({ userId: u.id, rawKey: goodKey });
    await redeemPremiumKey({ userId: u.id, rawKey: badKey });
    const db = await getDb();
    const audits = await db.select().from(schema.auditLogs)
      .where(eq(schema.auditLogs.action, 'PREMIUM_KEY_VERIFICATION'));
    expect(audits.some((a) => a.reason === 'VERIFIED')).toBe(true);
    expect(audits.some((a) => a.reason === 'INVALID')).toBe(true);
    // No audit record may contain a raw key.
    const dumped = JSON.stringify(audits);
    expect(dumped).not.toContain(goodKey);
    expect(dumped).not.toContain(badKey);
  });
});
