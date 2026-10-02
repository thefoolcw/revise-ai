import { handler, needUser } from '@/server/api/route';
import { destroySession, revokeAllSessions } from '@/server/auth/session';
import { audit } from '@/server/audit';

/** Revokes every session on every device, then clears this browser's cookie. */
export const POST = handler(async (ctx) => {
  const u = needUser(ctx);
  await revokeAllSessions(u.id);
  await audit({ actorId: u.id, action: 'SESSION_REVOKED', target: u.id, ipHint: ctx.ip, metadata: { scope: 'ALL' } });
  await destroySession();
  return { revokedAll: true };
});
