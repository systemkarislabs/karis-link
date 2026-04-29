import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = { params: Promise<{ slug: string }> };

export default async function TenantRecoveryPage(props: PageProps) {
  const { slug } = await props.params;
  redirect(`/${slug}/login`);
}
