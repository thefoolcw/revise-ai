import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/app/AuthForms';
export const metadata: Metadata = { title: 'Sign in' };
export default function Login() { return <Suspense><LoginForm /></Suspense>; }
