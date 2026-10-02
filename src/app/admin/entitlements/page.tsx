import { redirect } from 'next/navigation';
export const metadata = { title: 'Entitlements' };
/** Entitlement records are surfaced on the Premium admin page, with revocation controls. */
export default function AdminEntitlements() { redirect('/admin/premium'); }
