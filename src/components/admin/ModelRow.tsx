'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chip } from '@/components/ui/primitives';
import { post } from '@/lib/client';
import { useToast } from '../app/Toaster';

export type AdminModel = {
  modelId: string; vendor: string; enabled: boolean; available: boolean;
  premiumOnly: boolean; tasks: string[]; fallbackRank: number | null; lastProbeStatus: string | null;
};

export function ModelRow({ model }: { model: AdminModel }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<null | 'toggle' | 'test'>(null);

  const act = async (kind: 'toggle' | 'test') => {
    setBusy(kind);
    try {
      if (kind === 'toggle') {
        await post(`/api/admin/models/${encodeURIComponent(model.modelId)}/toggle`, { enabled: !model.enabled });
        toast.push(`${model.modelId} ${model.enabled ? 'disabled' : 'enabled'}`, 'success');
        router.refresh();
      } else {
        const r = await post<{ ok: boolean; latencyMs: number; detail?: string }>(
          `/api/admin/models/${encodeURIComponent(model.modelId)}/test`, {}
        );
        toast.push(r.ok ? `${model.modelId} responded in ${r.latencyMs} ms` : `${model.modelId} failed: ${r.detail ?? 'no detail'}`,
          r.ok ? 'success' : 'warning');
        router.refresh();
      }
    } catch (e) { toast.push(e instanceof Error ? e.message : 'Action failed.', 'danger'); }
    finally { setBusy(null); }
  };

  return (
    <tr>
      <td style={{ fontWeight: 560, fontFamily: 'var(--font-mono, monospace)', fontSize: '.8rem' }}>{model.modelId}</td>
      <td className="faint">{model.vendor}</td>
      <td>{model.tasks.slice(0, 3).map((t) => <Chip key={t}>{t}</Chip>)}</td>
      <td><Chip tone={model.enabled ? 'success' : 'default'}>{model.enabled ? 'ENABLED' : 'DISABLED'}</Chip></td>
      <td><Chip tone={model.available ? 'success' : 'danger'}>{model.available ? 'REACHABLE' : 'UNREACHABLE'}</Chip></td>
      <td><Chip tone={model.premiumOnly ? 'accent' : 'default'}>{model.premiumOnly ? 'PREMIUM' : 'ALL'}</Chip></td>
      <td className="tnum faint">{model.fallbackRank ?? '—'}</td>
      <td className="row gap-1">
        <button className="btn btn-outline btn-sm" onClick={() => void act('toggle')} disabled={busy !== null}>
          {busy === 'toggle' ? '…' : model.enabled ? 'Disable' : 'Enable'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => void act('test')} disabled={busy !== null}>
          {busy === 'test' ? '…' : 'Test'}
        </button>
      </td>
    </tr>
  );
}

export function RefreshCatalogue() {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    setBusy(true);
    try {
      const r = await post<{ discovered: number; added: number; updated: number }>('/api/admin/models/refresh', {});
      toast.push(`Catalogue refreshed: ${r.discovered} discovered, ${r.added} new, ${r.updated} updated`, 'success');
      router.refresh();
    } catch (e) { toast.push(e instanceof Error ? e.message : 'Refresh failed.', 'danger'); }
    finally { setBusy(false); }
  };
  return <button className="btn btn-primary btn-sm" onClick={refresh} disabled={busy}>{busy ? 'Refreshing…' : 'Refresh from provider'}</button>;
}
