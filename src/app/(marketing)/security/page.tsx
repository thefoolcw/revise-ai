import type { Metadata } from 'next';
import { LegalPage } from '@/components/app/LegalPage';
export const metadata: Metadata = { title: 'Security' };

export default function Security() {
  return (
    <LegalPage title="Security" updated="2 October 2026">
      <h2>How we protect the service</h2>
      <ul>
        <li><strong>Credentials stay server-side.</strong> AI provider and key-provider API keys are never sent to the browser, never placed in client bundles, and never written to logs.</li>
        <li><strong>Passwords are hashed</strong> with scrypt using a unique per-user salt and compared in constant time.</li>
        <li><strong>Sessions are opaque tokens</strong> stored as SHA-256 hashes in HttpOnly, SameSite cookies. Revoking a session invalidates it immediately.</li>
        <li><strong>Authorization is server-side.</strong> Role and entitlement checks run on every protected route; the UI is never the boundary.</li>
        <li><strong>Premium keys are never stored.</strong> We keep a SHA-256 hash and a four-character hint, with a unique constraint so one key can only ever be redeemed once.</li>
        <li><strong>Prompt injection is treated as a data problem.</strong> Retrieved document text is passed inside explicit source boundaries and is never allowed to override system instructions or authorise actions.</li>
        <li><strong>Rate limiting</strong> applies to login, signup, password reset, AI requests, uploads and key verification.</li>
        <li><strong>Validation everywhere.</strong> Every API route validates its input against a schema and returns a consistent error envelope without stack traces or internal details.</li>
      </ul>
      <h2>Reporting a vulnerability</h2>
      <p>Please report suspected vulnerabilities privately through the contact form rather than publicly. Do not test against other users&apos; accounts or data.</p>
    </LegalPage>
  );
}
