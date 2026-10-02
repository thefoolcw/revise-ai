'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Alert } from '@/components/ui/primitives';
import { post, get, ApiRequestError } from '@/lib/client';

type State = 'ENTER_KEY' | 'VERIFYING' | 'VERIFIED' | 'INVALID' | 'EXPIRED' | 'REVOKED' | 'ALREADY_USED' | 'SERVICE_UNAVAILABLE' | 'UNAUTHORIZED';

/**
 * Redemption UI. The key is held in component state only — never localStorage,
 * never a URL. Premium state is always re-read from the server after a result.
 */
export function RedeemWidget({ product, authed }: {
  product: { displayPrice: string; discord: { inviteUrl: string; configured: boolean; pricingChannel: string; buyChannel: string } };
  authed: boolean;
}) {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [state, setState] = useState<State>('ENTER_KEY');
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    if (!authed) { setState('UNAUTHORIZED'); return; }
    setState('VERIFYING');
    setMessage('Verifying…');
    try {
      const r = await post<{ state: State; message: string; keyHint?: string | null; premium: { active: boolean } }>('/api/premium/redeem', { key });
      setState(r.state);
      setMessage(r.message);
      setHint(r.keyHint ?? null);
      if (r.state === 'VERIFIED') {
        setKey(''); // do not keep the key around after success
        router.refresh();
      }
    } catch (ex) {
      if (ex instanceof ApiRequestError && ex.code === 'UNAUTHORIZED') setState('UNAUTHORIZED');
      else if (ex instanceof ApiRequestError && ex.code === 'RATE_LIMIT') { setState('SERVICE_UNAVAILABLE'); setMessage(ex.message); }
      else if (ex instanceof ApiRequestError && ex.code === 'VALIDATION_ERROR') { setState('ENTER_KEY'); setFieldError(ex.fieldErrors?.key ?? ex.message); }
      else { setState('SERVICE_UNAVAILABLE'); setMessage(ex instanceof Error ? ex.message : 'Verification failed.'); }
    }
  };

  const tone = state === 'VERIFIED' ? 'success' : ['INVALID', 'EXPIRED', 'REVOKED', 'ALREADY_USED'].includes(state) ? 'danger'
    : state === 'SERVICE_UNAVAILABLE' || state === 'UNAUTHORIZED' ? 'warning' : 'info';

  return (
    <div className="card" style={{ padding: '2rem 1.75rem' }}>
      <h1 className="h2" style={{ marginBottom: '.4rem' }}>Redeem Premium Key</h1>
      <p className="muted" style={{ fontSize: '.92rem', lineHeight: 1.6 }}>
        Enter your Revise AI Premium key to activate Premium on your account.
      </p>

      {!authed && (
        <div style={{ marginTop: '1.25rem' }}>
          <Alert tone="warning" title="Sign in first">
            A Premium key is bound to the account that redeems it.{' '}
            <Link href="/login?next=/redeem" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link> or{' '}
            <Link href="/signup?next=/redeem" style={{ color: 'var(--accent)', fontWeight: 600 }}>create an account</Link>.
          </Alert>
        </div>
      )}

      {state !== 'ENTER_KEY' && (
        <div style={{ marginTop: '1.25rem' }} className={state === 'VERIFIED' ? 'anim-success' : 'anim-fade-in'}>
          <Alert tone={tone as any} title={state === 'VERIFIED' ? 'Premium Activated' : state === 'VERIFYING' ? 'Verifying' : undefined}>
            {message}{hint && state !== 'VERIFIED' ? ` (key ${hint})` : ''}
          </Alert>
        </div>
      )}

      <form onSubmit={submit} className="stack gap-3" style={{ marginTop: '1.4rem' }}>
        <Input
          label="Premium key" name="key" required
          placeholder="XXXX-XXXX-XXXX-XXXX"
          autoComplete="off" spellCheck={false}
          maxLength={256}
          value={key} error={fieldError}
          disabled={!authed || state === 'VERIFYING'}
          onChange={(e) => { setKey(e.target.value); if (state !== 'ENTER_KEY') setState('ENTER_KEY'); }}
          hint="Keys are verified server-side. We store only a hash and the last four characters."
        />
        <Button type="submit" loading={state === 'VERIFYING'} disabled={!authed} block>
          {state === 'VERIFYING' ? 'Verifying…' : 'Verify Key'}
        </Button>
      </form>

      <div className="hairline" style={{ marginTop: '1.6rem', paddingTop: '1.25rem' }}>
        <p style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.4rem' }}>Need a key?</p>
        <p className="muted" style={{ fontSize: '.88rem', lineHeight: 1.65 }}>
          Join our Discord to buy a premium key for {product.displayPrice}. Read {product.discord.pricingChannel} and{' '}
          {product.discord.buyChannel}, then follow the current purchase instructions.
        </p>
        {product.discord.configured ? (
          <a href={product.discord.inviteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ marginTop: '.8rem' }}>
            Join Discord
          </a>
        ) : (
          <p className="faint" style={{ fontSize: '.8rem', marginTop: '.7rem' }}>
            The Discord invite link is not configured on this server, so we cannot show a destination.
          </p>
        )}
      </div>

      <p className="faint" style={{ fontSize: '.76rem', marginTop: '1.25rem', lineHeight: 1.6 }}>
        One key can only be redeemed once, ever. If the key service is unavailable we will tell you and your key
        will not be consumed.
      </p>
    </div>
  );
}
