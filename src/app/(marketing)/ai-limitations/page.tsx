import type { Metadata } from 'next';
import { LegalPage } from '@/components/app/LegalPage';
export const metadata: Metadata = { title: 'AI limitations', description: 'What Revise AI can and cannot do.' };

export default function AiLimitations() {
  return (
    <LegalPage title="AI limitations" updated="2 October 2026">
      <h2>AI can make mistakes</h2>
      <p>Large language models generate plausible text, not guaranteed facts. Revise AI mitigates this with deterministic calculators for arithmetic, validation for generated questions and flashcards, and source grounding where a specification exists — but it cannot eliminate error.</p>
      <h2>Verify important facts</h2>
      <p>Before an exam, check anything important against your official specification, textbook and past mark schemes. If the tutor is unsure it will say so; treat confident-sounding answers with the same care.</p>
      <h2>Not an examiner</h2>
      <p>AI feedback is not an official examiner result. Where you supply a mark scheme or rubric, feedback is aligned to it. Where you do not, feedback is labelled general. Grade boundaries vary by series and are never invented.</p>
      <h2>Exam-board requirements change</h2>
      <p>Specifications are revised. Revise AI topic trees are marked illustrative until an administrator attaches a verified specification with a source and version — the interface says which one you are looking at.</p>
      <h2>No affiliation</h2>
      <p>Revise AI is not automatically affiliated with any named board or university. Board names identify curricula only.</p>
      <h2>What we do instead of guessing</h2>
      <ul>
        <li>Arithmetic runs through a deterministic calculator rather than model arithmetic.</li>
        <li>Generated quiz questions are validated: the correct answer must exist, options must be unique, and the answer must not leak into the prompt.</li>
        <li>Generated flashcards are checked for duplicate fronts and answer leakage.</li>
        <li>Analytics hide percentages until there is enough data to be meaningful.</li>
        <li>Document answers cite the document and page, or state that the answer came from general knowledge.</li>
      </ul>
    </LegalPage>
  );
}
