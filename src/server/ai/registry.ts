import { and, eq, inArray, sql } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { getProvider } from './provider';
import type { TaskClass, DiscoveredModel } from './types';
import { audit } from '../audit';

/**
 * Capability inference.
 *
 * Capabilities derived from model identifiers are marked INFERRED and are never
 * presented to users as verified. A model only becomes user-visible when
 * `enabled` is true; newly discovered models are auto-enabled for CHAT only,
 * so an admin can promote them after a real probe.
 */
export type CapabilityInference = {
  tasks: TaskClass[];
  inputModalities: string[];
  outputModalities: string[];
  displayName: string;
  inferred: true;
};

const VISION_HINTS = ['-vl', 'vision', 'llava', 'fuyu', 'pixtral', 'mllama', 'qwen2-vl', 'qwen-vl', 'internvl', 'idefics', 'molmo', 'cambrian', 'nvila', 'phi-3.5-vision'];
const CODE_HINTS = ['coder', 'codestral', 'starcoder', 'codegemma', 'codegen', 'qwen2.5-coder', 'deepseek-coder', 'codellama', 'wizardcoder'];
const LONG_HINTS = ['jamba', '128k', '-1m', 'long', 'command-r', 'yi-large', 'mixtral-nemo'];
const NON_CHAT = ['embed', 'embedding', 'rerank', 'nemo-retriever'];

export function inferCapabilities(id: string): CapabilityInference {
  const l = id.toLowerCase();
  const tasks: TaskClass[] = ['CHAT'];
  const inputModalities = ['text'];
  const outputModalities = ['text'];

  if (VISION_HINTS.some((h) => l.includes(h))) {
    tasks.push('VISION');
    inputModalities.push('image');
  }
  if (CODE_HINTS.some((h) => l.includes(h))) tasks.push('CODE');
  if (LONG_HINTS.some((h) => l.includes(h))) tasks.push('LONG_CONTEXT');
  if (/instruct|chat|it$|-it\b|instruct\b/.test(l)) tasks.push('STRUCTURED_OUTPUT');

  const pretty = id.split('/').pop() ?? id;
  return {
    tasks,
    inputModalities,
    outputModalities,
    displayName: pretty.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').replace(/^./, (c) => c.toUpperCase()),
    inferred: true
  };
}

export function isNonChatModel(id: string): boolean {
  const l = id.toLowerCase();
  return NON_CHAT.some((h) => l.includes(h));
}

export type RefreshResult = {
  ok: boolean;
  discovered: number;
  added: number;
  updated: number;
  markedUnavailable: number;
  autoEnabled: number;
  error?: string;
  at: string;
};

/**
 * Discovers models from the provider and reconciles with the local registry.
 * Local metadata is supplemental; the provider catalogue is the source of
 * truth for existence. Removed models are marked unavailable but kept, so
 * historical conversations still render.
 */
