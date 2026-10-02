import { NextRequest } from 'next/server';
import { ZodSchema } from 'zod';
import { ok, fail, newRequestId, toErrorResponse } from './respond';
import { requireUser, requireRole, getCurrentUser, type SessionUser } from '../auth/session';
import { checkRateLimit, LIMITS } from '../ratelimit';

export type Ctx = { req: NextRequest; requestId: string; user: SessionUser | null; ip: string | null };

export function clientIp(req: NextRequest): string | null {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0]!.trim();
  return req.headers.get('x-real-ip');
}

/** Wraps a handler with the response envelope, request id and error mapping. */
export function handler<T>(fn: (ctx: Ctx, body: unknown) => Promise<T>) {
  return async (req: NextRequest) => {
    const requestId = newRequestId();
    try {
      const user = await getCurrentUser();
      const body = await readBody(req);
      const result = await fn({ req, requestId, user, ip: clientIp(req) }, body);
      if (result instanceof Response) return result;
      return ok(result, requestId);
    } catch (e) {
      return toErrorResponse(e, requestId);
    }
  };
}

async function readBody(req: NextRequest): Promise<unknown> {
  if (req.method === 'GET' || req.method === 'HEAD') return null;
  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('multipart/form-data')) {
    const fd = await req.formData();
    return Object.fromEntries(fd.entries());
  }
  if (!ct.includes('application/json')) {
    if (ct) { const e = new Error('Expected application/json.'); (e as any).code = 'VALIDATION_ERROR'; throw e; }
    return null;
  }
  const text = await req.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch {
    const e = new Error('Body was not valid JSON.'); (e as any).code = 'VALIDATION_ERROR'; throw e;
  }
}

export function parse<T>(schema: ZodSchema<T>, body: unknown): T {
  return schema.parse(body ?? {});
}

export function needUser(ctx: Ctx): SessionUser {
  if (!ctx.user) { const e = new Error('You need to sign in.'); (e as any).code = 'UNAUTHORIZED'; throw e; }
  return ctx.user;
}

export function needRole(ctx: Ctx, ...roles: string[]): SessionUser {
  const u = needUser(ctx);
  if (!u.roles.some((r) => roles.includes(r))) { const e = new Error('You do not have access to that.'); (e as any).code = 'FORBIDDEN'; throw e; }
  return u;
}

export async function throttle(route: keyof typeof LIMITS, identity: string, ip: string | null) {
  const r = await checkRateLimit(route, identity, ip);
  if (!r.allowed) {
    const e = new Error(`Too many attempts. Please wait ${r.retryAfterSeconds}s and try again.`);
    (e as any).code = 'RATE_LIMIT';
    throw e;
  }
  return r;
}
