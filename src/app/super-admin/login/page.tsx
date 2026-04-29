import { getSuperSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SuperLoginClient from './LoginClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SuperLoginPage() {
  if (await getSuperSession()) redirect('/super-admin');
  return <SuperLoginClient />;
}
