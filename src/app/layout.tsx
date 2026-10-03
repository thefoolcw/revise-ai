import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeScript } from '@/components/app/ThemeScript';

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: 'Revise AI — revision that adapts to you', template: '%s · Revise AI' },
  description: 'Curriculum-aware AI tutoring, question solving, quizzes, flashcards and revision plans for learners from early years to university.',
  openGraph: {
    title: 'Revise AI',
    description: 'AI tutoring and revision tools that work with your exam board and subject.',
    type: 'website', locale: 'en_GB', siteName: 'Revise AI',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'Revise AI — Learn, Revise, Achieve' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revise AI',
    description: 'AI tutoring and revision tools that work with your exam board and subject.',
    images: ['/og.png']
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' }
};

export const viewport: Viewport = { themeColor: '#1d4ed8', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body>
        <a className="skip-link" href="#main">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}
