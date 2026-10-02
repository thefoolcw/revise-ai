import { handler, needUser } from '@/server/api/route';
import { getUsageSnapshot } from '@/server/usage/ledger';
export const GET = handler(async (ctx) => getUsageSnapshot(needUser(ctx).id));
