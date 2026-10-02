/** Typed client for the API envelope (§44). Keeps error handling consistent. */
export type ApiError = { code: string; message: string; retryable: boolean; fieldErrors?: Record<string, string> };
export class ApiRequestError extends Error {
  code: string; retryable: boolean; fieldErrors?: Record<string, string>; status: number;
  constructor(status: number, err: ApiError) {
    super(err.message);
    this.code = err.code; this.retryable = err.retryable; this.fieldErrors = err.fieldErrors; this.status = status;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers ?? {}) },
    credentials: 'same-origin'
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    const err = json?.error ?? { code: 'NETWORK_ERROR', message: 'We could not reach the server.', retryable: true };
    throw new ApiRequestError(res.status, err);
  }
  return json.data as T;
}

export const get = <T,>(p: string) => api<T>(p);
export const post = <T,>(p: string, body?: unknown) => api<T>(p, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
export const patch = <T,>(p: string, body?: unknown) => api<T>(p, { method: 'PATCH', body: JSON.stringify(body) });
export const del = <T,>(p: string) => api<T>(p, { method: 'DELETE' });
