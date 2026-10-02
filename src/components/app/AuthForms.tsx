'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Alert } from '@/components/ui/primitives';
import { post, ApiRequestError } from '@/lib/client';

function useNext() {
  const p = useSearchParams();
  const next = p.get('next');
  // Only allow same-site relative paths — never an open redirect.
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/app';
}

export function LoginForm() {
  const router = useRouter();
  const next = useNext();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null); setFields({});
    try {
      await post('/api/auth/login', f);
      router.push(next); router.refresh();
    } catch (ex) {
      if (ex instanceof ApiRequestError && ex.fieldErrors) setFields(ex.fieldErrors);
      else setErr(ex instanceof Error ? ex.message : 'Sign in failed.');
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem 1.75rem' }}>
      <h1 className="h2" style={{ marginBottom: '.35rem' }}>Welcome back</h1>
      <p className="muted" style={{ fontSize: '.9rem', marginBottom: '1.5rem' }}>Sign in to continue revising.</p>
      {err && <Alert tone="danger" title="Could not sign in">{err}</Alert>}
      <form onSubmit={submit} className="stack gap-3" style={{ marginTop: err ? '1rem' : 0 }}>
        <Input label="Email" name="email" type="email" autoComplete="email" required
          value={f.email} error={fields.email}
          onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Input label="Password" name="password" type="password" autoComplete="current-password" required
          value={f.password} error={fields.password}
          onChange={(e) => setF({ ...f, password: e.target.value })} />
        <Button type="submit" loading={busy} block>Sign in</Button>
      </form>
      <div className="row spread" style={{ marginTop: '1.1rem', fontSize: '.86rem' }}>
        <Link href="/forgot-password" style={{ color: 'var(--text-muted)' }}>Forgot password?</Link>
        <Link href="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create an account</Link>
      </div>
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const next = useNext();
  const [f, setF] = useState({ displayName: '', email: '', password: '' });
  const [err, setErr] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const strength = (() => {
    const p = f.password;
    if (!p) return null;
    let s = 0;
    if (p.length >= 10) s++;
    if (p.length >= 14) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p) || /[^\w]/.test(p)) s++;
    return Math.min(4, s);
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null); setFields({});
    try {
      await post('/api/auth/signup', f);
      router.push('/onboarding'); router.refresh();
    } catch (ex) {
      if (ex instanceof ApiRequestError && ex.fieldErrors) setFields(ex.fieldErrors);
      else setErr(ex instanceof Error ? ex.message : 'Could not create your account.');
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem 1.75rem' }}>
      <h1 className="h2" style={{ marginBottom: '.35rem' }}>Create your account</h1>
      <p className="muted" style={{ fontSize: '.9rem', marginBottom: '1.5rem' }}>
        Just a name, an email and a password. You set your curriculum next.
      </p>
      {err && <Alert tone="danger" title="Could not sign up">{err}</Alert>}
      <form onSubmit={submit} className="stack gap-3" style={{ marginTop: err ? '1rem' : 0 }}>
        <Input label="What should we call you?" name="displayName" required minLength={2} maxLength={60}
          autoComplete="given-name" value={f.displayName} error={fields.displayName}
          onChange={(e) => setF({ ...f, displayName: e.target.value })} />
        <Input label="Email" name="email" type="email" required autoComplete="email"
          value={f.email} error={fields.email}
          onChange={(e) => setF({ ...f, email: e.target.value })} />
        <div>
          <Input label="Password" name="password" type="password" required autoComplete="new-password"
            hint="At least 10 characters. Length matters more than symbols."
            value={f.password} error={fields.password}
            onChange={(e) => setF({ ...f, password: e.target.value })} />
          {strength !== null && (
            <div aria-hidden="true" className="row gap-1" style={{ marginTop: '.45rem' }}>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} style={{
                  flex: 1, height: 4, borderRadius: 99,
                  background: i < strength ? (strength <= 1 ? 'var(--danger)' : strength === 2 ? 'var(--warning)' : 'var(--success)') : 'var(--surface-3)',
                  transition: 'background-color 220ms'
                }} />
              ))}
              <span className="faint" style={{ fontSize: '.74rem', marginLeft: '.5rem' }}>
                {strength <= 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
              </span>
            </div>
          )}
        </div>
        <Button type="submit" loading={busy} block>Create account</Button>
      </form>
      <p className="faint" style={{ fontSize: '.78rem', marginTop: '1.1rem', lineHeight: 1.6 }}>
        By creating an account you agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy policy</Link>.
        If you are a younger learner, please have a parent or guardian read these first.
      </p>
      <p style={{ marginTop: '1rem', fontSize: '.86rem' }}>
        <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Already have an account? Sign in</Link>
      </p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (ex) { setErr(ex instanceof Error ? ex.message : 'Could not send that request.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="card" style={{ padding: '2rem 1.75rem' }}>
      <h1 className="h2" style={{ marginBottom: '.35rem' }}>Reset your password</h1>
      <p className="muted" style={{ fontSize: '.9rem', marginBottom: '1.5rem' }}>
        Enter your email and we will send a reset link if an account exists.
      </p>
      {sent ? (
        <Alert tone="info" title="Check your inbox">
          If an account exists for that address, a reset link is on its way. The link expires in 30 minutes.
        </Alert>
      ) : (
        <>
          {err && <Alert tone="danger" title="Could not send">{err}</Alert>}
          <form onSubmit={submit} className="stack gap-3" style={{ marginTop: err ? '1rem' : 0 }}>
            <Input label="Email" type="email" name="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" loading={busy} block>Send reset link</Button>
          </form>
        </>
      )}
      <p style={{ marginTop: '1.1rem', fontSize: '.86rem' }}>
        <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Back to sign in</Link>
      </p>
    </div>
  );
}
