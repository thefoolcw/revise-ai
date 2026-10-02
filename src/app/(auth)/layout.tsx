import Link from 'next/link';
import { Brand } from '@/components/app/Brand';
import { ThemeToggle } from '@/components/app/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '2rem 1.25rem', position: 'relative', overflow: 'hidden' }}>
      <div className="ambient" aria-hidden="true" />
      <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', right: '1.25rem', zIndex: 2 }}>
        <div className="row spread">
          <Link href="/" style={{ textDecoration: 'none' }}><Brand /></Link>
          <ThemeToggle />
        </div>
      </div>
      <main id="main" className="anim-fade-up" style={{ width: '100%', maxWidth: 430, position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
}
