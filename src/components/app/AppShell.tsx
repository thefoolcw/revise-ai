'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';
import { CommandPalette } from './CommandPalette';
import { post } from '@/lib/client';

export type NavItem = { href: string; label: string; icon: string };

const PRIMARY: NavItem[] = [
  { href: '/app/dashboard', label: 'Dashboard', icon: '◧' },
  { href: '/app/tutor', label: 'Tutor', icon: '◈' },
  { href: '/app/solve', label: 'Solve', icon: '⌁' },
  { href: '/app/quiz', label: 'Quizzes', icon: '◑' },
  { href: '/app/flashcards', label: 'Flashcards', icon: '❍' }
];
const SECONDARY: NavItem[] = [
  { href: '/app/planner', label: 'Planner', icon: '▤' },
  { href: '/app/notes', label: 'Notes', icon: '✎' },
  { href: '/app/library', label: 'Library', icon: '▦' },
  { href: '/app/progress', label: 'Progress', icon: '◔' },
  { href: '/app/learn', label: 'Curriculum', icon: '⌘' }
];
const ACCOUNT: NavItem[] = [
  { href: '/app/premium', label: 'Premium', icon: '★' },
  { href: '/app/usage', label: 'Usage', icon: '◫' },
  { href: '/app/support', label: 'Support', icon: '?' },
  { href: '/app/settings', label: 'Settings', icon: '⚙' }
];

const MOBILE = [PRIMARY[0]!, PRIMARY[1]!, PRIMARY[2]!, PRIMARY[3]!, { href: '/app/planner', label: 'Plan', icon: '▤' }];

export function AppShell({
  children, user, premiumActive, isAdmin
}: {
  children: React.ReactNode;
  user: { displayName: string; email: string; onboarded: boolean };
  premiumActive: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const NavLinks = ({ items }: { items: NavItem[] }) => (
    <nav className="stack gap-1">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="app-nav-link" aria-current={isActive(item.href) ? 'page' : undefined}>
          <span aria-hidden="true" style={{ width: 18, textAlign: 'center', fontSize: '.95rem' }}>{item.icon}</span>
          {item.label}
          {item.href === '/app/premium' && premiumActive && <span className="chip chip-accent" style={{ marginLeft: 'auto', fontSize: '.66rem' }}>Active</span>}
        </Link>
      ))}
    </nav>
  );

  const logout = async () => {
    await post('/api/auth/logout');
    router.push('/'); router.refresh();
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: 'var(--app-columns, minmax(0, 1fr))' }} className="app-grid">
      {/* ── Desktop rail ─────────────────────────────────────── */}
      <aside className="app-rail" style={{
        borderRight: '1px solid var(--border)', background: 'var(--surface-2)',
        position: 'sticky', top: 0, height: '100dvh', overflowY: 'auto',
        padding: '1rem .8rem', display: 'flex', flexDirection: 'column', gap: '1.25rem'
      }}>
        <Link href="/app/dashboard" style={{ textDecoration: 'none', padding: '.3rem .4rem' }}><Brand size={22} /></Link>

        <button onClick={() => setPaletteOpen(true)} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start', width: '100%' }}>
          <span aria-hidden="true">⌕</span> Search…
          <kbd style={{ marginLeft: 'auto', fontSize: '.68rem', padding: '.1rem .3rem', borderRadius: 4, background: 'var(--surface-3)', border: '1px solid var(--border)' }}>⌘K</kbd>
        </button>

        <div className="stack gap-3">
          <NavLinks items={PRIMARY} />
          <div className="hairline" />
          <NavLinks items={SECONDARY} />
          <div className="hairline" />
          <NavLinks items={ACCOUNT} />
          {isAdmin && (
            <>
              <div className="hairline" />
              <Link href="/admin" className="app-nav-link" aria-current={pathname.startsWith('/admin') ? 'page' : undefined}>
                <span aria-hidden="true" style={{ width: 18, textAlign: 'center' }}>⛭</span> Admin
              </Link>
            </>
          )}
        </div>

        <div style={{ marginTop: 'auto' }} className="stack gap-2">
          <div style={{ padding: '.6rem .7rem', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '.84rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName}</p>
            <p className="faint" style={{ fontSize: '.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
            <p style={{ marginTop: '.4rem' }}>
              {premiumActive
                ? <span className="chip chip-success">Premium Active</span>
                : <Link href="/app/premium" className="chip chip-accent" style={{ textDecoration: 'none' }}>Premium — upgrade</Link>}
            </p>
          </div>
          <div className="row gap-1">
            <ThemeToggle />
            <button onClick={logout} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Sign out</button>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ───────────────────────────────────── */}
      <div className="app-topbar row spread" style={{
        position: 'sticky', top: 0, zIndex: 30, height: 56, padding: '0 1rem',
        background: 'color-mix(in srgb, var(--surface) 90%, transparent)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)'
      }}>
        <Link href="/app/dashboard" style={{ textDecoration: 'none' }}><Brand size={20} /></Link>
        <div className="row gap-1">
          <button onClick={() => setPaletteOpen(true)} className="btn btn-ghost btn-sm" aria-label="Search" style={{ padding: '.45rem' }}>⌕</button>
          <ThemeToggle />
        </div>
      </div>

      <main id="main" style={{ padding: '1.5rem 1.25rem 6rem', maxWidth: 1180, minWidth: 0, width: '100%', marginInline: 'auto' }}>
        {children}
      </main>

      {/* ── Mobile bottom nav ────────────────────────────────── */}
      <nav aria-label="Primary" className="app-bottomnav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
        display: 'grid', gridTemplateColumns: `repeat(${MOBILE.length}, 1fr)`,
        background: 'color-mix(in srgb, var(--surface) 94%, transparent)', backdropFilter: 'blur(14px)',
        borderTop: '1px solid var(--border)', paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {MOBILE.map((m) => {
          const active = isActive(m.href);
          return (
            <Link key={m.href} href={m.href} aria-current={active ? 'page' : undefined}
              style={{
                display: 'grid', justifyItems: 'center', gap: '.15rem', padding: '.55rem 0',
                fontSize: '.66rem', fontWeight: active ? 650 : 500,
                color: active ? 'var(--accent)' : 'var(--text-faint)', textDecoration: 'none',
                transition: 'color 160ms'
              }}>
              <span aria-hidden="true" style={{ fontSize: '1.05rem', transform: active ? 'translateY(-1px)' : 'none', transition: 'transform 220ms cubic-bezier(.34,1.4,.5,1)' }}>{m.icon}</span>
              {m.label}
            </Link>
          );
        })}
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} isAdmin={isAdmin} />

      <style>{`
        .app-grid { --app-columns: minmax(0, 1fr); }
        .app-rail { display: none !important; }
        .app-topbar { display: flex; }
        .app-bottomnav { display: grid; }
        @media (min-width: 980px) {
          .app-grid { --app-columns: 236px minmax(0, 1fr); }
          .app-rail { display: flex !important; }
          .app-topbar, .app-bottomnav { display: none !important; }
          main { padding-bottom: 3rem !important; }
        }
      `}</style>
    </div>
  );
}
