'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { get } from '@/lib/client';

type Cmd = { id: string; label: string; href: string; group: string };

const BASE: Cmd[] = [
  { id: 'ask', label: 'Ask Revise AI', href: '/app/tutor', group: 'Study' },
  { id: 'solve', label: 'Solve a question', href: '/app/solve', group: 'Study' },
  { id: 'quiz', label: 'Create a quiz', href: '/app/quiz', group: 'Study' },
  { id: 'cards', label: 'Review flashcards', href: '/app/flashcards', group: 'Study' },
  { id: 'planner', label: 'Open the planner', href: '/app/planner', group: 'Study' },
  { id: 'notes', label: 'Open notes', href: '/app/notes', group: 'Library' },
  { id: 'library', label: 'Open library', href: '/app/library', group: 'Library' },
  { id: 'progress', label: 'View progress', href: '/app/progress', group: 'Review' },
  { id: 'premium', label: 'Manage Premium', href: '/app/premium', group: 'Account' },
  { id: 'redeem', label: 'Redeem Premium Key', href: '/redeem', group: 'Account' },
  { id: 'usage', label: 'View usage', href: '/app/usage', group: 'Account' },
  { id: 'settings', label: 'Settings', href: '/app/settings', group: 'Account' }
];

export function CommandPalette({ open, onClose, isAdmin }: { open: boolean; onClose: () => void; isAdmin: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const [remote, setRemote] = useState<Cmd[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const commands = useMemo(() => {
    const all = [...BASE, ...(isAdmin ? [{ id: 'admin', label: 'Admin console', href: '/admin', group: 'Admin' }] : []), ...remote];
    if (!q.trim()) return all;
    const needle = q.toLowerCase();
    return all.filter((c) => c.label.toLowerCase().includes(needle)).slice(0, 12);
  }, [q, isAdmin, remote]);

  useEffect(() => {
    if (!open) return;
    setIdx(0);
    setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);

  useEffect(() => {
    if (!open || q.trim().length < 2) { setRemote([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await get<{ results: Record<string, { id: string; title: string; type: string }[]> }>('/api/search?q=' + encodeURIComponent(q.trim()));
        const items: Cmd[] = [];
        for (const [type, list] of Object.entries(r.results)) {
          for (const it of list.slice(0, 3)) {
            items.push({ id: `${type}-${it.id}`, label: it.title, href: hrefFor(it.type ?? type, it.id), group: 'Search' });
          }
        }
        setRemote(items);
      } catch { setRemote([]); }
    }, 220);
    return () => clearTimeout(t);
  }, [q, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, commands.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); const c = commands[idx]; if (c) { router.push(c.href); onClose(); } }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, commands, idx, onClose, router]);

  useEffect(() => {
    const onGlobal = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', onGlobal);
    return () => window.removeEventListener('keydown', onGlobal);
  }, [onClose]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Command palette"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(11,15,20,.45)', backdropFilter: 'blur(3px)', padding: '12vh 1rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card anim-scale-in" onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 560, alignSelf: 'flex-start', overflow: 'hidden', boxShadow: 'var(--shadow-lift)' }}>
        <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }}
          placeholder="Search actions, notes, topics…" aria-label="Search"
          style={{ width: '100%', padding: '1rem 1.1rem', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', fontSize: '.95rem', outline: 'none', color: 'var(--text)' }} />
        <div style={{ maxHeight: '46vh', overflowY: 'auto', padding: '.4rem' }}>
          {commands.length === 0 && <p className="faint" style={{ padding: '1.25rem', textAlign: 'center', fontSize: '.88rem' }}>No matches.</p>}
          {commands.map((c, i) => (
            <button key={c.id} onClick={() => { router.push(c.href); onClose(); }}
              onMouseEnter={() => setIdx(i)}
              className="row spread"
              style={{
                width: '100%', textAlign: 'left', padding: '.6rem .7rem', borderRadius: 8, border: 'none',
                background: i === idx ? 'var(--accent-soft)' : 'transparent',
                color: i === idx ? 'var(--accent)' : 'var(--text)', cursor: 'pointer', fontSize: '.9rem'
              }}>
              <span style={{ fontWeight: i === idx ? 600 : 480 }}>{c.label}</span>
              <span className="faint" style={{ fontSize: '.72rem' }}>{c.group}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function hrefFor(type: string, id: string): string {
  switch (type) {
    case 'note': return `/app/notes?id=${id}`;
    case 'deck': return `/app/flashcards?deck=${id}`;
    case 'quiz': return `/app/quiz?id=${id}`;
    case 'conversation': return `/app/tutor?c=${id}`;
    case 'topic': return `/app/learn?topic=${id}`;
    case 'subject': return `/app/learn?subject=${id}`;
    default: return '/app';
  }
}
