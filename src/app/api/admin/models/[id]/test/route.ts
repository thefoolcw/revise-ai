import { handler, needRole } from '@/server/api/route';
import { probeModel } from '@/server/ai/registry';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handler(async (ctx) => {
    needRole(ctx, 'ADMIN', 'CONTENT_EDITOR');
    return probeModel(decodeURIComponent(id));
  })(req as any);
}
