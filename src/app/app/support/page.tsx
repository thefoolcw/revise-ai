import { desc, eq } from 'drizzle-orm';
import { Chip } from '@/components/ui/primitives';
import { ContactForm } from '@/components/app/ContactForm';
import { getCurrentUser } from '@/server/auth/session';
import { getDb, schema } from '@/server/db';
import { getPremiumProduct } from '@/server/premium/product';

export const metadata = { title: 'Support' };
export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'success' | 'warn' | 'danger' | 'default'> = {
  OPEN: 'default', IN_PROGRESS: 'warn', RESOLVED: 'success', CLOSED: 'default'
};

export default async function SupportPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await getDb();
  const product = getPremiumProduct();
  const tickets = await db.select().from(schema.supportTickets)
    .where(eq(schema.supportTickets.userId, user.id)).orderBy(desc(schema.supportTickets.createdAt)).limit(20);

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Support</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Premium keys, account problems, curriculum corrections and bugs. Tickets are attached to your account
          so we can see the context.
        </p>
      </header>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '1rem' }}>Send a message</h2>
        <ContactForm authed />
      </div>

      <div className="card card-pad">
        <h2 className="h3" style={{ marginBottom: '.8rem' }}>Your tickets</h2>
        {tickets.length === 0
          ? <p className="faint" style={{ fontSize: '.84rem' }}>No tickets yet.</p>
          : <div className="table-wrap">
              <table className="data">
                <caption className="sr-only">Support tickets</caption>
                <thead><tr><th scope="col">Subject</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Opened</th></tr></thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 560 }}>{t.subject}</td>
                      <td className="faint">{t.category}</td>
                      <td><Chip tone={STATUS_TONE[t.status] ?? 'default'}>{t.status.replace(/_/g, ' ')}</Chip></td>
                      <td className="tnum faint">{new Date(t.createdAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
      </div>

      {product.discord.configured && (
        <div className="card card-pad">
          <h2 className="h3" style={{ marginBottom: '.5rem' }}>Premium and key questions</h2>
          <p className="muted" style={{ fontSize: '.88rem', lineHeight: 1.65 }}>
            Purchases are handled in the Revise AI Discord, so order questions are answered fastest there — read{' '}
            {product.discord.pricingChannel} and {product.discord.buyChannel} first. Never post a key value in a
            public channel.
          </p>
          <a href={product.discord.inviteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: '.9rem' }}>
            Join Discord
          </a>
        </div>
      )}
    </div>
  );
}
