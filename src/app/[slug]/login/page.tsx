import { getTenantSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';

export default async function TenantLoginPage(props: any) {
  const params = await props.params;
  const { slug } = params;
  const session = await getTenantSession();
  
  // Se já estiver logado nessa empresa, vai direto pro admin
  if (session?.slug === slug) redirect(`/${slug}/admin`);
  
  return <LoginClient slug={slug} />;
}
