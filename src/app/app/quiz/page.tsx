import { Suspense } from 'react';
import { QuizRunner } from '@/components/app/QuizRunner';
export const metadata = { title: 'Quizzes' };
export default function QuizPage() { return <Suspense><QuizRunner /></Suspense>; }
