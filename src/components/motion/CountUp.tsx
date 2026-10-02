'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Number roll-up. Only for genuine figures — the copy layer must never invent
 * statistics to animate.
 */
export function CountUp({
  value, duration = 900, suffix = '', prefix = '', decimals = 0, className
}: { value: number; duration?: number; suffix?: string; prefix?: string; decimals?: number; className?: string }) {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setShown(value); return; }

    const run = () => {
      if (started.current) return;
      started.current = true;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setShown(value * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === 'undefined') { run(); return; }
    const io = new IntersectionObserver((es) => { if (es[0]?.isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={`tnum ${className ?? ''}`}>
      {prefix}{shown.toFixed(decimals)}{suffix}
    </span>
  );
}
