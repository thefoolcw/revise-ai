import { Suspense } from 'react';
import { TutorChat } from '@/components/app/TutorChat';
export const metadata = { title: 'Tutor' };
export default function TutorPage() { return <Suspense><TutorChat /></Suspense>; }
