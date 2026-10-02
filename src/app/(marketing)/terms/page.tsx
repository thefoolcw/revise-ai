import type { Metadata } from 'next';
import { LegalPage } from '@/components/app/LegalPage';
export const metadata: Metadata = { title: 'Terms of service' };

export default function Terms() {
  return (
    <LegalPage title="Terms of service" updated="2 October 2026">
      <h2>The service</h2>
      <p>Revise AI provides AI-assisted revision tools. It is a study aid, not a teaching qualification, an examination body, or a substitute for your school or course.</p>
      <h2>No affiliation</h2>
      <p>Revise AI is not affiliated with, endorsed by, or sponsored by AQA, Pearson Edexcel, OCR, WJEC, Eduqas, CCEA, SQA, Cambridge International, the International Baccalaureate, or any university. Board names identify curricula only.</p>
      <h2>AI output</h2>
      <p>AI output can be wrong. Revise AI feedback is not an official examiner result and no grade boundary is published unless sourced for the exact qualification and version. You are responsible for verifying important facts against your official specification and mark schemes.</p>
      <h2>Academic integrity</h2>
      <p>Revise AI is for learning. Do not submit AI-generated work as your own independent coursework where your institution requires original work. We provide coaching, explanation, planning and feedback — not ghostwriting.</p>
      <h2>Your content</h2>
      <p>You keep ownership of what you upload and create. You grant us the limited permission needed to store, process and display it to you, and to send relevant excerpts to our AI provider to answer your questions.</p>
      <h2>Premium</h2>
      <p>Premium is sold as a one-time key through our Discord, not on this website. Premium access is granted only after the key has been verified server-side. Keys are single-use and bound to the account that redeems them.</p>
      <h2>Acceptable use</h2>
      <p>Do not attempt to bypass entitlement checks, probe the service for vulnerabilities without permission, upload material you have no right to use, share another person&apos;s account, or use the service to generate abusive or unlawful content.</p>
      <h2>Availability</h2>
      <p>We aim for high availability but do not guarantee uninterrupted service. If a component fails, the rest of the platform stays usable and the affected feature shows a clear state.</p>
    </LegalPage>
  );
}
