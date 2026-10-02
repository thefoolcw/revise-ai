import { Suspense } from 'react';
import { NotesWorkspace } from '@/components/app/NotesWorkspace';
export const metadata = { title: 'Notes' };
export default function NotesPage() { return <Suspense><NotesWorkspace /></Suspense>; }
