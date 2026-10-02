import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/ui/primitives';
import { getPremiumProduct } from '@/server/premium/product';

export const metadata: Metadata = { title: 'FAQ', description: 'Answers to common questions about Revise AI.' };

export default async function FaqPage() {
  const p = getPremiumProduct();
  const faqs: [string, string][] = [
    ['Is Revise AI affiliated with any exam board?', 'No. Revise AI is an independent product. Board names are used only to identify curricula, and nothing here implies endorsement.'],
    ['Does the AI know my exact specification?', 'Only where a verified specification has been attached to the topic, or where you upload your own material. Otherwise the answer is general, and the tutor says so.'],
    ['Can it guarantee my grade?', 'No, and any tool that claims to should be treated with suspicion. Revise AI helps you understand and practise; outcomes depend on you and on the exam.'],
    ['Is AI marking the same as an examiner?', 'No. Where you supply a mark scheme or rubric, feedback is aligned to it. Without one, feedback is explicitly labelled general.'],
    ['How much does Premium cost?', `${p.displayPrice}, one-time. You buy a key in the Discord and redeem it here — this website never takes card details.`],
    ['Do you keep my uploaded files?', 'Your uploads belong to you, are scoped to your account, and are deleted when you ask us to delete them or your account.'],
    ['What happens if the AI service is down?', 'Your notes, library, history and progress stay available. AI features show a clear unavailable state and can be retried later.'],
    ['Do you use my data to train models?', 'No. Prompts are sent to the AI provider to answer you, and are not used to build a marketing profile of you.'],
    ['Is there an age gate?', 'The platform is designed for supervised use by younger learners, with minimal data collection and a clear privacy notice. Guardians should read the privacy policy before a young learner registers.'],
    ['Can I export or delete my data?', 'Yes — export and account deletion are in Settings. Deletion is irreversible and revokes your sessions.']
  ];
  return (
    <div className="container-x" style={{ paddingBlock: '3.5rem', maxWidth: 860 }}>
      <Reveal><SectionHeading eyebrow="FAQ" title="Questions we get asked" /></Reveal>
      <div style={{ marginTop: '2.5rem', display: 'grid', gap: '.8rem' }}>
        {faqs.map(([q, a], i) => (
          <Reveal key={q} delay={Math.min(i, 8) * 50}>
            <details className="card" style={{ padding: '1rem 1.2rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '.95rem', listStyle: 'none' }} className="row spread">
                {q}<span aria-hidden="true" className="faint">+</span>
              </summary>
              <p className="muted" style={{ marginTop: '.7rem', fontSize: '.9rem', lineHeight: 1.7 }}>{a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
