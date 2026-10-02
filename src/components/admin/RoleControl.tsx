'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chip } from '@/components/ui/primitives';
import { post } from '@/lib/client';
import { useToast } from '../app/Toaster';

const ROLES = ['ADMIN', 'SUPPORT', 'CONTENT_EDITOR', 'ANALYST', 'TEACHER'] as const;

/** Role editing. Every change is audited server-side; the UI is not the boundary. */
export function RoleControl({ userId, roles }: { userId: string; roles: string[] }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggle = async (role: string) => {
    setBusy(true);
    try {
      await post('/api/admin/users/role', { userId, role, grant: !roles.includes(role) });
      toast.push(`${role} ${roles.includes(role) ? 'removed' : 'granted'}`, 'success');
      router.refresh();
    } catch (e) { toast.push(e instanceof Error ? e.message : 'Could not change that role.', 'danger'); }
    finally { setBusy(false); }
  };

  return (
    <div className="row gap-1 wrap" style={{ position: 'relative' }}>
      {roles.length === 0 && <span className="faint" style={{ fontSize: '.78rem' }}>Member</span>}
      {roles.map((r) => <Chip key={r} tone="accent">{r}</Chip>)}
      <button onClick={() => setOpen((o) => !o)} className="btn btn-ghost btn-sm" disabled={busy} aria-expanded={open}>
        Edit
      </button>
      {open && (
        <div className="card anim-scale-in" style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 20, marginTop: '.3rem',
          padding: '.5rem', display: 'grid', gap: '.25rem', minWidth: 170, boxShadow: 'var(--shadow-lift)'
        }}>
          {ROLES.map((r) => (
            <label key={r} className="row gap-2" style={{ fontSize: '.82rem', cursor: 'pointer', padding: '.2rem .3rem' }}>
              <input type="checkbox" checked={roles.includes(r)} disabled={busy} onChange={() => void toggle(r)} />
              {r}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
