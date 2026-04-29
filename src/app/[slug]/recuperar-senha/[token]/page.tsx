import ResetPasswordClient from './ResetPasswordClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = { params: Promise<{ slug: string; token: string }> };

export default async function TenantResetPasswordPage(props: PageProps) {
  const { slug, token } = await props.params;
  return <ResetPasswordClient slug={slug} token={token} />;
}
