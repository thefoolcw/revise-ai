import { Reveal } from '@/components/motion/Reveal';
import { CountUp } from '@/components/motion/CountUp';
import { ProgressBar, Alert, EmptyState } from '@/components/ui/primitives';
import { getCurrentUser } from '@/server/auth/session';
import { computeProgress } from '@/server/study/progress';
import Link from 'next/link';

export const metadata = { title: 'Progress' };
export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const p = await computeProgress(user.id);

  const empty = p.questions.attempted === 0 && p.quizzes.attempts === 0 && p.flashcards.reviews === 0 && p.studyMinutes === 0;

  return (
    <div className="stack gap-5">
      <Reveal>
        <header>
          <h1 className="h2">Progress</h1>
          <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
            The last {p.windowDays} days, computed from your own records.
          </p>
        </header>
      </Reveal>

      {empty && (
        <EmptyState title="Nothing to measure yet"
          body="Answer a few questions, run a quiz or review some cards and real figures will appear here. We do not show estimates."
          action={<Link href="/app/quiz" className="btn btn-primary btn-sm">Create a quiz</Link>} />
      )}

      {!empty && (
        <>
          <Reveal delay={60}>
            <div style={{ display: 'grid', gap: '.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
              <div className="card card-pad">
                <p className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Study minutes</p>
                <p className="h2 tnum" style={{ marginTop: '.25rem' }}><CountUp value={p.studyMinutes} /></p>
              </div>
              <div className="card card-pad">
                <p className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Questions attempted</p>
                <p className="h2 tnum" style={{ marginTop: '.25rem' }}><CountUp value={p.questions.attempted} /></p>
                <p className="faint" style={{ fontSize: '.74rem', marginTop: '.3rem' }}>{p.questions.correct} correct</p>
              </div>
              <div className="card card-pad">
                <p className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Question accuracy</p>
                {p.questions.accuracyPercent === null
                  ? <p className="muted" style={{ fontSize: '.84rem', marginTop: '.4rem' }}>Needs 5+ attempts</p>
                  : <p className="h2 tnum" style={{ marginTop: '.25rem' }}><CountUp value={p.questions.accuracyPercent} suffix="%" /></p>}
              </div>
              <div className="card card-pad">
                <p className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Card retention</p>
                {p.flashcards.retentionPercent === null
                  ? <p className="muted" style={{ fontSize: '.84rem', marginTop: '.4rem' }}>Needs 10+ reviews</p>
                  : <p className="h2 tnum" style={{ marginTop: '.25rem' }}><CountUp value={p.flashcards.retentionPercent} suffix="%" /></p>}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card card-pad">
              <h2 className="h3" style={{ marginBottom: '1rem' }}>Quizzes</h2>
              {p.quizzes.averageScorePercent === null
                ? <p className="muted" style={{ fontSize: '.86rem' }}>
                    {p.quizzes.attempts} submitted {p.quizzes.attempts === 1 ? 'attempt' : 'attempts'}. An average needs at least two.
                  </p>
                : <div style={{ maxWidth: 420 }}>
                    <ProgressBar value={p.quizzes.averageScorePercent} max={100} label="Average quiz score" showValue />
                    <p className="faint" style={{ fontSize: '.76rem', marginTop: '.5rem' }}>Across {p.quizzes.attempts} submitted quizzes.</p>
                  </div>}
            </div>
          </Reveal>

          {(p.weakest.length > 0 || p.strongest.length > 0) && (
            <Reveal delay={180}>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <div className="card card-pad">
                  <h2 className="h3" style={{ marginBottom: '.8rem', color: 'var(--danger)' }}>Weakest topics</h2>
                  {p.weakest.length === 0
                    ? <p className="faint" style={{ fontSize: '.84rem' }}>No topic has 3+ attempts yet.</p>
                    : <ul className="stack gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {p.weakest.map((t) => (
                          <li key={t.topic}>
                            <div className="row spread" style={{ fontSize: '.86rem' }}>
                              <span>{t.topic}</span>
                              <span className="tnum faint">{t.accuracyPercent}%</span>
                            </div>
                            <ProgressBar value={t.accuracyPercent ?? 0} max={100} label={`${t.topic} accuracy`} />
                            <p className="faint" style={{ fontSize: '.72rem', marginTop: '.15rem' }}>{t.correct}/{t.attempts} correct</p>
                          </li>
                        ))}
                      </ul>}
                </div>

                <div className="card card-pad">
                  <h2 className="h3" style={{ marginBottom: '.8rem', color: 'var(--success)' }}>Strongest topics</h2>
                  {p.strongest.length === 0
                    ? <p className="faint" style={{ fontSize: '.84rem' }}>No topic has 3+ attempts yet.</p>
                    : <ul className="stack gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {p.strongest.map((t) => (
                          <li key={t.topic}>
                            <div className="row spread" style={{ fontSize: '.86rem' }}>
                              <span>{t.topic}</span>
                              <span className="tnum faint">{t.accuracyPercent}%</span>
                            </div>
                            <ProgressBar value={t.accuracyPercent ?? 0} max={100} label={`${t.topic} accuracy`} />
                          </li>
                        ))}
                      </ul>}
                </div>
              </div>
            </Reveal>
          )}

          <Reveal delay={230}>
            <Alert tone="info" title="How these numbers are calculated">{p.explainability}</Alert>
          </Reveal>
        </>
      )}
    </div>
  );
}
