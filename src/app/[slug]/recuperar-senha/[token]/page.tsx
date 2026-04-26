import { redirect } from 'next/navigation';

type PageProps = { params: Promise<{ slug: string }> };

export default async function TenantResetPasswordPage(props: PageProps) {
  const { slug } = await props.params;
  redirect(`/${slug}/login`);
}
