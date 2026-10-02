'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Hero product preview. Clearly labelled as a preview, and the figures shown
 * come from the live registry — this is not a mock of a real user session.
 */
const DEMO_LINES = [
  { who: 'user', text: 'Solve: 3x² − 12 = 0' },
  { who: 'ai', text: '**Method** — isolate x², then take both roots.' },
  { who: 'ai', text: '1. 3x² = 12 → x² = 4' },
  { who: 'ai', text: '2. x = ±2' },
  { who: 'ai', text: '**Check** — 3(2)² − 12 = 0 ✓' },
  { who: 'ai', text: '_Common mistake: forgetting the negative root._' }
];

export function HeroConsole({ stats, catalogStale, catalogAt }: {
  stats: { subjects: number; topics: number; boards: number; qualifications: number; models: number };
  catalogStale: boolean; catalogAt: string | null;
}) {
  const [shown, setShown] = useState(0);
  const [chars, setChars] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setShown(DEMO_LINES.length); return; }
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      let i = 0, c = 0;
      const tick = () => {
        if (cancelled) return;
        const line = DEMO_LINES[i];
        if (!line) { setTimeout(() => { if (!cancelled) { i = 0; c = 0; setShown(0); setChars(0); tick(); } }, 4200); return; }
        c++;
        setShown(i); setChars(c);
        if (c >= line.text.length) { i++; c = 0; setTimeout(tick, 620); }
        else setTimeout(tick, line.who === 'user' ? 34 : 17);
      };
      tick();
    };
    if (typeof IntersectionObserver === 'undefined') { start(); return; }
    const io = new IntersectionObserver((es) => { if (es[0]?.isIntersecting) { start(); io.disconnect(); } }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => { cancelled = true; io.disconnect(); };
  }, []);

  const md = (s: string) =>
    s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/_([^_]+)_/g, '<em>$1</em>');

  const line = DEMO_LINES[shown];
  const partial = line ? (line.who === 'user' ? line.text.slice(0, chars) : line.text.slice(0, chars)) : '';

  return (
    <div ref={ref} className="card" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-lift)' }}>
      {/* window chrome */}
      <div className="row spread" style={{ padding: '.6rem .9rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        <div className="row gap-2">
          <span aria-hidden="true" className="row gap-1">
            {['#e5544b', '#e0a63c', '#4cae50'].map((c) => <span key={c} style={{ width: 9, height: 9, borderRadius: 99, background: c, display: 'inline-block' }} />)}
          </span>
          <span className="faint" style={{ fontSize: '.74rem', fontWeight: 560 }}>Revise AI · Solve</span>
        </div>
        <span className="chip" style={{ fontSize: '.68rem' }}>Product preview</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', minHeight: 250 }}>
        <div style={{ padding: '1rem 1.1rem' }}>
          <div className="stack gap-3" style={{ minHeight: 190 }}>
            {DEMO_LINES.slice(0, shown + 1).map((l, i) => {
              const isLast = i === shown;
              const content = isLast ? partial : l.text;
              return (
                <div key={i} className={l.who === 'user' ? 'row' : 'row'} style={{ justifyContent: l.who === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div className={isLast && l.who === 'ai' ? 'caret' : ''}
                    style={{
                      maxWidth: '86%', padding: '.55rem .8rem', borderRadius: 12,
                      fontSize: '.85rem', lineHeight: 1.6,
                      background: l.who === 'user' ? 'var(--accent)' : 'var(--surface-2)',
                      color: l.who === 'user' ? 'var(--accent-contrast)' : 'var(--text)',
                      border: l.who === 'user' ? 'none' : '1px solid var(--border)',
                      borderBottomRightRadius: l.who === 'user' ? 4 : 12,
                      borderBottomLeftRadius: l.who === 'user' ? 12 : 4
                    }}>
                    {l.who === 'ai'
                      ? <span dangerouslySetInnerHTML={{ __html: md(content) }} />
                      : content}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hairline" style={{ padding: '.65rem 1rem', display: 'grid', gap: '.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(88px,1fr))', background: 'var(--surface-2)' }}>
        {[
          ['Models live', stats.models],
          ['Subjects', stats.subjects],
          ['Topics', stats.topics],
          ['Boards', stats.boards]
        ].map(([l, v]) => (
          <div key={String(l)} style={{ textAlign: 'center' }}>
            <div className="tnum" style={{ fontSize: '.95rem', fontWeight: 680 }}>{String(v)}</div>
            <div className="faint" style={{ fontSize: '.68rem' }}>{String(l)}</div>
          </div>
        ))}
        <div style={{ gridColumn: '1 / -1' }} className="faint">
          <span style={{ fontSize: '.68rem' }}>
            {catalogStale
              ? `Using last known catalogue from ${catalogAt ? new Date(catalogAt).toLocaleString('en-GB') : 'an earlier refresh'}.`
              : `Model catalogue discovered live${catalogAt ? ` at ${new Date(catalogAt).toLocaleTimeString('en-GB')}` : ''}.`}
          </span>
        </div>
      </div>
    </div>
  );
}
