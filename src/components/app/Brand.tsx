/** Wordmark + mark. Legible at 16px and in monochrome. */
export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="currentColor" opacity=".12" />
      <path d="M9 22V10h6.2c2.6 0 4.3 1.5 4.3 3.9 0 1.8-1 3.1-2.7 3.6l3.4 4.5h-3.3l-2.9-4.2h-2.1V22H9Zm2.9-6.4h3c1.1 0 1.8-.6 1.8-1.6s-.7-1.6-1.8-1.6h-3v3.2Z" fill="currentColor" />
      <circle cx="23.5" cy="21.5" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function Brand({ size = 26 }: { size?: number }) {
  return (
    <span className="row gap-2" style={{ color: 'var(--text)', fontWeight: 700, letterSpacing: '-.02em' }}>
      <span style={{ color: 'var(--accent)' }}><BrandMark size={size} /></span>
      Revise AI
    </span>
  );
}
