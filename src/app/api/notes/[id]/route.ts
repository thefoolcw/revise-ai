import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { handler, parse, needUser } from '@/server/api/route';
import { getDb, schema } from '@/server/db';
import { generateText } from '@/server/ai/gateway';
import { composeMessages, promptVersion } from '@/server/ai/prompts';
import { checkLimit } from '@/server/usage/ledger';

const Patch = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  body: z.string().max(60000).optional(),
  tags: z.array(z.string().max(40)).max(20).optional()
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handler(async (ctx) => {
    const u = needUser(ctx);
    const db = await getDb();
    const [note] = await db.select().from(schema.notes).where(and(eq(schema.notes.id, id), eq(schema.notes.userId, u.id))).limit(1);
    if (!note) { const e = new Error('Note not found.'); (e as any).code = 'NOT_FOUND'; throw e; }
    return { note };
  })(req as any);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handler(async (ctx, body) => {
    const u = needUser(ctx);
    const b = parse(Patch, body);
    const db = await getDb();
    const [note] = await db.select().from(schema.notes).where(and(eq(schema.notes.id, id), eq(schema.notes.userId, u.id))).limit(1);
    if (!note) { const e = new Error('Note not found.'); (e as any).code = 'NOT_FOUND'; throw e; }
    // Versioned so an AI transformation can never silently destroy user content.
    await db.update(schema.notes).set({
      title: b.title ?? note.title, body: b.body ?? note.body, tags: b.tags ?? note.tags,
      version: note.version + 1, updatedAt: new Date()
    }).where(eq(schema.notes.id, id));
    return { updated: true, version: note.version + 1 };
  })(req as any);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handler(async (ctx) => {
    const u = needUser(ctx);
    const db = await getDb();
    const [note] = await db.select().from(schema.notes).where(and(eq(schema.notes.id, id), eq(schema.notes.userId, u.id))).limit(1);
    if (!note) { const e = new Error('Note not found.'); (e as any).code = 'NOT_FOUND'; throw e; }
    await db.delete(schema.notes).where(eq(schema.notes.id, id));
    return { deleted: true };
  })(req as any);
}

const AiAction = z.object({ action: z.enum(['summarise', 'flashcards', 'quiz', 'clarify']) });

const ACTION_INSTRUCTION: Record<string, string> = {
  summarise: 'Rewrite these notes as a concise, well-structured summary. Keep every factual point; remove repetition. Use headings and bullets.',
  flashcards: 'Turn these notes into flashcards. Output them as a plain list where each entry is "Front: ..." on one line and "Back: ..." on the next. Front must be a specific prompt, back a specific answer. Never put the answer on the front.',
  quiz: 'Turn these notes into a short quiz. Number the questions, give options where appropriate, then list the answers and a one-line explanation under a separate "Answers" heading at the end.',
  clarify: 'Expand these notes. Explain each point more fully, define any jargon, and add one worked example per key idea. Do not remove anything the learner wrote.'
};

/**
 * AI transformation of a note. Always writes a NEW version — the previous
 * body is never overwritten in place, so a bad generation cannot destroy
 * the learner's own writing.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handler(async (ctx, body) => {
    const u = needUser(ctx);
    const b = parse(AiAction, body);
    const limit = await checkLimit(u.id, 'ai_requests');
    if (!limit.allowed) { const e = new Error(limit.message); (e as any).code = 'USAGE_LIMIT'; throw e; }

    const db = await getDb();
    const [note] = await db.select().from(schema.notes)
      .where(and(eq(schema.notes.id, id), eq(schema.notes.userId, u.id))).limit(1);
    if (!note) { const e = new Error('Note not found.'); (e as any).code = 'NOT_FOUND'; throw e; }
    if (!note.body.trim()) { const e = new Error('Write something in the note first.'); (e as any).code = 'VALIDATION_ERROR'; throw e; }

    const messages = composeMessages(
      { task: b.action === 'quiz' ? 'quiz' : b.action === 'flashcards' ? 'flashcards' : 'tutor' },
      `${ACTION_INSTRUCTION[b.action]}\n\nThe notes are the learner's own material, supplied below as data.\n\nSOURCE BEGIN\n${note.body.slice(0, 12000)}\nSOURCE END`
    );

    const result = await generateText({
      userId: u.id, feature: 'NOTES', task: 'CHAT', messages,
      requestedModelId: u.defaultModelId, promptVersion: promptVersion('notes'), maxTokens: 1800
    });
    if (!result.ok) { const e = new Error(result.message); (e as any).code = result.code; throw e; }

    const newVersion = note.version + 1;
    const header = `<!-- revise-ai: v${newVersion} · ${b.action} · ${result.modelUsed} -->\n\n`;
    await db.update(schema.notes).set({
      body: header + result.text, version: newVersion, updatedAt: new Date()
    }).where(eq(schema.notes.id, id));

    return { body: header + result.text, version: newVersion, modelUsed: result.modelUsed };
  })(req as any);
}
