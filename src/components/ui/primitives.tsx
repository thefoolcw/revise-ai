'use client';

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  block?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = 'primary', size = 'md', loading, block, className = '', children, disabled, ...rest }, ref
) {
  const cls = ['btn', `btn-${variant}`, size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '', block ? 'btn-block' : '', className]
    .filter(Boolean).join(' ');
  return (
    <button ref={ref} className={cls} data-loading={loading ? 'true' : undefined}
      disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {children}
    </button>
  );
});

export function Input({ label, hint, error, id, className = '', ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string; error?: string | null }) {
  const inputId = id ?? rest.name ?? undefined;
  return (
    <div>
      {label && <label className="label" htmlFor={inputId}>{label}</label>}
      <input id={inputId} className={`input ${className}`} aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined} {...rest} />
      {error ? <p className="field-error" id={`${inputId}-err`} role="alert">{error}</p>
        : hint ? <p className="hint" id={`${inputId}-hint`}>{hint}</p> : null}
    </div>
  );
}

export function Textarea({ label, hint, error, id, className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string; error?: string | null }) {
  const inputId = id ?? rest.name ?? undefined;
  return (
    <div>
      {label && <label className="label" htmlFor={inputId}>{label}</label>}
      <textarea id={inputId} className={`textarea ${className}`} aria-invalid={error ? true : undefined} {...rest} />
      {error ? <p className="field-error" role="alert">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

export function Select({ label, hint, error, id, className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; hint?: string; error?: string | null }) {
  const inputId = id ?? rest.name ?? undefined;
  return (
    <div>
      {label && <label className="label" htmlFor={inputId}>{label}</label>}
      <select id={inputId} className={`select ${className}`} aria-invalid={error ? true : undefined} {...rest}>{children}</select>
      {error ? <p className="field-error" role="alert">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

export function Chip({ children, tone = 'default', className = '' }: { children: ReactNode; tone?: 'default' | 'accent' | 'warn' | 'danger' | 'success'; className?: string }) {
  const map = { default: '', accent: 'chip-accent', warn: 'chip-warn', danger: 'chip-danger', success: 'chip-success' };
  return <span className={`chip ${map[tone]} ${className}`}>{children}</span>;
}

/** Status indicator: colour + text, never colour alone (WCAG 1.4.1). */
export function StatusPill({ status, label }: { status: 'ok' | 'warn' | 'bad' | 'unknown'; label: string }) {
  const dot = { ok: 'dot-ok', warn: 'dot-warn', bad: 'dot-bad', unknown: 'dot-unknown' }[status];
  return <span className="chip"><span className={`dot ${dot}`} aria-hidden="true" />{label}</span>;
}

export function Alert({ tone = 'info', title, children, className = '' }: { tone?: 'info' | 'success' | 'warning' | 'danger'; title?: string; children: ReactNode; className?: string }) {
  const tones = {
    info: { bg: 'color-mix(in srgb, var(--info) 10%, transparent)', fg: 'var(--info)', icon: 'ℹ' },
    success: { bg: 'color-mix(in srgb, var(--success) 11%, transparent)', fg: 'var(--success)', icon: '✓' },
    warning: { bg: 'color-mix(in srgb, var(--warning) 12%, transparent)', fg: 'var(--warning)', icon: '!' },
    danger: { bg: 'color-mix(in srgb, var(--danger) 10%, transparent)', fg: 'var(--danger)', icon: '✕' }
  }[tone];
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={`anim-fade-in ${className}`}
      style={{ background: tones.bg, border: `1px solid color-mix(in srgb, ${tones.fg} 28%, transparent)`, borderRadius: 12, padding: '.85rem 1rem', display: 'flex', gap: '.7rem' }}>
      <span aria-hidden="true" style={{ color: tones.fg, fontWeight: 700, lineHeight: 1.4 }}>{tones.icon}</span>
      <div style={{ fontSize: '.9rem', lineHeight: 1.55 }}>
        {title && <p style={{ fontWeight: 620, color: tones.fg, marginBottom: '.15rem' }}>{title}</p>}
        <div style={{ color: 'var(--text)' }}>{children}</div>
      </div>
    </div>
  );
}

export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="anim-fade-up" style={{ textAlign: 'center', padding: '2.75rem 1.25rem', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius)', background: 'var(--surface-2)' }}>
      {icon && <div style={{ fontSize: '1.9rem', marginBottom: '.6rem', opacity: .8 }} aria-hidden="true">{icon}</div>}
      <h3 className="h3" style={{ marginBottom: '.35rem' }}>{title}</h3>
      <p className="muted" style={{ fontSize: '.9rem', maxWidth: 420, margin: '0 auto 1.1rem' }}>{body}</p>
      {action}
    </div>
  );
}

export function ProgressBar({ value, max, label, showValue = true }: { value: number; max: number; label: string; showValue?: boolean }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div>
      <div className="row spread" style={{ marginBottom: '.3rem', fontSize: '.82rem' }}>
        <span className="muted">{label}</span>
        {showValue && <span className="tnum" style={{ fontWeight: 600 }}>{Math.round(pct)}%</span>}
      </div>
      <div className="progress" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, lede, align = 'left' }: { eyebrow?: string; title: string; lede?: string; align?: 'left' | 'center' }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === 'center' ? 720 : undefined, margin: align === 'center' ? '0 auto' : undefined }}>
      {eyebrow && <p className="eyebrow" style={{ marginBottom: '.6rem' }}>{eyebrow}</p>}
      <h2 className="h1" style={{ marginBottom: lede ? '.7rem' : 0 }}>{title}</h2>
      {lede && <p className="lede">{lede}</p>}
    </div>
  );
}
