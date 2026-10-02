'use client';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('revise-theme', next ? 'dark' : 'light'); } catch {}
  };
  return (
    <button className="btn btn-ghost btn-sm" onClick={toggle} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'} style={{ padding: '.5rem' }}>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        {dark ? (
          <path d="M10 3v1.6M10 15.4V17M3 10h1.6M15.4 10H17M5.1 5.1l1.1 1.1M13.8 13.8l1.1 1.1M14.9 5.1l-1.1 1.1M6.2 13.8l-1.1 1.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        ) : (
          <path d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        )}
        {!dark && <circle cx="10" cy="10" r="3.1" stroke="currentColor" strokeWidth="1.6" />}
      </svg>
    </button>
  );
}
