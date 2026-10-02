import Link from 'next/link';
import { Brand } from './Brand';

const COLS: { title: string; links: [string, string][] }[] = [
  { title: 'Product', links: [['Features', '/features'], ['How it works', '/how-it-works'], ['Subjects', '/subjects'], ['Exam boards', '/exam-boards'], ['Pricing', '/pricing']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['Status', '/status'], ['FAQ', '/faq']] },
  { title: 'Legal', links: [['Privacy', '/privacy'], ['Terms', '/terms'], ['Security', '/security'], ['AI limitations', '/ai-limitations'], ['Refunds', '/refunds']] }
];

export function MarketingFooter({ discordUrl }: { discordUrl: string }) {
  return (
    <footer className="surface-2" style={{ borderTop: '1px solid var(--border)', marginTop: '5rem' }}>
      <div className="container-x" style={{ padding: '3rem 1.25rem 2rem' }}>
        <div style={{ display: 'grid', gap: '2.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div>
            <Brand />
            <p className="muted" style={{ fontSize: '.86rem', marginTop: '.8rem', maxWidth: 280, lineHeight: 1.6 }}>
              Revision tools that adapt to your curriculum, from early years to university.
            </p>
            <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
              Join the Discord
            </a>
          </div>
          {COLS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p style={{ fontSize: '.78rem', fontWeight: 650, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-faint)', marginBottom: '.7rem' }}>{c.title}</p>
              <ul className="stack gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {c.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} style={{ fontSize: '.88rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="hairline" style={{ marginTop: '2.5rem', paddingTop: '1.25rem' }}>
          <p className="faint" style={{ fontSize: '.78rem', lineHeight: 1.7, maxWidth: 820 }}>
            Revise AI is an independent education product. It is not affiliated with, endorsed by, or
            sponsored by AQA, Pearson Edexcel, OCR, WJEC, Eduqas, CCEA, SQA, Cambridge International,
            the International Baccalaureate, or any university. Exam board names are used to identify
            curricula only. AI output can contain mistakes — always check important facts against your
            official specification and mark schemes.
          </p>
          <p className="faint" style={{ fontSize: '.78rem', marginTop: '.7rem' }}>© {new Date().getFullYear()} Revise AI.</p>
        </div>
      </div>
    </footer>
  );
}
