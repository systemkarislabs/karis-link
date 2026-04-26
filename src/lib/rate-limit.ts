import { headers } from 'next/headers';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const bucket = new Map<string, RateLimitEntry>();

function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of bucket.entries()) {
    if (entry.resetAt <= now) {
      bucket.delete(key);
    }
  }
}

function normalizeIp(value: string | null) {
  if (!value) return 'unknown';
  return value.split(',')[0]?.trim() || 'unknown';
}

export async function getRequestIp() {
  const headerStore = await headers();
  return normalizeIp(headerStore.get('x-forwarded-for') || headerStore.get('x-real-ip'));
}

export async function assertRateLimit({
  scope,
  key,
  limit,
  windowMs,
  message,
}: {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
  message: string;
}) {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const compositeKey = `${scope}:${key}`;
  const existing = bucket.get(compositeKey);

  if (!existing || existing.resetAt <= now) {
    bucket.set(compositeKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (existing.count >= limit) {
    throw new Error(message);
  }

  existing.count += 1;
  bucket.set(compositeKey, existing);
}