export async function refreshModelCatalog(opts?: { actorId?: string | null }): Promise<RefreshResult> {
  const provider = getProvider();
  const at = new Date().toISOString();
  const cfg = provider.validateConfig();
  if (!cfg.ok) {
    return { ok: false, discovered: 0, added: 0, updated: 0, markedUnavailable: 0, autoEnabled: 0, error: `Provider not configured: ${cfg.missing.join(', ')}`, at };
  }

  const listed = await provider.listModels();
  if (!listed.ok) {
    return { ok: false, discovered: 0, added: 0, updated: 0, markedUnavailable: 0, autoEnabled: 0, error: listed.error.message, at };
  }

  const db = await getDb();
  const existing = await db.select({ modelId: schema.modelRegistry.modelId, enabled: schema.modelRegistry.enabled })
    .from(schema.modelRegistry);
  const existingMap = new Map(existing.map((e) => [e.modelId, e]));

  let added = 0, updated = 0, autoEnabled = 0;
  const seen = new Set<string>();

  for (const m of listed.models) {
    seen.add(m.id);
    const inf = inferCapabilities(m.id);
    const prior = existingMap.get(m.id);
    const nonChat = isNonChatModel(m.id);

    if (!prior) {
      // First time we have seen this model. Auto-enable plain chat models so the
      // product is usable, but never auto-grant unverified special capabilities.
      const enable = !nonChat && inf.tasks.includes('CHAT');
      if (enable) autoEnabled++;
      await db.insert(schema.modelRegistry).values({
        modelId: m.id,
        provider: provider.name,
        displayName: inf.displayName,
        ownedBy: m.ownedBy,
        discoveredAt: new Date(),
        lastSeenAt: new Date(),
        available: true,
        enabled: enable,
        tasks: nonChat ? [] : inf.tasks,
        inputModalities: inf.inputModalities,
        outputModalities: inf.outputModalities,
        fallbackRank: 100,
        metadata: { inferred: true, autoEnabled: enable, rawOwnedBy: m.ownedBy }
      }).onConflictDoNothing();
      added++;
    } else {
      await db.update(schema.modelRegistry)
        .set({ lastSeenAt: new Date(), available: true, ownedBy: m.ownedBy ?? null, updatedAt: new Date() })
        .where(eq(schema.modelRegistry.modelId, m.id));
      updated++;
    }
  }

  // Anything in the registry but absent from the catalogue is no longer usable.
  const stale = existing.filter((e) => !seen.has(e.modelId)).map((e) => e.modelId);
  if (stale.length) {
    await db.update(schema.modelRegistry).set({ available: false, updatedAt: new Date() })
      .where(inArray(schema.modelRegistry.modelId, stale));
  }

  await audit({
    actorId: opts?.actorId ?? null,
    action: 'MODEL_CATALOG_REFRESHED',
    metadata: { discovered: listed.models.length, added, updated, markedUnavailable: stale.length, autoEnabled }
  });

  return { ok: true, discovered: listed.models.length, added, updated, markedUnavailable: stale.length, autoEnabled, at };
}

/** Models safe to show a given user. Server-side filtered — never client-trusted. */
export async function listVisibleModels(opts: { premium: boolean; task?: TaskClass }) {
  const db = await getDb();
  const rows = await db.select().from(schema.modelRegistry)
    .where(and(eq(schema.modelRegistry.enabled, true), eq(schema.modelRegistry.available, true)))
    .orderBy(schema.modelRegistry.fallbackRank, schema.modelRegistry.modelId);

  return rows
    .filter((r) => opts.premium || !r.premiumOnly)
    .filter((r) => !opts.task || (r.tasks as string[]).includes(opts.task))
    .map((r) => ({
      id: r.modelId,
      displayName: r.displayName ?? r.modelId,
      provider: r.provider,
      ownedBy: r.ownedBy,
      tasks: r.tasks as TaskClass[],
      inputModalities: r.inputModalities as string[],
      outputModalities: r.outputModalities as string[],
      contextLength: r.contextLength,
      premiumOnly: r.premiumOnly,
      experimental: r.experimental,
      fallbackRank: r.fallbackRank,
      maxOutputTokens: r.maxOutputTokens,
      // Surfaced so the UI can be honest about what is verified vs inferred.
      capabilityStatus: ((r.metadata as Record<string, unknown> | null)?.inferred ? 'INFERRED' : 'ADMIN_VERIFIED') as 'INFERRED' | 'ADMIN_VERIFIED'
    }));
}

export async function lastCatalogRefresh(): Promise<{ at: string | null; stale: boolean }> {
  const db = await getDb();
  const rows = await db.execute(sql`SELECT max(last_seen_at) AS at FROM model_registry`);
  const at = (rows.rows[0] as { at: string | null } | undefined)?.at ?? null;
  const stale = !at || Date.now() - new Date(at).getTime() > 6 * 3600 * 1000;
  return { at, stale };
}

/**
 * Lightweight capability/health probe used by the admin "test" action.
 * Deliberately tiny (max 8 tokens) so it is cheap to run.
 */
export async function probeModel(modelId: string): Promise<{ ok: boolean; latencyMs: number; detail: string }> {
  const provider = getProvider();
  const start = Date.now();
  const r = await provider.generate({
    model: modelId,
    messages: [{ role: 'user', content: 'Reply with the single word: ready' }],
    maxTokens: 8,
    temperature: 0
  });
  const latencyMs = Date.now() - start;
  const db = await getDb();

  if (!r.ok) {
    await db.insert(schema.modelHealth).values({ modelId, status: 'DOWN', latencyMs, errorCode: r.error.kind });
    return { ok: false, latencyMs, detail: `${r.error.kind}: ${r.error.message}` };
  }
  await db.insert(schema.modelHealth).values({ modelId, status: 'OK', latencyMs });
  return { ok: true, latencyMs, detail: 'responded' };
}
