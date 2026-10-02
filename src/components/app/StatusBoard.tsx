'use client';
import { useEffect, useState } from 'react';
import { StatusPill, Skeleton } from '@/components/ui/primitives';
import { get } from '@/lib/client';

type Check = { status: 'operational' | 'degraded' | 'unavailable' | 'unknown'; latencyMs?: number; detail?: string };

export function StatusBoard() {
  const [data, setData] = useState<Record<string, Check> | null>(null);
  const [error, setError] = useState(false);
  const [at, setAt] = useState<string | null>(null);

  const load = async () => {
    try {
      const r = await get<{ status: string; checks: Record<string, Check>; at: string }>('/api/health');
      setData(r.checks); setAt(r.at); setError(false);
    } catch { setError(true); }
  };
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);

  const LABELS: Record<string, string> = {
    database: 'Database', ai: 'AI provider', keyProvider: 'Premium key verification',
    documentProcessing: 'Document processing', purchases: 'Premium entitlements'
  };

  if (error) {
    return (
      <div className="card card-pad">
        <StatusPill status="unknown" label="Status unknown" />
        <p className="muted" style={{ fontSize: '.88rem', marginTop: '.7rem' }}>
          We could not reach the health endpoint. This page will retry automatically.
        </p>
      </div>
    );
  }
  if (!data) return <div className="stack gap-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} style={{ height: 56 }} />)}</div>;

  return (
    <div className="card">
      {Object.entries(data).map(([k, c], i, arr) => (
        <div key={k} className="row spread" style={{ padding: '1rem 1.25rem', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '.92rem' }}>{LABELS[k] ?? k}</p>
            {c.detail && <p className="faint" style={{ fontSize: '.78rem', marginTop: '.15rem' }}>{c.detail}</p>}
          </div>
          <div className="row gap-2">
            {typeof c.latencyMs === 'number' && <span className="faint tnum" style={{ fontSize: '.78rem' }}>{c.latencyMs} ms</span>}
            <StatusPill status={PILL[c.status] ?? 'unknown'} label={c.status.charAt(0).toUpperCase() + c.status.slice(1)} />
          </div>
        </div>
      ))}
      <div style={{ padding: '.7rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        <p className="faint" style={{ fontSize: '.76rem' }}>
          Polled live from <code>/api/health</code>{at ? ` · last check ${new Date(at).toLocaleTimeString('en-GB')}` : ''}. States come from real checks, not a static indicator.
        </p>
      </div>
    </div>
  );
}

const PILL: Record<string, "ok" | "warn" | "bad" | "unknown"> = {
  operational: "ok", ok: "ok", degraded: "warn", unavailable: "bad", unknown: "unknown"
};
