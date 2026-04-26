import { headers } from 'next/headers';
import prisma from './prisma';

/**
 * Rate-limit com store no Postgres + fallback em-memória.
 *
 * - Em produção (multi-instância serverless), usa a tabela RateLimitBucket
 *   para compartilhar contadores entre cold-starts e instâncias.
 * - Se a tabela ainda não existir (migração não aplicada), cai automaticamente
 *   para o bucket em-memória — ainda útil em dev e em deploys single-instance.
 * - Limpeza periódica probabilística (5% das chamadas) para evitar crescimento
 *   ilimitado da tabela.
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const memoryBucket = new Map<string, RateLimitEntry>();
let dbAvailable: boolean | null = null;

function cleanupMemoryBucket(now: number) {
  for (const [key, entry] of memoryBucket.entries()) {
    if (entry.resetAt <= now) {
      memoryBucket.delete(key);
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

async function checkInDatabase(compositeKey: string, limit: number, windowMs: number) {
  const now = new Date();
  const newReset = new Date(now.getTime() + windowMs);

  // 5% das chamadas, faz GC oportunista de buckets vencidos.
  if (Math.random() < 0.05) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).rateLimitBucket.deleteMany({
        where: { resetAt: { lt: now } },
      });
    } catch {
      // Ignorar erro de GC — não deve quebrar a request.
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await (prisma as any).rateLimitBucket.findUnique({
    where: { key: compositeKey },
  });

  if (!existing || existing.resetAt <= now) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).rateLimitBucket.upsert({
      where: { key: compositeKey },
      create: { key: compositeKey, count: 1, resetAt: newReset },
      update: { count: 1, resetAt: newReset },
    });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return { allowed: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).rateLimitBucket.update({
    where: { key: compositeKey },
    data: { count: { increment: 1 } },
  });
  return { allowed: true };
}

function checkInMemory(compositeKey: string, limit: number, windowMs: number) {
  const now = Date.now();
  cleanupMemoryBucket(now);

  const existing = memoryBucket.get(compositeKey);

  if (!existing || existing.resetAt <= now) {
    memoryBucket.set(compositeKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return { allowed: false };
  }

  existing.count += 1;
  memoryBucket.set(compositeKey, existing);
  return { allowed: true };
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
  const compositeKey = `${scope}:${key}`;

  // Tenta DB primeiro. Se a tabela não existir, marca dbAvailable=false e cai para memória.
  if (dbAvailable !== false) {
    try {
      const result = await checkInDatabase(compositeKey, limit, windowMs);
      dbAvailable = true;
      if (!result.allowed) throw new Error(message);
      return;
    } catch (error) {
      const errorMessage =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: string }).message)
          : '';

      // Se foi nossa exceção de limite, repassa.
      if (errorMessage === message) throw error;

      // Senão, marca DB como indisponível e cai pra memória.
      const tableMissing =
        errorMessage.includes('rate_limit') ||
        errorMessage.includes('RateLimitBucket') ||
        errorMessage.includes('does not exist') ||
        errorMessage.includes('relation');

      if (tableMissing && dbAvailable === null) {
        console.warn('[rate-limit] tabela RateLimitBucket indisponível — usando bucket em-memória.');
      }
      dbAvailable = false;
    }
  }

  const result = checkInMemory(compositeKey, limit, windowMs);
  if (!result.allowed) throw new Error(message);
}
