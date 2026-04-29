import type { NextConfig } from 'next';

/**
 * Content Security Policy.
 *
 * O app ainda usa muitos `style` inline e fontes do Google, então a CSP
 * é relaxada com `unsafe-inline` em styles. Quando todos os estilos forem
 * migrados para CSS modules / Tailwind, remover `unsafe-inline` e
 * adicionar nonces.
 *
 * - default-src 'self': base segura.
 * - img-src: aceita data URIs (avatares em base64) e https (CDNs).
 * - font-src: Google Fonts.
 * - connect-src: necessário para o Resend (envio de email) em runtime.
 * - frame-ancestors: bloqueia iframe externo (já reforçado por X-Frame-Options).
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://api.resend.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://wa.me",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
];

const noIndexHeaders = [
  ...securityHeaders,
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
];

const privateNoStoreHeaders = [
  ...noIndexHeaders,
  { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
  { key: 'Pragma', value: 'no-cache' },
  { key: 'Expires', value: '0' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/super-admin/:path*',
        headers: privateNoStoreHeaders,
      },
      {
        source: '/super-admin',
        headers: privateNoStoreHeaders,
      },
      {
        source: '/:slug/admin/:path*',
        headers: privateNoStoreHeaders,
      },
      {
        source: '/:slug/admin',
        headers: privateNoStoreHeaders,
      },
      {
        source: '/:slug/login',
        headers: privateNoStoreHeaders,
      },
      {
        source: '/:slug/recuperar-senha/:path*',
        headers: noIndexHeaders,
      },
    ];
  },
};

export default nextConfig;
