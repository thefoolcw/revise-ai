import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/ui/primitives';
import { ContactForm } from '@/components/app/ContactForm';
import { getCurrentUser } from '@/server/auth/session';
export const metadata: Metadata = { title: 'Contact', description: 'Get in touch with the Revise AI team.' };

export default async function ContactPage() {
  const user = await getCurrentUser();
  return (
    <div className="container-x" style={{ paddingBlock: '3.5rem', maxWidth: 640 }}>
      <Reveal><SectionHeading eyebrow="Contact" title="Talk to us" lede="Premium and key questions, bugs, curriculum corrections and feature requests all come here." /></Reveal>
      <Reveal delay={80}><div className="card card-pad" style={{ marginTop: '2rem' }}><ContactForm authed={!!user} /></div></Reveal>
    </div>
  );
}
