import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (pw: string | Buffer, salt: string | Buffer, keylen: number, options?: { N?: number; r?: number; p?: number; maxmem?: number }) => Promise<Buffer>;

const KEYLEN = 64;
const PARAMS = { N: 16384, r: 8, p: 1 } as const;

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(plain, salt, KEYLEN, PARAMS);
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString('base64')}$${derived.toString('base64')}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, N, r, p, saltB64, hashB64] = parts as [string, string, string, string, string, string];
  try {
    const salt = Buffer.from(saltB64!, 'base64');
    const expected = Buffer.from(hashB64!, 'base64');
    const derived = await scryptAsync(plain, salt, expected.length, { N: Number(N), r: Number(r), p: Number(p) });
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Password policy — NIST-aligned: length over composition, no trivial passwords.
 * Returns a reason string or null when acceptable.
 */
export function passwordIssue(pw: string): string | null {
  if (pw.length < 10) return 'Use at least 10 characters.';
  if (pw.length > 200) return 'That password is too long.';
  if (/^(.)\1+$/.test(pw)) return 'Use a less repetitive password.';
  const trivial = ['password', 'password1', '12345678', 'qwertyui', 'reviseai', 'letmein1', 'iloveyou'];
  if (trivial.includes(pw.toLowerCase())) return 'That password is too common.';
  return null;
}
