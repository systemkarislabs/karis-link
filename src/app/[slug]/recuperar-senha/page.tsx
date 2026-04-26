import { redirect } from 'next/navigation';

type PageProps = { params: Promise<{ slug: string }> };

export default async function TenantRecoveryPage(props: PageProps) {
  const { slug } = await props.params;
  redirect(`/${slug}/login`);
}
