'use client';

import { useEffect, useState } from 'react';
import { get } from '@/lib/client';

/** Shape returned by GET /api/models (see listVisibleModels). */
export type VisibleModel = {
  id: string; displayName: string | null; provider: string;
  tasks: string[]; premiumOnly: boolean; capabilityStatus: string;
  contextLength: number | null; inputModalities: string[]; outputModalities: string[];
  fallbackRank: number | null; ownedBy: string | null; experimental: boolean;
};

/**
 * Model picker populated only from the server-side registry, filtered by the
 * caller's entitlement. Never renders an invented model list.
 */
export function ModelSelect({ task, value, onChange, label = 'Model' }: {
  task?: string; value: string; onChange: (id: string) => void; label?: string;
}) {
  const [models, setModels] = useState<VisibleModel[]>([]);
  const [stale, setStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const r = await get<{ models: VisibleModel[]; catalog: { stale: boolean } }>(
          '/api/models' + (task ? `?task=${encodeURIComponent(task)}` : '')
        );
        if (!live) return;
        setModels(r.models); setStale(r.catalog.stale); setError(null);
      } catch (e) {
        if (live) setError(e instanceof Error ? e.message : 'Could not load models.');
      } finally { if (live) setLoading(false); }
    })();
    return () => { live = false; };
  }, [task]);

  if (error) {
    return <p className="faint" style={{ fontSize: '.78rem' }}>Model list unavailable — the router will choose automatically. {error}</p>;
  }

  return (
    <label style={{ display: 'block' }}>
      <span className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
      <select
        value={value}
        disabled={loading}
        onChange={(e) => onChange(e.target.value)}
        style={{ marginTop: '.3rem', width: '100%', padding: '.5rem .6rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '.84rem' }}
      >
        <option value="">Auto — let Revise AI choose</option>
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.displayName || m.id}{m.premiumOnly ? ' — Premium' : ''}
          </option>
        ))}
      </select>
      {stale && (
        <span className="faint" style={{ fontSize: '.74rem', display: 'block', marginTop: '.3rem' }}>
          The live model catalogue has not refreshed recently; some models may be unavailable.
        </span>
      )}
      {!loading && models.length === 0 && (
        <span className="faint" style={{ fontSize: '.74rem', display: 'block', marginTop: '.3rem' }}>
          No models are enabled for this task yet. An administrator can enable them in the model registry.
        </span>
      )}
    </label>
  );
}
