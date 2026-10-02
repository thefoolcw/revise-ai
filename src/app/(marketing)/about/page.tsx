import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/ui/primitives';
export const metadata: Metadata = { title: 'About', description: 'What Revise AI is and the principles it is built on.' };

export default function About() {
  const principles = [
    ['Be honest about uncertainty', 'A tutor that says "I am not sure" is more useful than one that invents an answer.'],
    ['Never invent curriculum', 'If we have not verified a specification, we say the topic tree is illustrative rather than implying authority.'],
    ['Show the working', 'Every metric states how it was calculated. Every plan item states why it was scheduled.'],
    ['Do not shame learners', 'Missing a review or a session adjusts the schedule. It never becomes a guilt mechanic.'],
    ['Keep data minimal', 'We ask for what the service needs and nothing more.'],
    ['Keep AI in its place', 'The model explains. Deterministic code computes, validates and schedules.']
  ];
  return (
    <div className="container-x" style={{ paddingBlock: '3.5rem' }}>
      <Reveal><SectionHeading eyebrow="About" title="A revision tool that respects your intelligence" lede="Revise AI exists because most study tools either oversell AI or bury it in a static content library. We wanted the useful parts of both, with honest edges." /></Reveal>
      <div style={{ marginTop: '2.75rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))' }}>
        {principles.map(([t, b], i) => (
          <Reveal key={t} delay={i * 65}>
            <div className="card card-pad" style={{ height: '100%' }}>
              <h2 className="h3" style={{ marginBottom: '.4rem', color: 'var(--accent)' }}>{t}</h2>
              <p className="muted" style={{ fontSize: '.89rem', lineHeight: 1.65 }}>{b}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={420}>
        <div className="card card-pad" style={{ marginTop: '2.5rem' }}>
          <h2 className="h3" style={{ marginBottom: '.5rem' }}>What this site does not claim</h2>
          <p className="muted" style={{ fontSize: '.9rem', lineHeight: 1.7 }}>
            There are no user counts, testimonials, awards or partner logos on this site that we cannot
            substantiate. Where a number appears, it is counted live from our own database and labelled as such.
            Company registration details are not published here because they have not been configured — we do not
            invent them.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
