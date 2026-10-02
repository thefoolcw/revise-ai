import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/** Canonical success envelope (§44). */
export function ok<T>(data: T, requestId: string, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data, requestId }, { status: 200, ...init });
}

/** Canonical error envelope. NEVER includes stacks, tokens or provider payloads. */
export function fail(
  code: string,
  message: string,
  requestId: string,
  status = 400,
  extra?: { retryable?: boolean; fieldErrors?: Record<string, string> }
) {
  return NextResponse.json(
    {
      ok: false,
      requestId,
      error: { code, message, retryable: extra?.retryable ?? false, ...(extra?.fieldErrors ? { fieldErrors: extra.fieldErrors } : {}) }
    },
    { status }
  );
}

export function newRequestId(): string {
  return crypto.randomUUID();
}

/** Maps any thrown value to a safe envelope. Secrets are stripped defensively. */
export function toErrorResponse(e: unknown, requestId: string) {
  if (e instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const i of e.issues) fieldErrors[i.path.join('.') || 'body'] = i.message;
    return fail('VALIDATION_ERROR', 'Some fields need attention.', requestId, 422, { fieldErrors });
  }
  const code = (e as { code?: string })?.code;
  const msg = e instanceof Error ? e.message : 'Unexpected error.';
  if (code && /^[A-Z_]+$/.test(code) && !/secret|token|password|key/i.test(msg)) {
    return fail(code, msg, requestId, statusForCode(code));
  }
  console.error(`[${requestId}] unhandled error:`, redact(msg));
  return fail('INTERNAL_ERROR', 'Something went wrong on our side. Please try again.', requestId, 500, { retryable: true });
}

export function statusForCode(code: string): number {
  switch (code) {
    case 'UNAUTHORIZED': return 401;
    case 'FORBIDDEN': return 403;
    case 'NOT_FOUND': return 404;
    case 'RATE_LIMIT': return 429;
    case 'VALIDATION_ERROR': return 422;
    case 'USAGE_LIMIT': return 402;
    default: return 502;
  }
}

/** Redacts anything that looks like a credential before it reaches a log. */
export function redact(s: string): string {
  return s
    .replace(/(nvapi-)[A-Za-z0-9_\-]{6,}/g, '$1[REDACTED]')
    .replace(/(Bearer\s+)[A-Za-z0-9._\-]{8,}/gi, '$1[REDACTED]')
    .replace(/([A-Za-z0-9_\-]{4,}-){3,}[A-Za-z0-9_\-]{4,}/g, '[REDACTED-UUID-LIKE]')
    .replace(/(api[_-]?key["']?\s*[:=]\s*["']?)[^\s"',}]+/gi, '$1[REDACTED]');
}
