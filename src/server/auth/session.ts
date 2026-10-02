import { randomBytes, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { getDb, schema } from '../db';

export const SESSION_COOKIE = 'revise_session';
const TTL_DAYS = 30;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string, meta: { userAgent?: string | null; ip?: string | null }) {
  const token = randomBytes(32).toString('base64url');
  const db = await getDb();
  const expiresAt = new Date(Date.now() + TTL_DAYS * 864e5);
  await db.insert(schema.sessions).values({
    userId, tokenHash: hashToken(token), userAgent: meta.userAgent ?? null, ipHint: meta.ip ?? null, expiresAt
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/', expires: expiresAt
  });
  return { token, expiresAt };
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.update(schema.sessions).set({ revokedAt: new Date() }).where(eq(schema.sessions.tokenHash, hashToken(token)));
  }
  jar.delete(SESSION_COOKIE);
}

export async function revokeAllSessions(userId: string) {
  const db = await getDb();
  await db.update(schema.sessions).set({ revokedAt: new Date() })
    .where(and(eq(schema.sessions.userId, userId), isNull(schema.sessions.revokedAt)));
}

export type SessionUser = {
  id: string; email: string; displayName: string; ageBand: string; country: string;
  examBoardId: string | null; qualificationId: string | null; subjectIds: string[];
  explainLevel: string; defaultModelId: string | null; onboardedAt: Date | null; roles: string[];
};

/** Resolves the caller from the session cookie. Returns null when unauthenticated. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const rows = await db
    .select({
      id: schema.users.id, email: schema.users.email, status: schema.users.status,
      displayName: schema.profiles.displayName, ageBand: schema.profiles.ageBand,
      country: schema.profiles.country, examBoardId: schema.profiles.examBoardId,
      qualificationId: schema.profiles.qualificationId, subjectIds: schema.profiles.subjectIds,
      explainLevel: schema.profiles.explainLevel, defaultModelId: schema.profiles.defaultModelId,
      onboardedAt: schema.profiles.onboardedAt
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .innerJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .where(and(
      eq(schema.sessions.tokenHash, hashToken(token)),
      isNull(schema.sessions.revokedAt),
      gt(schema.sessions.expiresAt, new Date()),
      eq(schema.users.status, 'ACTIVE')
    ))
    .limit(1);
  const u = rows[0];
  if (!u) return null;
  const roles = await db.select({ role: schema.userRoles.role })
    .from(schema.userRoles).where(eq(schema.userRoles.userId, u.id));
  return {
    id: u.id, email: u.email, displayName: u.displayName, ageBand: u.ageBand, country: u.country,
    examBoardId: u.examBoardId, qualificationId: u.qualificationId,
    subjectIds: Array.isArray(u.subjectIds) ? u.subjectIds : [],
    explainLevel: u.explainLevel, defaultModelId: u.defaultModelId, onboardedAt: u.onboardedAt,
    roles: roles.map((r) => r.role)
  };
}

export class AuthError extends Error { code = 'UNAUTHORIZED'; constructor(m = 'You need to sign in.') { super(m); } }
export class ForbiddenError extends Error { code = 'FORBIDDEN'; constructor(m = 'You do not have access to that.') { super(m); } }

export async function requireUser(): Promise<SessionUser> {
  const u = await getCurrentUser();
  if (!u) throw new AuthError();
  return u;
}

export const STAFF_ROLES = ['ADMIN', 'SUPPORT', 'CONTENT_EDITOR', 'ANALYST', 'TEACHER'] as const;

export async function requireRole(...allowed: string[]): Promise<SessionUser> {
  const u = await requireUser();
  if (!u.roles.some((r) => allowed.includes(r))) throw new ForbiddenError();
  return u;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole('ADMIN');
}
