import { handler } from '@/server/api/route';
import { destroySession } from '@/server/auth/session';
export const POST = handler(async () => { await destroySession(); return { loggedOut: true }; });
