import type { NextConfig } from 'next';

/**
 * Headers de segurança aplicados a TODAS as rotas.
 *
 * Notas:
 * - Sem CSP estrito por enquanto: o app usa `style` inline e `img` em base64.
 *   Quando todas as estilizações migrarem para CSS, adicionar Content-Security-Policy.
 * - HSTS só faz sentido com HTTPS, então não habilitamos preload por padrão.
 */
const securityHeaders = [
  // Impede o conteúdo de ser embutido em iframes externos (clickjacking).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Impede browsers de adivinhar o MIME type.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Limita o que é enviado no header Referer.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restringe APIs sensíveis do browser.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // HSTS: força HTTPS em navegadores modernos por 1 ano.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
];

// Rotas administrativas não devem aparecer em buscadores.
const noIndexHeaders = [
  ...securityHeaders,
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
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
        headers: noIndexHeaders,
      },
      {
        source: '/:slug/admin/:path*',
        headers: noIndexHeaders,
      },
      {
        source: '/:slug/login',
        headers: noIndexHeaders,
      },
      {
        source: '/:slug/recuperar-senha/:path*',
        headers: noIndexHeaders,
      },
    ];
  },
};

export default nextConfig;
