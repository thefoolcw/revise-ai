import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';
import { CountUp } from '@/components/motion/CountUp';
import { AmbientHero } from '@/components/motion/AmbientHero';
import { TiltCard } from '@/components/motion/TiltCard';
import { HeroConsole } from '@/components/app/HeroConsole';
import { getPremiumProduct } from '@/server/premium/product';
import { getDb, schema } from '@/server/db';
import { lastCatalogRefresh, listVisibleModels } from '@/server/ai/registry';
import { getCurrentUser } from '@/server/auth/session';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * Real, verifiable figures only. Anything the database cannot substantiate is
 * omitted rather than invented — no fake user counts, testimonials or awards.
 */
async function realStats() {
  try {
    const db = await getDb();
    const q = async (s: string) => (await db.execute(sql.raw(s))).rows[0] as Record<string, number>;
    const [subjects, topics, boards, quals] = await Promise.all([
      q('SELECT COUNT(*)::int n FROM subjects'),
      q('SELECT COUNT(*)::int n FROM topics'),
      q('SELECT COUNT(*)::int n FROM exam_boards'),
      q('SELECT COUNT(*)::int n FROM qualifications')
    ]);
    const models = await listVisibleModels({ premium: false });
    const cat = await lastCatalogRefresh();
    return {
      subjects: subjects.n ?? 0, topics: topics.n ?? 0, boards: boards.n ?? 0, qualifications: quals.n ?? 0,
      models: models.length, catalogAt: cat.at, catalogStale: cat.stale
    };
  } catch {
    return null;
  }
}

const FEATURES = [
  { icon: '◈', title: 'AI tutor with context', body: 'Ask in the language of your course. The tutor is given your level, board and topic, and says when it is uncertain instead of inventing requirements.' },
  { icon: '⌁', title: 'Universal question solver', body: 'Type, paste or upload. Worked steps, a check, the common mistake and an exam tip — with arithmetic verified by a calculator, not guessed.' },
  { icon: '◑', title: 'Quizzes that validate', body: 'Generated questions are checked before you see them: every answer exists, options are unique, and nothing leaks the answer into the prompt.' },
  { icon: '❍', title: 'Spaced repetition', body: 'SM-2 scheduling with Again / Hard / Good / Easy. Miss a review and the schedule adapts — it never disappears.' },
  { icon: '▤', title: 'Revision plans that fit', body: 'Built from your real accuracy, target date and weekly hours. If everything will not fit, it tells you instead of building an impossible timetable.' },
  { icon: '◇', title: 'Progress you can interrogate', body: 'Every metric states how it was calculated and hides percentages until there is enough data to mean something.' }
];

const LEVELS = [
  { name: 'Early Years', body: 'EYFS-style areas with short, visual, adult-friendly sessions.' },
  { name: 'Primary', body: 'KS1 and KS2 across the core subjects, plus 7+ and 11+ preparation.' },
  { name: 'Secondary & GCSE', body: 'KS3 and GCSE/IGCSE pathways across AQA, Edexcel, OCR, WJEC, Eduqas and CCEA.' },
  { name: 'Post-16', body: 'A Level, AS, T Level, BTEC, National 5, Higher, Cambridge International and IB.' },
  { name: 'University', body: 'Module and topic based — lecture notes, essays, citation help and code tutoring.' }
];

