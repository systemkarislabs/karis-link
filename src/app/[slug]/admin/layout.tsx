import { requireTenantAuth } from '@/lib/auth';
import React from 'react';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export default async function TenantAdminLayout(props: Props) {
  const { slug } = await props.params;
  await requireTenantAuth(slug);
  return <>{props.children}</>;
}
