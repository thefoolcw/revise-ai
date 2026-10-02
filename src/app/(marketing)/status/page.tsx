import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/ui/primitives';
import { StatusBoard } from '@/components/app/StatusBoard';
export const metadata: Metadata = { title: 'Status', description: 'Live component health for Revise AI.' };

export default function StatusPage() {
  return (
    <div className="container-x" style={{ paddingBlock: '3.5rem', maxWidth: 720 }}>
      <Reveal><SectionHeading eyebrow="Status" title="Service health" lede="Live component status, polled from the health API every minute." /></Reveal>
      <Reveal delay={80}><div style={{ marginTop: '2rem' }}><StatusBoard /></div></Reveal>
      <Reveal delay={140}>
        <p className="faint" style={{ fontSize: '.8rem', marginTop: '1.25rem' }}>
          We do not publish uptime percentages until we have enough real history to report them honestly.
          Incident notices will appear here when a component is degraded.
        </p>
      </Reveal>
    </div>
  );
}