export default async function Home() {
  const stats = await realStats();
  const user = await getCurrentUser();
  const product = getPremiumProduct();

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '3.5rem', paddingBottom: '4.5rem' }}>
        <div className="ambient" aria-hidden="true" />
        <div className="ambient-grid" aria-hidden="true" />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true"><AmbientHero /></div>

        <div className="container-x" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gap: '3rem', alignItems: 'center', gridTemplateColumns: '1fr' }}>
            <div className="hero-stagger">
              <p className="eyebrow">Nursery to university · UK boards and international curricula</p>
              <h1 className="h-display" style={{ maxWidth: '15ch' }}>
                Revise smarter. Understand more. Study with purpose.
              </h1>
              <p className="lede" style={{ maxWidth: '54ch' }}>
                AI tutoring, question solving, quizzes, flashcards and revision plans that work
                with your exam board and subject — and tell you honestly when they are not sure.
              </p>
              <div className="row gap-3 wrap">
                <Link href={user ? '/app' : '/signup'} className="btn btn-primary btn-lg">
                  {user ? 'Open your dashboard' : 'Start revising'}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
                <Link href="/how-it-works" className="btn btn-outline btn-lg">See how it works</Link>
              </div>
              <p className="faint" style={{ fontSize: '.84rem' }}>
                Free to start. Premium is {product.displayPrice} — buy a key in the Discord.
              </p>
            </div>
          </div>

          {stats && (
            <div style={{ marginTop: '3.5rem' }}>
              <Reveal>
                <TiltCard max={3}>
                  <HeroConsole
                    stats={{
                      subjects: stats.subjects, topics: stats.topics, boards: stats.boards,
                      qualifications: stats.qualifications, models: stats.models
                    }}
                    catalogStale={stats.catalogStale}
                    catalogAt={stats.catalogAt}
                  />
                </TiltCard>
              </Reveal>
            </div>
          )}
        </div>
      </section>

      {/* ── BRAND SHOWCASE ──────────────────────────────────────── */}
      <section className="container-x" style={{ paddingBlock: '0.5rem 2rem' }}>
        <Reveal>
          <figure style={{ margin: 0 }}>
            <div style={{ borderRadius: '1.2rem', overflow: 'hidden', border: '1px solid rgba(148,163,184,.22)', boxShadow: '0 28px 70px -30px rgba(59,130,246,.45)' }}>
              <img
                src="/banner.png"
                alt="Revise AI — Learn, Revise, Achieve. AI tutoring, revision tools, quizzes and flashcards, progress tracking, notes and documents, and study plans, from nursery to university."
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
            </div>
          </figure>
        </Reveal>
      </section>

      {/* ── LIVE REGISTRY (real numbers, labelled as such) ───────── */}
      {stats && (
        <section className="container-x" style={{ paddingBlock: '1rem' }}>
          <Reveal>
            <div className="card card-pad" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', textAlign: 'center' }}>
              {[
                { v: stats.subjects, l: 'Subjects in the catalogue' },
                { v: stats.topics, l: 'Topic entries' },
                { v: stats.boards, l: 'Exam boards & providers' },
                { v: stats.qualifications, l: 'Qualification pathways' },
                { v: stats.models, l: 'AI models available now' }
              ].map((s) => (
                <div key={s.l}>
                  <div className="h1" style={{ color: 'var(--accent)' }}><CountUp value={s.v} /></div>
                  <div className="muted" style={{ fontSize: '.82rem', marginTop: '.25rem' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <p className="faint" style={{ fontSize: '.78rem', textAlign: 'center', marginTop: '.8rem' }}>
            Counted live from the Revise AI curriculum registry and AI model catalogue at page load.
            {stats.catalogStale ? ' The model catalogue has not refreshed in the last 6 hours.' : ''}
          </p>
        </section>
      )}

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="container-x" style={{ paddingBlock: '4.5rem' }}>
        <Reveal>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 2.75rem' }}>
            <p className="eyebrow" style={{ marginBottom: '.6rem' }}>What you get</p>
            <h2 className="h1">One place for the whole revision loop</h2>
            <p className="lede" style={{ marginTop: '.7rem' }}>
              Learn it, practise it, recall it, plan it, then see what actually worked.
            </p>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gap: '1.15rem', gridTemplateColumns: 'repeat(auto-fit, minmax(290px,1fr))' }}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <TiltCard max={4} className="card" style={{ height: '100%' }}>
                <div className="card-pad" style={{ height: '100%' }}>
                  <div aria-hidden="true" style={{
                    width: 40, height: 40, borderRadius: 11, display: 'grid', placeItems: 'center',
                    background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: '1.15rem', marginBottom: '.9rem'
                  }}>{f.icon}</div>
                  <h3 className="h3" style={{ marginBottom: '.4rem' }}>{f.title}</h3>
                  <p className="muted" style={{ fontSize: '.9rem', lineHeight: 1.65 }}>{f.body}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── LEVELS ───────────────────────────────────────────────── */}
      <section className="surface-2" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', paddingBlock: '4.5rem' }}>
        <div className="container-x">
          <Reveal>
            <div style={{ maxWidth: 640, marginBottom: '2.5rem' }}>
              <p className="eyebrow" style={{ marginBottom: '.6rem' }}>Nursery to university</p>
              <h2 className="h1">Built for every stage, not just exams</h2>
              <p className="lede" style={{ marginTop: '.7rem' }}>
                Wording, session length and difficulty adapt to the learner&apos;s stage.
              </p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(210px,1fr))' }}>
            {LEVELS.map((l, i) => (
              <Reveal key={l.name} delay={i * 70}>
                <div className="card" style={{ padding: '1.15rem', height: '100%' }}>
                  <h3 className="h3" style={{ marginBottom: '.35rem', color: 'var(--accent)' }}>{l.name}</h3>
                  <p className="muted" style={{ fontSize: '.87rem', lineHeight: 1.6 }}>{l.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HONESTY / LIMITS ─────────────────────────────────────── */}
      <section className="container-x" style={{ paddingBlock: '4.5rem' }}>
        <div style={{ display: 'grid', gap: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', alignItems: 'start' }}>
          <Reveal>
            <p className="eyebrow" style={{ marginBottom: '.6rem' }}>What we will not do</p>
            <h2 className="h1">Honest about what AI can and cannot do</h2>
            <p className="lede" style={{ marginTop: '.7rem' }}>
              We would rather tell you the limits than oversell them.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <ul className="stack gap-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                ['No guaranteed grades.', 'Nothing can promise an outcome, and we will not pretend otherwise.'],
                ['No invented mark schemes.', 'If you do not supply a rubric, feedback is clearly labelled general.'],
                ['No fake syllabus claims.', 'Topic trees are marked illustrative until a verified specification is attached.'],
                ['No fake endorsements.', 'We are not affiliated with any exam board or university.'],
                ['AI can be wrong.', 'Check important facts against your official specification.']
              ].map(([t, b]) => (
                <li key={t} className="row" style={{ gap: '.8rem', alignItems: 'flex-start' }}>
                  <span aria-hidden="true" style={{ color: 'var(--accent)', fontWeight: 700, lineHeight: 1.5 }}>✓</span>
                  <span style={{ fontSize: '.92rem', lineHeight: 1.6 }}>
                    <strong style={{ fontWeight: 620 }}>{t}</strong>{' '}
                    <span className="muted">{b}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/ai-limitations" className="btn btn-outline btn-sm" style={{ marginTop: '1.25rem' }}>Read the full AI limitations</Link>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="container-x" style={{ paddingBottom: '1rem' }}>
        <Reveal>
          <div className="card" style={{ padding: '2.75rem 1.75rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div className="ambient" aria-hidden="true" style={{ opacity: .6 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 className="h1">Start with what you are studying this week</h2>
              <p className="lede" style={{ maxWidth: 520, margin: '.8rem auto 1.6rem' }}>
                Pick your stage, board and subjects. Revise AI builds around them from the first session.
              </p>
              <div className="row gap-3 wrap" style={{ justifyContent: 'center' }}>
                <Link href={user ? '/app' : '/signup'} className="btn btn-primary btn-lg">
                  {user ? 'Go to your dashboard' : 'Create your account'}
                </Link>
                <Link href="/pricing" className="btn btn-outline btn-lg">Premium — {product.displayPrice}</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
