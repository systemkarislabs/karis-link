import { getTenantSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';

export default async function TenantLoginPage({ params }: { params: { slug: string } }) {
  const session = await getTenantSession();
  if (session?.slug === params.slug) redirect(`/${params.slug}/admin`);
  return <LoginClient slug={params.slug} />;
}
