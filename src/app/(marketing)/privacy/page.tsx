import type { Metadata } from 'next';
import { LegalPage } from '@/components/app/LegalPage';
export const metadata: Metadata = { title: 'Privacy policy' };

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy" updated="2 October 2026">
      <h2>What we collect</h2>
      <p>We collect the minimum needed to run the service: your email address, a name you choose, a password (stored only as a salted hash), your selected stage, curriculum, exam board and subjects, and the study records you create — notes, flashcards, quizzes, plans, conversations and uploaded documents.</p>
      <h2>What we do not collect</h2>
      <p>We do not ask for your date of birth, home address, school identifier, or payment card details. Payment happens in our Discord, not on this website. We do not infer sensitive personal characteristics from your learning behaviour.</p>
      <h2>How we use it</h2>
      <p>To authenticate you, personalise tutoring to your curriculum, generate study material, show your own progress, prevent abuse, and meet legal obligations. Essential service messages (such as a password reset) are separate from any marketing permission.</p>
      <h2>AI processing</h2>
      <p>When you ask the tutor a question, the prompt and the relevant study context are sent to our AI provider so it can answer. Your API credentials are never exposed to the browser. We do not use your content to build a marketing profile.</p>
      <h2>Your uploads</h2>
      <p>Documents and images you upload belong to you, are scoped to your account, and cannot be retrieved by another user. Ask us to delete them, or delete your account, and they are removed.</p>
      <h2>Your rights</h2>
      <p>You can export your data and delete your account from Settings. Export gives you a structured copy of your profile, notes, flashcards, quizzes, sessions, plans and conversations. Deletion is irreversible, revokes your sessions, cancels background jobs and removes your files. We retain only the purchase and fulfilment references that law requires, with the minimum necessary detail.</p>
      <h2>Younger learners</h2>
      <p>Revise AI is designed for supervised use by younger learners. A parent or guardian should read this policy before a young learner registers. We keep collection minimal and never display a learner&apos;s academic performance publicly.</p>
      <h2>Contact</h2>
      <p>Questions about privacy: use the contact form, or raise a ticket in the app under Account.</p>
    </LegalPage>
  );
}
