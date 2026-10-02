'use client';

import { useEffect, useRef } from 'react';

/**
 * Ambient particle field for the hero only. Canvas-based, capped at 40
 * particles, paused when the tab is hidden or the user prefers reduced motion.
 */
export function AmbientHero({ density = 34 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    let raf = 0, w = 0, h = 0, running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    let ps: P[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ps = Array.from({ length: density }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12,
        r: Math.random() * 1.7 + .5, a: Math.random() * .35 + .08
      }));
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77,163,139,${p.a})`;
        ctx.fill();
      }
      // Faint links between close particles — cheap, bounded by density.
      ctx.lineWidth = 1;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i]!, b = ps[j]!;
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 11000) {
            ctx.strokeStyle = `rgba(77,163,139,${(1 - d2 / 11000) * 0.09})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const onVis = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!running) { running = true; raf = requestAnimationFrame(draw); }
    };

    resize(); draw();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      running = false; cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
