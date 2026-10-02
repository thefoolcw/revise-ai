import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/ui/primitives';

export const metadata: Metadata = { title: 'How it works', description: 'Set your curriculum, work on real questions, and let the planner adapt to what you get wrong.' };

const STEPS = [
  ['Set your context', 'Choose your stage, country, exam board and subjects. Revise AI only offers board and qualification combinations that actually exist.'],
  ['Work on real material', 'Ask the tutor, solve questions, upload your own notes or lecture slides. Everything is scoped to your account.'],
  ['Practise deliberately', 'Quizzes and flashcards are generated from your topics and scheduled with spaced repetition.'],
  ['Plan around your time', 'The planner allocates sessions from your target date and weekly hours, prioritising topics you actually get wrong.'],
  ['See what worked', 'Progress shows accuracy, retention and plan completion — with the calculation visible and small samples hidden.']
];

export default function HowItWorks() {
  return (
    <div className="container-x" style={{ paddingBlock: '3.5rem' }}>
      <Reveal><SectionHeading eyebrow="How it works" title="Five steps, then it adapts" /></Reveal>
      <ol style={{ marginTop: '2.75rem', display: 'grid', gap: '1rem', listStyle: 'none', padding: 0 }}>
        {STEPS.map(([t, b], i) => (
          <Reveal key={t} delay={i * 70}>
            <li className="card" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.1rem', padding: '1.25rem', alignItems: 'start' }}>
              <span aria-hidden="true" className="tnum" style={{ width: 38, height: 38, borderRadius: 11, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700 }}>{i + 1}</span>
              <div>
                <h2 className="h3" style={{ marginBottom: '.3rem' }}>{t}</h2>
                <p className="muted" style={{ fontSize: '.9rem', lineHeight: 1.65 }}>{b}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
      <Reveal delay={380}>
        <div className="row gap-3 wrap" style={{ marginTop: '2.5rem' }}>
          <Link href="/signup" className="btn btn-primary btn-lg">Create your account</Link>
          <Link href="/features" className="btn btn-outline btn-lg">See the full feature list</Link>
        </div>
      </Reveal>
    </div>
  );
}
