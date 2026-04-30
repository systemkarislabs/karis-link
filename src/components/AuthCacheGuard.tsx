'use client';

import { useEffect, useMemo, useRef } from 'react';

type AuthCacheGuardProps = {
  scope: 'super' | 'tenant';
  slug?: string;
};

function getAdminPrefix(scope: AuthCacheGuardProps['scope'], slug?: string) {
  return scope === 'super' ? '/super-admin' : `/${slug}/admin`;
}

function getLoginPath(scope: AuthCacheGuardProps['scope'], slug?: string) {
  return scope === 'super' ? '/super-admin/login' : `/${slug}/login`;
}

export default function AuthCacheGuard({ scope, slug }: AuthCacheGuardProps) {
  const internalNavigationRef = useRef(false);
  const endpoint = useMemo(() => {
    const params = new URLSearchParams({ scope });
    if (slug) params.set('slug', slug);
    return `/api/auth/session?${params.toString()}`;
  }, [scope, slug]);
  const adminPrefix = useMemo(() => getAdminPrefix(scope, slug), [scope, slug]);
  const loginPath = useMemo(() => getLoginPath(scope, slug), [scope, slug]);

  useEffect(() => {
    let internalNavigationTimeout: number | undefined;

    function markInternalNavigation() {
      internalNavigationRef.current = true;
      window.clearTimeout(internalNavigationTimeout);
      internalNavigationTimeout = window.setTimeout(() => {
        internalNavigationRef.current = false;
      }, 30000);
    }

    function isInternalAdminUrl(url: URL) {
      return url.origin === window.location.origin && url.pathname.startsWith(adminPrefix);
    }

    async function validateSession() {
      try {
        const response = await fetch(endpoint, {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        const payload = (await response.json()) as { authenticated?: boolean };

        if (!payload.authenticated) {
          window.location.replace(loginPath);
        }
      } catch {
        window.location.replace(loginPath);
      }
    }

    function endSession() {
      const body = new Blob([new URLSearchParams({ scope, slug: slug || '' }).toString()], {
        type: 'application/x-www-form-urlencoded',
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, body);
        return;
      }

      void fetch(endpoint, {
        method: 'POST',
        body,
        credentials: 'same-origin',
        keepalive: true,
      });
    }

    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(target instanceof HTMLAnchorElement)) return;

      const url = new URL(target.href, window.location.href);
      if (isInternalAdminUrl(url)) {
        markInternalNavigation();
      }
    }

    function handleSubmit() {
      markInternalNavigation();
    }

    function handlePageHide() {
      if (!internalNavigationRef.current) {
        endSession();
      }
    }

    function handlePageShow(event: PageTransitionEvent) {
      internalNavigationRef.current = false;
      if (event.persisted) {
        void validateSession();
      }
    }

    document.addEventListener('click', handleClick, true);
    document.addEventListener('submit', handleSubmit, true);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);

    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navigationEntry?.type === 'back_forward') {
      void validateSession();
    }

    return () => {
      window.clearTimeout(internalNavigationTimeout);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('submit', handleSubmit, true);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [adminPrefix, endpoint, loginPath, scope, slug]);

  return null;
}
