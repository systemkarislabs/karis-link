import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from './prisma';

const SESSION_COOKIE = 'kl_session';
const SUPER_COOKIE = 'kl_super';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const BCRYPT_MAX_PASSWORD_BYTES = 72;

type TenantSession = {
  role: 'tenant';
  slug: string;
  tenantId: string;
};

type SuperSession = {
  role: 'super';
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || process.env.SESSION_SECRET;

  if (secret) return new TextEncoder().encode(secret);
  if (process.env.NODE_ENV !== 'production') {
    return new TextEncoder().encode('dev-only-auth-secret-change-me');
  }

  throw new Error('AUTH_SECRET must be configured in production.');
}

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  };
}

function getExpiredCookieOptions() {
  return {
    ...getCookieOptions(),
    maxAge: 0,
  };
}

async function signSession(payload: TenantSession | SuperSession) {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getAuthSecret());
}

async function verifySession(token: string | undefined) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return payload;
  } catch {
    return null;
  }
}

export function isPasswordHash(value: string | null | undefined) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

export function isPasswordLengthAllowed(password: string) {
  return new TextEncoder().encode(password).length <= BCRYPT_MAX_PASSWORD_BYTES;
}

export async function hashPassword(password: string) {
  if (!isPasswordLengthAllowed(password)) {
    throw new Error('Password exceeds the safe bcrypt length limit.');
  }

  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, storedValue: string | null | undefined) {
  if (!storedValue) return false;
  if (!isPasswordLengthAllowed(password)) return false;
  if (isPasswordHash(storedValue)) return bcrypt.compare(password, storedValue);
  return password === storedValue;
}

export async function getTenantSession() {
  const store = await cookies();
  const payload = await verifySession(store.get(SESSION_COOKIE)?.value);

  if (!payload || payload.role !== 'tenant') return null;

  const slug = typeof payload.slug === 'string' ? payload.slug : null;
  const tenantId = typeof payload.tenantId === 'string' ? payload.tenantId : null;
  if (!slug || !tenantId) return null;

  return { role: 'tenant' as const, slug, tenantId };
}

export async function requireTenantAuth(slug: string) {
  const session = await getTenantSession();
  if (!session || session.slug !== slug) redirect(`/${slug}/login`);

  const tenant = await prisma.tenant.findFirst({
    where: {
      id: session.tenantId,
      slug,
      active: true,
    },
    select: {
      id: true,
    },
  });

  if (!tenant) {
    await clearTenantSession();
    redirect(`/${slug}/login`);
  }

  return session;
}

export async function setTenantSession(slug: string, tenantId: string) {
  const store = await cookies();
  const token = await signSession({ role: 'tenant', slug, tenantId });

  store.set(SESSION_COOKIE, token, getCookieOptions());
}

export async function clearTenantSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', getExpiredCookieOptions());
}

export async function getSuperSession() {
  const store = await cookies();
  const payload = await verifySession(store.get(SUPER_COOKIE)?.value);
  return payload?.role === 'super';
}

export async function requireSuperAuth() {
  const ok = await getSuperSession();
  if (!ok) redirect('/super-admin/login');
}

export async function setSuperSession() {
  const store = await cookies();
  const token = await signSession({ role: 'super' });

  store.set(SUPER_COOKIE, token, getCookieOptions());
}

export async function clearSuperSession() {
  const store = await cookies();
  store.set(SUPER_COOKIE, '', getExpiredCookieOptions());
}
