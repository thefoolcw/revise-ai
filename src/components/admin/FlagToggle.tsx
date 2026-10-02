'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { patch } from '@/lib/client';
import { useToast } from '../app/Toaster';

export type Flag = { key: string; description: string | null; enabled: boolean };

export function FlagToggle({ flag }: { flag: Flag }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      await patch('/api/admin/feature-flags', { flagKey: flag.key, enabled: !flag.enabled });
      toast.push(`${flag.key} ${flag.enabled ? 'disabled' : 'enabled'}`, 'success');
      router.refresh();
    } catch (e) { toast.push(e instanceof Error ? e.message : 'Could not change that flag.', 'danger'); }
    finally { setBusy(false); }
  };

  return (
    <div className="row spread gap-3" style={{ padding: '.7rem 0', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ fontWeight: 580, fontSize: '.88rem', fontFamily: 'var(--font-mono, monospace)' }}>{flag.key}</p>
        {flag.description && <p className="faint" style={{ fontSize: '.78rem', marginTop: '.15rem' }}>{flag.description}</p>}
      </div>
      <button onClick={toggle} disabled={busy} role="switch" aria-checked={flag.enabled}
        style={{
          width: 46, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
          background: flag.enabled ? 'var(--accent)' : 'var(--surface-3)',
          transition: 'background-color 200ms linear'
        }}>
        <span aria-hidden="true" style={{
          position: 'absolute', top: 3, left: flag.enabled ? 23 : 3, width: 20, height: 20, borderRadius: 99,
          background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
          transition: 'left 220ms cubic-bezier(.34,1.4,.5,1)'
        }} />
        <span className="sr-only">{flag.enabled ? 'Enabled' : 'Disabled'}</span>
      </button>
    </div>
  );
}
