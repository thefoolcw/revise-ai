'use client';

import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';

/**
 * Scroll-linked reveal via IntersectionObserver.
 * Falls back to visible content if the observer is unavailable, so nothing is
 * ever hidden behind a broken animation.
 */
export function Reveal({
  children, delay = 0, as: Tag = 'div', className, style, once = true
}: {
  children: ReactNode; delay?: number; as?: any; className?: string;
  style?: CSSProperties; once?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { el.setAttribute('data-reveal', 'in'); return; }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-reveal', 'in');
            if (once) io.unobserve(e.target);
          } else if (!once) {
            e.target.removeAttribute('data-reveal');
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref as any}
      data-reveal=""
      className={className}
      style={{ ...style, ['--reveal-delay' as any]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Staggered group: children each get an increasing delay. */
export function RevealGroup({
  children, step = 80, className, as: Tag = 'div'
}: { children: ReactNode[]; step?: number; className?: string; as?: any }) {
  return (
    <Tag className={className}>
      {children.map((c, i) => (
        <Reveal key={i} delay={i * step}>{c}</Reveal>
      ))}
    </Tag>
  );
}
