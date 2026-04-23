import { requireTenantAuth } from '@/lib/auth';
import React from 'react';

export default async function TenantAdminLayout(props: any) {
  const params = await props.params;
  const { slug } = params;
  await requireTenantAuth(slug);
  return <>{props.children}</>;
}
