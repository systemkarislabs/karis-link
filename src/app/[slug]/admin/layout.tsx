import { requireTenantAuth } from '@/lib/auth';

export default async function TenantAdminLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireTenantAuth(slug);
  return <>{children}</>;
}
