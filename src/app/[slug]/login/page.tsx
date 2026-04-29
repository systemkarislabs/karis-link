import { getTenantSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = { params: Promise<{ slug: string }> };

export default async function TenantLoginPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const session = await getTenantSession();
  
  // Se já estiver logado nessa empresa, vai direto pro admin
  if (session?.slug === slug) redirect(`/${slug}/admin`);
  
  return <LoginClient slug={slug} />;
}
