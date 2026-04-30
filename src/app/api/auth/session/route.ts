import { clearSuperSession, clearTenantSession, getSuperSession, getTenantSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function noStoreJson(payload: unknown, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function noStoreEmpty(status = 204) {
  return new NextResponse(null, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = url.searchParams.get('scope');
  const slug = url.searchParams.get('slug') || '';

  if (scope === 'super') {
    return noStoreJson({ authenticated: await getSuperSession() });
  }

  if (scope === 'tenant') {
    const session = await getTenantSession();
    return noStoreJson({ authenticated: Boolean(session && session.slug === slug) });
  }

  return noStoreJson({ authenticated: false }, 400);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  let scope = url.searchParams.get('scope');

  if (!scope) {
    const body = await request.text();
    const params = new URLSearchParams(body);
    scope = params.get('scope');
  }

  if (scope === 'super') {
    await clearSuperSession();
  }

  if (scope === 'tenant') {
    await clearTenantSession();
  }

  return noStoreEmpty();
}
