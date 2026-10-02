import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/ui/primitives';

export const metadata: Metadata = { title: 'Features', description: 'AI tutoring, question solving, quizzes, flashcards, revision planning, document study and progress analytics.' };

const GROUPS = [
  { title: 'Learn', items: [
    ['AI tutor with modes', 'Explain, teach from basics, step-by-step, hint only, practise, check my answer, mark my answer, summarise and exam mode.'],
    ['Model choice', 'Pick from the models Revise AI can actually reach, with task-fit labels rather than invented rankings.'],
    ['Honest uncertainty', 'The tutor distinguishes a general explanation from a board-specific requirement and says which it is giving.'],
    ['Memory controls', 'This chat only, remember study preferences, or forget the conversation.']
  ]},
  { title: 'Practise', items: [
    ['Universal solver', 'Typed, pasted or photographed questions. Worked steps, a check, the common mistake and an exam tip.'],
    ['Verified arithmetic', 'Calculations run through a deterministic calculator; the model explains rather than guesses the number.'],
    ['Quiz engine', 'Multiple choice, multi-select, true/false, short answer and numeric — each validated before it reaches you.'],
    ['Flashcards', 'SM-2 spaced repetition with Again / Hard / Good / Easy, generated from a topic, your notes or your mistakes.']
  ]},
  { title: 'Plan and track', items: [
    ['Revision planner', 'Allocates sessions from your target date, weekly hours and real accuracy, with spaced recall built in.'],
    ['Focus sessions', 'Timed study with a single objective, then a short check-in that updates your plan.'],
    ['Progress analytics', 'Study minutes, accuracy, mastery by topic, retention and plan completion — each with its calculation shown.'],
    ['Weak-area targeting', 'Repeated mistakes on a topic increase its allocation automatically.']
  ]},
  { title: 'Work with your material', items: [
    ['Document study', 'Upload your own notes or lecture PDFs; answers cite the document and page.'],
    ['Notes library', 'Rich notes with AI actions that create a new version rather than overwriting your writing.'],
    ['Marking and feedback', 'Mark against a rubric you supply; without one, feedback is labelled general rather than posed as an examiner grade.'],
    ['Source provenance', 'Board-specific answers prefer verified sources, then your material, then say the answer is general.']
  ]}
];

export default function FeaturesPage() {
  return (
    <div className="container-x" style={{ paddingBlock: '3.5rem' }}>
      <Reveal><SectionHeading eyebrow="Features" title="Everything in the revision loop" lede="Learn, practise, recall, plan and review — with the AI kept honest about what it knows." /></Reveal>
      <div style={{ marginTop: '3rem', display: 'grid', gap: '2.5rem' }}>
        {GROUPS.map((g, gi) => (
          <Reveal key={g.title} delay={gi * 60}>
            <h2 className="h2" style={{ marginBottom: '1.1rem', color: 'var(--accent)' }}>{g.title}</h2>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))' }}>
              {g.items.map(([t, b]) => (
                <div key={t} className="card card-pad">
                  <h3 className="h3" style={{ marginBottom: '.35rem' }}>{t}</h3>
                  <p className="muted" style={{ fontSize: '.88rem', lineHeight: 1.65 }}>{b}</p>
                </div>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
