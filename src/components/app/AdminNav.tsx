'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';

const SECTIONS: [string, [string, string][]][] = [
  ['Overview', [['/admin', 'Dashboard'], ['/admin/system', 'System'], ['/admin/feature-flags', 'Feature flags']]],
  ['People', [['/admin/users', 'Users'], ['/admin/premium', 'Premium'], ['/admin/entitlements', 'Entitlements'], ['/admin/keys', 'Keys'], ['/admin/purchases', 'Purchases']]],
  ['Platform', [['/admin/models', 'Models'], ['/admin/usage', 'Usage'], ['/admin/audit', 'Audit log']]],
  ['Curriculum', [['/admin/content', 'Content'], ['/admin/exam-boards', 'Exam boards'], ['/admin/subjects', 'Subjects']]]
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Longest matching prefix wins, so /admin/models/xyz still highlights Models.
  const current = SECTIONS.flatMap(([, links]) => links.map(([href]) => href))
    .filter((href) => pathname === href || pathname.startsWith(href + '/'))
    .sort((a, b) => b.length - a.length)[0] ?? '/admin';
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: 'var(--admin-rail, 0px) 1fr' }} className="admin-grid">
      <aside className="admin-rail" style={{
        borderRight: '1px solid var(--border)', background: 'var(--surface-2)', position: 'sticky', top: 0,
        height: '100dvh', overflowY: 'auto', padding: '1rem .8rem', display: 'flex', flexDirection: 'column', gap: '1.25rem'
      }}>
        <Link href="/admin" style={{ textDecoration: 'none', padding: '.3rem .4rem' }}><Brand size={22} /></Link>
        <span className="chip chip-accent" style={{ alignSelf: 'flex-start' }}>Admin</span>
        {SECTIONS.map(([title, links]) => (
          <nav key={title} aria-label={title} className="stack gap-1">
            <p className="faint" style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.08em', padding: '0 .5rem .2rem' }}>{title}</p>
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="app-nav-link" aria-current={current === href ? 'page' : undefined}>
                {label}
              </Link>
            ))}
          </nav>
        ))}
        <div style={{ marginTop: 'auto' }} className="stack gap-2">
          <Link href="/app/dashboard" className="btn btn-outline btn-sm">Back to app</Link>
          <ThemeToggle />
        </div>
      </aside>

      <div className="admin-topbar row spread" style={{
        position: 'sticky', top: 0, zIndex: 30, height: 52, padding: '0 1rem',
        background: 'color-mix(in srgb, var(--surface) 90%, transparent)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)'
      }}>
        <Link href="/admin" style={{ textDecoration: 'none' }}><Brand size={20} /></Link>
        <div className="row gap-2"><Link href="/app/dashboard" style={{ fontSize: '.82rem' }}>App</Link><ThemeToggle /></div>
      </div>

      <div>
        <div className="admin-topbar" />
        <main id="main" style={{ padding: '1.5rem 1.25rem 4rem', maxWidth: 1180, width: '100%', marginInline: 'auto' }}>
          <nav aria-label="Admin sections" className="admin-tabnav row gap-1 wrap" style={{ marginBottom: '1.25rem', overflowX: 'auto' }}>
            {SECTIONS.flatMap(([, links]) => links).map(([href, label]) => (
              <Link key={href} href={href} className="mode-chip" aria-pressed={current === href}>{label}</Link>
            ))}
          </nav>
          {children}
        </main>
      </div>

      <style>{`
        .admin-grid { --admin-rail: 0px; }
        .admin-rail, .admin-topbar { display: none; }
        @media (min-width: 980px) {
          .admin-grid { --admin-rail: 220px; }
          .admin-rail { display: flex !important; }
          .admin-topbar, .admin-tabnav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
