'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Alert } from '@/components/ui/primitives';
import { ModelSelect } from './ModelSelect';
import { patch, post, del } from '@/lib/client';
import { useToast } from './Toaster';

export function SettingsForm({
  profile, boardName, qualName
}: {
  profile: { displayName: string; explainLevel: string; defaultModelId: string | null };
  boardName: string | null; qualName: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState({ displayName: profile.displayName, explainLevel: profile.explainLevel });
  const [modelId, setModelId] = useState(profile.defaultModelId ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dangerOpen, setDangerOpen] = useState(false);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await patch('/api/me', { displayName: f.displayName, explainLevel: f.explainLevel, defaultModelId: modelId || null });
      toast.push('Settings saved', 'success');
      router.refresh();
    } catch (ex) { setError(ex instanceof Error ? ex.message : 'Could not save.'); }
    finally { setBusy(false); }
  };

  const exportData = async () => {
    try {
      const r = await fetch('/api/me/export', { credentials: 'same-origin' });
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'revise-ai-export.json'; a.click();
      URL.revokeObjectURL(url);
      toast.push('Export started', 'success');
    } catch { setError('Could not export your data.'); }
  };

  const deleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const confirmText = (e.currentTarget.elements.namedItem('confirmText') as HTMLInputElement).value;
    if (confirmText !== 'DELETE') { setError('Type DELETE exactly to confirm.'); return; }
    setBusy(true);
    try {
      await del('/api/me');
      window.location.href = '/';
    } catch (ex) { setError(ex instanceof Error ? ex.message : 'Could not delete your account.'); setBusy(false); }
  };

  return (
    <div className="stack gap-4">
      {error && <Alert tone="danger" title="Something went wrong">{error}</Alert>}

      <form onSubmit={save} className="card card-pad stack gap-3">
        <h2 className="h3">Profile</h2>
        <Input label="Display name" name="displayName" required minLength={2} maxLength={60}
          value={f.displayName} onChange={(e) => setF({ ...f, displayName: e.target.value })} />
        <Select label="Explanation depth" name="explainLevel" value={f.explainLevel}
          onChange={(e) => setF({ ...f, explainLevel: e.target.value })}>
          {[['SIMPLE', 'Simple — plain language, fewer terms'], ['STANDARD', 'Standard'], ['DETAILED', 'Detailed — full working and caveats'], ['UNIVERSITY', 'University — assume prior knowledge']]
            .map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        <div className="hairline" />
        <p className="faint" style={{ fontSize: '.8rem' }}>
          Curriculum: {boardName ?? 'no exam board selected'}
          {qualName ? ` · ${qualName}` : ''}. Change it under{' '}
          <a href="/app/learn" style={{ color: 'var(--accent)', fontWeight: 600 }}>Curriculum</a>.
        </p>
        <ModelSelect task="CHAT" value={modelId} onChange={setModelId} label="Default model" />
        <div><Button type="submit" loading={busy}>Save changes</Button></div>
      </form>

      <div className="card card-pad stack gap-2">
        <h2 className="h3">Your data</h2>
        <p className="muted" style={{ fontSize: '.86rem' }}>
          Export a structured copy of your profile, notes, flashcards, quizzes, sessions, plans and conversations.
        </p>
        <div><Button variant="outline" onClick={() => void exportData()}>Download my data</Button></div>
      </div>

      <div className="card card-pad stack gap-2" style={{ borderColor: 'var(--danger)' }}>
        <h2 className="h3" style={{ color: 'var(--danger)' }}>Delete account</h2>
        <p className="muted" style={{ fontSize: '.86rem' }}>
          This permanently removes your notes, cards, quizzes, plans, conversations and uploaded files, revokes
          every session, and cancels any queued jobs. It cannot be undone. Purchase and fulfilment references
          required by law are retained with the minimum necessary detail.
        </p>
        {!dangerOpen
          ? <div><Button variant="ghost" onClick={() => setDangerOpen(true)}>Delete my account…</Button></div>
          : <form onSubmit={deleteAccount} className="stack gap-3">
              <Input label="Type DELETE to confirm" name="confirmText" required
                value="" onChange={() => {}} />
              <Button type="submit" loading={busy}>Permanently delete</Button>
            </form>}
      </div>

      <div className="card card-pad stack gap-2">
        <h2 className="h3">Sign out everywhere</h2>
        <p className="muted" style={{ fontSize: '.86rem' }}>Revokes every active session on every device.</p>
        <div>
          <Button variant="outline" onClick={async () => {
            try { await post('/api/auth/logout-all'); toast.push('All sessions revoked', 'success'); }
            catch { setError('Could not revoke your sessions.'); }
          }}>Revoke all sessions</Button>
        </div>
      </div>
    </div>
  );
}
