import type { NextConfig } from 'next';

function getSupabaseImageHost() {
  if (!process.env.SUPABASE_URL) return null;

  try {
    return new URL(process.env.SUPABASE_URL).hostname;
  } catch {
    return null;
  }
}

/**
 * Content Security Policy.
 *
 * The app still has inline styles, so style-src remains relaxed until the UI is
 * fully moved to CSS modules/Tailwind. The rest of the policy stays narrow:
 * same-origin scripts/connect, no external framing, no plugins/objects.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
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

const publicNoStoreHeaders = [
  ...securityHeaders,
  { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
  { key: 'Pragma', value: 'no-cache' },
  { key: 'Expires', value: '0' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: getSupabaseImageHost()
      ? [
          {
            protocol: 'https',
            hostname: getSupabaseImageHost()!,
            pathname: '/storage/v1/object/public/**',
          },
        ]
      : [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },

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
        source: '/admin/:path*',
        headers: privateNoStoreHeaders,
      },
      {
        source: '/admin',
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
        headers: privateNoStoreHeaders,
      },
      {
        source: '/:slug/recuperar-senha',
        headers: privateNoStoreHeaders,
      },
      {
        source: '/api/redirect/:path*',
        headers: publicNoStoreHeaders,
      },
      {
        source: '/api/redirect',
        headers: publicNoStoreHeaders,
      },
      {
        source: '/:slug/go/:path*',
        headers: publicNoStoreHeaders,
      },
      {
        source: '/:slug/bio/:path*',
        headers: publicNoStoreHeaders,
      },
      {
        source: '/:slug',
        headers: publicNoStoreHeaders,
      },
    ];
  },
};

export default nextConfig;
