'use client';

import { useRef, useState, type ReactNode, type CSSProperties } from 'react';

/**
 * Subtle depth response to pointer position. Bounded to a few degrees and
 * disabled for touch, reduced-motion and keyboard users, so it never
 * interferes with reading or causes motion discomfort.
 */
export function TiltCard({
  children, className, style, max = 5
}: { children: ReactNode; className?: string; style?: CSSProperties; max?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [t, setT] = useState<{ rx: number; ry: number } | null>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({ rx: -py * max, ry: px * max });
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => setT(null)}
      className={className}
      style={{
        ...style,
        transform: t ? `perspective(900px) rotateX(${t.rx.toFixed(2)}deg) rotateY(${t.ry.toFixed(2)}deg) translateZ(0)` : undefined,
        transition: t ? 'transform 90ms linear' : 'transform 420ms cubic-bezier(.16,1,.3,1)',
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
}
