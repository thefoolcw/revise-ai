import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignupForm } from '@/components/app/AuthForms';
export const metadata: Metadata = { title: 'Create account' };
export default function Signup() { return <Suspense><SignupForm /></Suspense>; }
