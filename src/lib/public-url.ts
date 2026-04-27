const CANONICAL_PUBLIC_BASE_URL = 'https://link.karisnegocios.com.br';

export function getPublicBaseUrl() {
  const configuredUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');

  if (!configuredUrl) {
    return CANONICAL_PUBLIC_BASE_URL;
  }

  const isTemporaryHost =
    configuredUrl.includes('vercel.app') ||
    configuredUrl.includes('railway.app') ||
    configuredUrl.includes('karis-link.vercel.app');

  return isTemporaryHost ? CANONICAL_PUBLIC_BASE_URL : configuredUrl;
}
