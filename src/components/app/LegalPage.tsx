import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion/Reveal';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="container-x" style={{ paddingBlock: '3.5rem', maxWidth: 780 }}>
      <Reveal>
        <p className="eyebrow" style={{ marginBottom: '.5rem' }}>Legal</p>
        <h1 className="h1">{title}</h1>
        <p className="faint" style={{ fontSize: '.82rem', marginTop: '.5rem' }}>Last updated {updated}</p>
      </Reveal>
      <div className="prose-ai" style={{ marginTop: '2rem', fontSize: '.94rem' }}>
        {children}
      </div>
    </div>
  );
}
