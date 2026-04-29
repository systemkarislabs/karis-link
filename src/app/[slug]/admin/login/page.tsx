import { getTenantSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TenantLoginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getTenantSession();
  if (session?.slug === slug) redirect(`/${slug}/admin`);
  return <LoginClient slug={slug} />;
}
