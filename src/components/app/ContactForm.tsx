'use client';
import { useState } from 'react';
import { Button, Input, Textarea, Select, Alert } from '@/components/ui/primitives';
import { post } from '@/lib/client';

const CATS = ['Premium / Keys', 'Account', 'AI', 'Documents', 'Curriculum', 'Feature request', 'Bug', 'Abuse/safety', 'Other'] as const;

export function ContactForm({ authed }: { authed: boolean }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [fields, setFields] = useState({ subject: '', category: 'Other' as string, message: '' });

  if (!authed) {
    return (
      <Alert tone="info" title="Sign in to send a message">
        Support tickets are attached to an account so we can see the context and reply.{' '}
        <a href="/login?next=/contact" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</a> or{' '}
        <a href="/signup?next=/contact" style={{ color: 'var(--accent)', fontWeight: 600 }}>create an account</a>.
      </Alert>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    try {
      await post('/api/support', fields);
      setState('sent');
      setFields({ subject: '', category: 'Other', message: '' });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setState('error');
    }
  };

  return (
    <form onSubmit={submit} className="stack gap-3">
      {state === 'sent' && <Alert tone="success" title="Message sent">We will reply to the address on your account.</Alert>}
      {state === 'error' && <Alert tone="danger" title="Could not send">{msg}</Alert>}
      <Input label="Subject" name="subject" required minLength={3} maxLength={140} value={fields.subject}
        onChange={(e) => setFields({ ...fields, subject: e.target.value })} />
      <Select label="Category" name="category" value={fields.category} onChange={(e) => setFields({ ...fields, category: e.target.value })}>
        {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
      </Select>
      <Textarea label="Message" name="message" required minLength={10} maxLength={6000} value={fields.message}
        onChange={(e) => setFields({ ...fields, message: e.target.value })}
        hint="Do not include passwords, API keys or Premium keys." />
      <Button type="submit" loading={state === 'sending'}>Send message</Button>
    </form>
  );
}
