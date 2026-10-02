import { Reveal } from '@/components/motion/Reveal';
import { CountUp } from '@/components/motion/CountUp';
import { ProgressBar } from '@/components/ui/primitives';
import { getCurrentUser } from '@/server/auth/session';
import { getUsageSnapshot } from '@/server/usage/ledger';

export const metadata = { title: 'Usage' };
export const dynamic = 'force-dynamic';

export default async function UsagePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const u = await getUsageSnapshot(user.id);

  const rows: [string, { used: number; limit: number; remaining: number }][] = [
    ['AI requests', u.aiRequests], ['Quiz generations', u.quizGeneration],
    ['Flashcard generations', u.flashcardGeneration], ['Document pages', u.documentPages]
  ];

  return (
    <div className="stack gap-5">
      <Reveal>
        <header>
          <h1 className="h2">Usage</h1>
          <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
            Counted server-side from the usage ledger. Resets {new Date(u.resetsAt).toLocaleString('en-GB')}.
          </p>
        </header>
      </Reveal>

      <Reveal delay={60}>
        <div style={{ display: 'grid', gap: '.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))' }}>
          <div className="card card-pad">
            <p className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Plan</p>
            <p className="h2" style={{ marginTop: '.25rem' }}>{u.premium ? 'Premium' : 'Free'}</p>
            <p className="faint" style={{ fontSize: '.74rem', marginTop: '.3rem' }}>{u.source.replace(/_/g, ' ').toLowerCase()}</p>
          </div>
          <div className="card card-pad">
            <p className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Tokens today (in)</p>
            <p className="h2 tnum" style={{ marginTop: '.25rem' }}>{u.tokensToday.input === null ? '—' : <CountUp value={u.tokensToday.input} />}</p>
          </div>
          <div className="card card-pad">
            <p className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Tokens today (out)</p>
            <p className="h2 tnum" style={{ marginTop: '.25rem' }}>{u.tokensToday.output === null ? '—' : <CountUp value={u.tokensToday.output} />}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="card card-pad stack gap-4">
          <h2 className="h3">Today&apos;s limits</h2>
          {rows.map(([label, m]) => (
            <div key={label}>
              <div className="row spread" style={{ fontSize: '.88rem' }}>
                <span style={{ fontWeight: 540 }}>{label}</span>
                <span className="tnum faint">{m.used} of {m.limit} used · {m.remaining} left</span>
              </div>
              <div style={{ marginTop: '.35rem' }}><ProgressBar value={m.used} max={m.limit} label={`${label} used today`} /></div>
            </div>
          ))}
          <p className="faint" style={{ fontSize: '.76rem' }}>
            Token figures are reported only when the model returns them. A dash means the provider did not report
            a count for those calls — it is not a zero.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
