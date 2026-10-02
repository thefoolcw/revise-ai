/** Provider-facing key states (§21). */
export type KeyState = 'ISSUED' | 'REDEEMED' | 'EXPIRED' | 'REVOKED' | 'INVALID' | 'ALREADY_USED';

export type KeyVerificationOutcome =
  | { ok: true; state: 'ISSUED'; reference: string; meta: Record<string, unknown> }
  | { ok: false; state: Exclude<KeyState, 'ISSUED'> | 'SERVICE_UNAVAILABLE'; reference?: string; message: string; retryable: boolean };

export interface KeyProvider {
  readonly name: string;
  validateConfig(): { ok: boolean; missing: string[] };
  healthCheck(): Promise<{ ok: boolean; latencyMs: number; detail?: string }>;
  verifyKey(rawKey: string): Promise<KeyVerificationOutcome>;
}

export const USER_FACING_MESSAGE: Record<string, string> = {
  VERIFIED: 'Premium Activated',
  INVALID: 'Invalid Key',
  EXPIRED: 'Key Expired',
  REVOKED: 'This key has been revoked.',
  ALREADY_USED: 'Key Already Used',
  SERVICE_UNAVAILABLE: "We couldn't verify that key right now. Please try again."
};
