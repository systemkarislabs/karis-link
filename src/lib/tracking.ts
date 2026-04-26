import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

const TRACKING_COOKIE = 'kl_tracking';
const TRACKING_MAX_AGE = 60 * 60 * 4;

type TrackingReference = {
  pageClickId: string;
  tenantId: string;
};

function getTrackingSecret() {
  const secret = process.env.AUTH_SECRET || process.env.SESSION_SECRET;

  if (secret) return new TextEncoder().encode(secret);
  if (process.env.NODE_ENV !== 'production') {
    return new TextEncoder().encode('dev-only-auth-secret-change-me');
  }

  throw new Error('AUTH_SECRET must be configured in production.');
}

function getTrackingCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: TRACKING_MAX_AGE,
    path: '/',
  };
}

function getExpiredTrackingCookieOptions() {
  return {
    ...getTrackingCookieOptions(),
    maxAge: 0,
  };
}

async function signTrackingReference(payload: TrackingReference) {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TRACKING_MAX_AGE}s`)
    .sign(getTrackingSecret());
}

async function verifyTrackingReference(token: string | undefined) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getTrackingSecret());
    const pageClickId = typeof payload.pageClickId === 'string' ? payload.pageClickId : null;
    const tenantId = typeof payload.tenantId === 'string' ? payload.tenantId : null;

    if (!pageClickId || !tenantId) return null;
    return { pageClickId, tenantId };
  } catch {
    return null;
  }
}

export async function setTrackingCookie(pageClickId: string, tenantId: string) {
  const store = await cookies();
  const token = await signTrackingReference({ pageClickId, tenantId });
  store.set(TRACKING_COOKIE, token, getTrackingCookieOptions());
}

export async function getTrackingCookie() {
  const store = await cookies();
  return verifyTrackingReference(store.get(TRACKING_COOKIE)?.value);
}

export async function clearTrackingCookie() {
  const store = await cookies();
  store.set(TRACKING_COOKIE, '', getExpiredTrackingCookieOptions());
}

export async function attachTrackingCookie(response: NextResponse, pageClickId: string, tenantId: string) {
  const token = await signTrackingReference({ pageClickId, tenantId });
  response.cookies.set(TRACKING_COOKIE, token, getTrackingCookieOptions());
}

export function clearTrackingCookieFromResponse(response: NextResponse) {
  response.cookies.set(TRACKING_COOKIE, '', getExpiredTrackingCookieOptions());
}
