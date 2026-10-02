'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/client';
import { useToast } from '../app/Toaster';

export function RevokeControl({ entitlementId }: { entitlementId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const revoke = async () => {
    if (reason.trim().length < 4) { toast.push('Give a reason of at least 4 characters.', 'warning'); return; }
    setBusy(true);
    try {
      await post(`/api/admin/entitlements/${entitlementId}/revoke`, { reason: reason.trim() });
      toast.push('Entitlement revoked', 'success');
      router.refresh();
    } catch (e) { toast.push(e instanceof Error ? e.message : 'Could not revoke.', 'danger'); }
    finally { setBusy(false); }
  };

  if (!open) return <button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>Revoke</button>;

  return (
    <div className="row gap-1 wrap">
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (audited)"
        maxLength={200} aria-label="Revocation reason"
        style={{ padding: '.3rem .5rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '.78rem', width: 150 }} />
      <button className="btn btn-outline btn-sm" onClick={revoke} disabled={busy}>Confirm</button>
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
    </div>
  );
}
