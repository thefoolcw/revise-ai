import { z } from 'zod';
import { eq, desc, and } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { parse, throttle, clientIp } from '@/server/api/route';
import { ok, fail, newRequestId, toErrorResponse } from '@/server/api/respond';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';
import { streamText } from '@/server/ai/gateway';
import { composeMessages, promptVersion } from '@/server/ai/prompts';
import { checkLimit, recordUsage } from '@/server/usage/ledger';
import { redact } from '@/server/api/respond';

const Body = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(1, 'Ask a question first.').max(20000),
  mode: z.enum([
    'EXPLAIN', 'TEACH_FROM_BASICS', 'STEP_BY_STEP', 'HINT', 'PRACTICE', 'CHECK', 'MARK',
    'MAKE_FLASHCARDS', 'CREATE_QUIZ', 'SUMMARISE', 'COMPARE', 'MEMORISE', 'EXAM_MODE',
    'CODING_HELP', 'PROBLEM_SOLVING', 'REVISION_PLAN'
  ]).default('EXPLAIN'),
  modelId: z.string().max(160).optional(),
  subjectId: z.string().max(40).optional(),
  topicId: z.string().max(60).optional(),
  topicTitle: z.string().max(160).optional()
});

/** All sixteen tutor modes, mapped onto a task for routing and a prompt key for tone. */
const MODE_TASK: Record<string, { task: string; key: string }> = {
  EXPLAIN:            { task: 'CHAT',    key: 'explain' },
  TEACH_FROM_BASICS:  { task: 'CHAT',    key: 'teach' },
  STEP_BY_STEP:       { task: 'SOLVE_MATHS', key: 'step_by_step' },
  HINT:               { task: 'CHAT',    key: 'hint' },
  PRACTICE:           { task: 'CHAT',    key: 'practice' },
  CHECK:              { task: 'CHAT',    key: 'check' },
  MARK:               { task: 'ESSAY_FEEDBACK', key: 'mark' },
  MAKE_FLASHCARDS:    { task: 'CHAT',    key: 'make_flashcards' },
  CREATE_QUIZ:        { task: 'CHAT',    key: 'create_quiz_text' },
  SUMMARISE:          { task: 'LONG_CONTEXT', key: 'summarise' },
  COMPARE:            { task: 'CHAT',    key: 'compare' },
  MEMORISE:           { task: 'CHAT',    key: 'memorise' },
  EXAM_MODE:          { task: 'CHAT',    key: 'exam_mode' },
  CODING_HELP:        { task: 'CODE',    key: 'code' },
  PROBLEM_SOLVING:    { task: 'SOLVE_MATHS', key: 'problem_solving' },
  REVISION_PLAN:      { task: 'CHAT',    key: 'revision_plan' }
};

export async function POST(req: NextRequest) {
  const requestId = newRequestId();
  try {
    const user = await getCurrentUser();
    if (!user) return fail('UNAUTHORIZED', 'You need to sign in.', requestId, 401);

    const limit = await checkLimit(user.id, 'ai_requests');
    if (!limit.allowed) return fail('USAGE_LIMIT', limit.message, requestId, 402, { retryable: false });

    await throttle('aiChat', user.id, clientIp(req));
    const body = parse(Body, await req.json());
    const db = await getDb();

    // Conversation context (bounded window — never the whole history, §87).
    let conversationId = body.conversationId;
    if (!conversationId) {
      const [conv] = await db.insert(schema.aiConversations).values({
        userId: user.id, mode: body.mode,
        title: body.message.slice(0, 70) + (body.message.length > 70 ? '…' : ''),
        subjectId: body.subjectId ?? null, topicId: body.topicId ?? null,
        examBoardId: user.examBoardId, qualificationId: user.qualificationId
      }).returning();
      conversationId = conv!.id;
    }

    const history = await db.select({ role: schema.aiMessages.role, content: schema.aiMessages.content })
      .from(schema.aiMessages)
      .where(eq(schema.aiMessages.conversationId, conversationId))
      .orderBy(desc(schema.aiMessages.createdAt)).limit(8);
    const window = history.reverse().map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const map = MODE_TASK[body.mode ?? 'EXPLAIN'] ?? MODE_TASK['EXPLAIN']!;
    const [systemMsg] = composeMessages(
      { task: map.key, context: { subject: body.subjectId ?? undefined, topic: body.topicTitle ?? undefined, explainLevel: user.explainLevel, qualification: user.qualificationId ?? undefined, examBoard: user.examBoardId ?? undefined } },
      ''
    );
    const messages = [systemMsg!, ...window, { role: 'user' as const, content: body.message }];

    await db.insert(schema.aiMessages).values({ conversationId, role: 'user', content: body.message });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) =>
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

        send('start', { requestId, conversationId });

        const result = await streamText(
          {
            userId: user.id, feature: 'TUTOR', task: map.task as any, messages,
            requestedModelId: body.modelId ?? user.defaultModelId ?? null,
            promptVersion: promptVersion('tutor'), maxTokens: 1400
          },
          (chunk) => send('delta', { text: chunk }),
          (meta) => send('model', meta)
        );

        if (!result.ok) {
          send('error', { code: result.code, message: result.message, retryable: result.retryable, requestId: result.requestId });
          controller.close();
          return;
        }

        const db2 = await getDb();
        await db2.insert(schema.aiMessages).values({
          conversationId, role: 'assistant', content: result.text,
          modelId: result.modelUsed, promptVersion: promptVersion('tutor'), runId: result.runId
        });
        await db2.update(schema.aiConversations).set({ updatedAt: new Date() }).where(eq(schema.aiConversations.id, conversationId!));
        await db2.insert(schema.analyticsEvents).values({ userId: user.id, category: 'ai_request_completed', subjectId: body.subjectId ?? null, topicId: body.topicId ?? null });

        send('done', {
          requestId, conversationId, modelUsed: result.modelUsed,
          fallbackUsed: result.fallbackUsed, fallbackNotice: result.fallbackNotice,
          usage: result.usage, latencyMs: result.latencyMs
        });
        controller.close();
      },
      cancel() { /* client disconnected; the run row is reconciled by the gateway */ }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Request-Id': requestId
      }
    });
  } catch (e) {
    return toErrorResponse(e, requestId);
  }
}
