import prisma from '@/lib/prisma';

function isMissingSuperAdminTable(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  const message =
    typeof error === 'object' && error && 'message' in error ? String((error as { message?: string }).message) : '';

  return code === 'P2021' || message.toLowerCase().includes('superadminaccount');
}

export async function findStoredSuperAdminAccount() {
  try {
    return await prisma.superAdminAccount.findFirst({
      orderBy: { createdAt: 'asc' },
    });
  } catch (error) {
    if (isMissingSuperAdminTable(error)) {
      return null;
    }

    throw error;
  }
}

export function ensureSuperAdminTableAvailable(error: unknown) {
  if (isMissingSuperAdminTable(error)) {
    throw new Error('A nova configuracao do super-admin ainda nao foi aplicada no banco de producao.');
  }

  throw error;
}
