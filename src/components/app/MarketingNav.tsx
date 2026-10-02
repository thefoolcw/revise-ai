'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';

const LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/subjects', label: 'Subjects' },
  { href: '/exam-boards', label: 'Exam boards' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' }
];

export function MarketingNav({ authed, displayName }: { authed: boolean; displayName?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: scrolled ? 'color-mix(in srgb, var(--surface) 88%, transparent)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px) saturate(1.4)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'background-color 260ms cubic-bezier(.16,1,.3,1), border-color 260ms, backdrop-filter 260ms'
      }}
    >
      <div className="container-x row spread" style={{ height: 'var(--header-h)' }}>
        <Link href="/" aria-label="Revise AI home" style={{ textDecoration: 'none' }}><Brand /></Link>

        <nav aria-label="Main" className="row gap-1" style={{ display: 'none' }} data-desktop-nav>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              style={{ padding: '.45rem .7rem', borderRadius: 9, fontSize: '.9rem', fontWeight: 540, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 160ms, background-color 160ms' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface-3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="row gap-2" data-desktop-actions>
          <ThemeToggle />
          {authed ? (
            <Link href="/app" className="btn btn-primary btn-sm">{displayName ? `Open ${displayName.split(' ')[0]}'s dashboard` : 'Open dashboard'}</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm" style={{ display: 'none' }} data-desktop-only>Sign in</Link>
              <Link href="/signup" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
          <button className="btn btn-ghost btn-sm" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu"
            data-mobile-only onClick={() => setOpen((v) => !v)} style={{ padding: '.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
                 style={{ transition: 'transform 260ms cubic-bezier(.34,1.4,.5,1)' }}>
                <line x1="3" y1={open ? 10 : 5.5} x2="17" y2={open ? 10 : 5.5}
                      style={{ transformOrigin: 'center', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 260ms cubic-bezier(.34,1.4,.5,1)' }} />
                <line x1="3" y1="10" x2="17" y2="10" style={{ opacity: open ? 0 : 1, transition: 'opacity 160ms' }} />
                <line x1="3" y1={open ? 10 : 14.5} x2="17" y2={open ? 10 : 14.5}
                      style={{ transformOrigin: 'center', transform: open ? 'rotate(-45deg)' : 'none', transition: 'transform 260ms cubic-bezier(.34,1.4,.5,1)' }} />
              </g>
            </svg>
          </button>
        </div>
      </div>

      <div id="mobile-menu" data-mobile-only hidden={!open}
        className="anim-slide-down"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '.6rem 1.25rem 1rem' }}>
        <nav aria-label="Mobile" className="stack gap-1">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ padding: '.7rem .5rem', fontSize: '1rem', fontWeight: 540, color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
              {l.label}
            </Link>
          ))}
          {!authed && <Link href="/login" onClick={() => setOpen(false)} style={{ padding: '.7rem .5rem', fontSize: '1rem', fontWeight: 540, textDecoration: 'none' }}>Sign in</Link>}
        </nav>
      </div>

      <style>{`
        [data-desktop-nav], [data-desktop-actions] [data-desktop-only] { display: none !important; }
        @media (min-width: 860px) {
          [data-desktop-nav], [data-desktop-actions] [data-desktop-only] { display: inline-flex !important; }
          [data-mobile-only] { display: none !important; }
        }
      `}</style>
    </header>
  );
}
