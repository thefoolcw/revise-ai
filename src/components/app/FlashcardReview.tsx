'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Alert, ProgressBar, EmptyState } from '@/components/ui/primitives';
import { get, post, ApiRequestError } from '@/lib/client';
import { useToast } from './Toaster';

type Deck = { id: string; name: string; cardCount: number; dueCount: number };
type Card = { id: string; front: string; back: string; hint: string | null; deckId: string; repetitions: number };

const RATINGS: ['AGAIN' | 'HARD' | 'GOOD' | 'EASY', string, string][] = [
  ['AGAIN', 'Again', 'var(--danger)'], ['HARD', 'Hard', 'var(--warning)'],
  ['GOOD', 'Good', 'var(--accent)'], ['EASY', 'Easy', 'var(--success)']
];

export function FlashcardReview() {
  const router = useRouter();
  const toast = useToast();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deckId, setDeckId] = useState('');
  const [card, setCard] = useState<Card | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [genForm, setGenForm] = useState({ topicTitle: '', sourceText: '', count: '10' });
  const [generating, setGenerating] = useState(false);

  const loadDecks = useCallback(async () => {
    try { const r = await get<{ decks: Deck[] }>('/api/flashcards/decks'); setDecks(r.decks); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load decks.'); }
  }, []);

  useEffect(() => { void loadDecks(); }, [loadDecks]);

  const nextCard = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const r = await get<{ due: Card[] }>('/api/flashcards/review?deckId=' + encodeURIComponent(id));
      setCard(r.due[0] ?? null); setFlipped(false);
      if (!r.due[0] && done > 0) toast.push('Deck cleared — nothing else is due yet.', 'success');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load cards.'); }
  }, [done, toast]);

  useEffect(() => { if (deckId) void nextCard(deckId); }, [deckId, nextCard]);

  const createDeck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value.trim();
    if (!name) return;
    await post('/api/flashcards/decks', { name });
    await loadDecks();
    toast.push('Deck created', 'success');
  };

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId) return;
    setGenerating(true);
    try {
      const r = await post<{ added: number; rejected: number }>('/api/flashcards/generate', {
        deckId, count: Number(genForm.count),
        ...(genForm.topicTitle ? { topicTitle: genForm.topicTitle } : {}),
        ...(genForm.sourceText ? { sourceText: genForm.sourceText } : {})
      });
      toast.push(`${r.added} cards added${r.rejected ? ` · ${r.rejected} rejected as invalid` : ''}`, 'success');
      await loadDecks();
      await nextCard(deckId);
    } catch (ex) {
      setError(ex instanceof ApiRequestError ? ex.message : 'Could not generate cards.');
    } finally { setGenerating(false); }
  };

  const rate = async (rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => {
    if (!card) return;
    setBusy(true);
    try {
      const r = await post<{ next: { intervalDays: number }; dueAt: string }>('/api/flashcards/review', { cardId: card.id, rating });
      setDone((d) => d + 1);
      setCard(null); setFlipped(false);
      await nextCard(deckId);
      void r;
    } catch (ex) {
      setError(ex instanceof ApiRequestError ? ex.message : 'Could not save that review.');
    } finally { setBusy(false); }
  };

  const activeDeck = decks.find((d) => d.id === deckId) ?? null;

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Flashcards</h1>
        <p className="muted" style={{ fontSize: '.88rem', marginTop: '.25rem' }}>
          SM-2 spaced repetition. Generated cards are validated — duplicate fronts and leaked answers are discarded.
        </p>
      </header>

      {error && <Alert tone="danger" title="Something went wrong">{error}</Alert>}

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'start' }}>
        <div className="card card-pad stack gap-3">
          <h2 className="h3">Your decks</h2>
          {decks.length === 0
            ? <p className="faint" style={{ fontSize: '.84rem' }}>No decks yet.</p>
            : <div className="stack gap-2">
                {decks.map((d) => (
                  <button key={d.id} onClick={() => setDeckId(d.id)}
                    className="row spread"
                    style={{
                      width: '100%', textAlign: 'left', padding: '.7rem .8rem', borderRadius: 9, cursor: 'pointer',
                      border: `1px solid ${deckId === d.id ? 'var(--accent)' : 'var(--border)'}`,
                      background: deckId === d.id ? 'var(--accent-soft)' : 'var(--surface)',
                      transition: 'border-color 160ms linear, background-color 160ms linear'
                    }}>
                    <span style={{ fontSize: '.88rem', fontWeight: deckId === d.id ? 620 : 480 }}>{d.name}</span>
                    <span className="faint tnum" style={{ fontSize: '.76rem' }}>
                      {d.dueCount > 0 ? <strong style={{ color: 'var(--accent)' }}>{d.dueCount} due</strong> : `${d.cardCount} cards`}
                    </span>
                  </button>
                ))}
              </div>}
          <form onSubmit={createDeck} className="row gap-2" style={{ marginTop: '.4rem' }}>
            <Input label="" name="name" placeholder="New deck name" required minLength={2} maxLength={120} />
            <Button type="submit" variant="outline">Create</Button>
          </form>
        </div>

        <div className="card card-pad stack gap-3">
          <h2 className="h3">Generate cards</h2>
          {!deckId
            ? <p className="faint" style={{ fontSize: '.84rem' }}>Select a deck first.</p>
            : <form onSubmit={generate} className="stack gap-3">
                <Input label="Topic" name="topicTitle" maxLength={160} value={genForm.topicTitle}
                  onChange={(e) => setGenForm({ ...genForm, topicTitle: e.target.value })} placeholder="e.g. Cell division" />
                <Select label="How many" name="count" value={genForm.count} onChange={(e) => setGenForm({ ...genForm, count: e.target.value })}>
                  {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
                <Button type="submit" loading={generating} block>Generate</Button>
                <p className="faint" style={{ fontSize: '.74rem' }}>
                  Or paste your own notes below and cards will be built from your material instead.
                </p>
                <textarea value={genForm.sourceText} onChange={(e) => setGenForm({ ...genForm, sourceText: e.target.value })}
                  rows={3} maxLength={12000} placeholder="Paste notes (optional, up to 12,000 characters)"
                  style={{ width: '100%', padding: '.55rem .65rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '.84rem', resize: 'vertical' }} />
              </form>}
        </div>
      </div>

      {deckId && (
        <div className="card card-pad">
          <div className="row spread wrap gap-2" style={{ marginBottom: '1rem' }}>
            <h2 className="h3">{activeDeck?.name} — review</h2>
            {done > 0 && <span className="chip chip-accent tnum">{done} reviewed</span>}
          </div>

          {!card ? (
            <EmptyState title="Nothing due" body="Every card in this deck is scheduled for later. Spaced repetition works because you come back at the right time, not because you cram."
              action={<Button variant="outline" onClick={() => void loadDecks()}>Refresh</Button>} />
          ) : (
            <>
              <div className="flip-stage" style={{ minHeight: 240 }}>
                <div className="flip-card" data-flipped={flipped} style={{ minHeight: 240 }}
                  onClick={() => setFlipped((f) => !f)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped((f) => !f); } }}
                  role="button" tabIndex={0} aria-label="Flip card">
                  <div className="flip-face card card-pad" style={{ display: 'grid', placeItems: 'center', minHeight: 240, textAlign: 'center' }}>
                    <div>
                      <p className="faint" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.6rem' }}>Question</p>
                      <p style={{ fontSize: '1.12rem', lineHeight: 1.55, fontWeight: 560 }}>{card.front}</p>
                      {card.hint && <p className="faint" style={{ fontSize: '.8rem', marginTop: '.7rem' }}>Hint: {card.hint}</p>}
                      <p className="faint" style={{ fontSize: '.72rem', marginTop: '1rem' }}>Tap or press Enter to reveal</p>
                    </div>
                  </div>
                  <div className="flip-face flip-face-back card card-pad" style={{ display: 'grid', placeItems: 'center', minHeight: 240, textAlign: 'center' }}>
                    <div>
                      <p className="faint" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.6rem' }}>Answer</p>
                      <p style={{ fontSize: '1.06rem', lineHeight: 1.6 }}>{card.back}</p>
                      <p className="faint" style={{ fontSize: '.72rem', marginTop: '1rem' }}>Seen {card.repetitions} {card.repetitions === 1 ? 'time' : 'times'} before</p>
                    </div>
                  </div>
                </div>
              </div>

              {flipped ? (
                <div className="row gap-2 wrap" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                  {RATINGS.map(([id, label, colour]) => (
                    <button key={id} onClick={() => void rate(id)} disabled={busy}
                      style={{
                        padding: '.55rem 1.1rem', borderRadius: 9, border: `1px solid ${colour}`,
                        background: 'transparent', color: colour, fontWeight: 600, fontSize: '.86rem', cursor: 'pointer',
                        transition: 'background-color 160ms linear, transform 200ms cubic-bezier(.34,1.4,.5,1)'
                      }}>{label}</button>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <Button variant="outline" onClick={() => setFlipped(true)}>Show answer</Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
