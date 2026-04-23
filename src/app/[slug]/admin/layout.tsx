import { requireTenantAuth } from '@/lib/auth';

export default async function TenantAdminLayout({
  children, params,
}: { children: React.ReactNode; params: { slug: string } }) {
  await requireTenantAuth(params.slug);
  return <>{children}</>;
}
