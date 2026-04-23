import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SESSION_COOKIE = 'kl_session';
const SUPER_COOKIE   = 'kl_super';

// ── Tenant Auth ──────────────────────────────────────────────────────────────
export async function getTenantSession() {
  const store = await cookies();
  const c = store.get(SESSION_COOKIE);
  if (!c) return null;
  try { return JSON.parse(c.value) as { slug: string; tenantId: string }; }
  catch { return null; }
}

export async function requireTenantAuth(slug: string) {
  const s = await getTenantSession();
  if (!s || s.slug !== slug) redirect(`/${slug}/login`);
  return s;
}

export async function setTenantSession(slug: string, tenantId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify({ slug, tenantId }), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearTenantSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

// ── Super Admin Auth ──────────────────────────────────────────────────────────
export async function getSuperSession() {
  const store = await cookies();
  return store.get(SUPER_COOKIE)?.value === 'ok';
}

export async function requireSuperAuth() {
  const ok = await getSuperSession();
  if (!ok) redirect('/super-admin/login');
}

export async function setSuperSession() {
  const store = await cookies();
  store.set(SUPER_COOKIE, 'ok', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSuperSession() {
  const store = await cookies();
  store.delete(SUPER_COOKIE);
}
