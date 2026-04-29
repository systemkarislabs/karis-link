'use client';

import { useEffect } from 'react';

export default function AuthCacheGuard() {
  useEffect(() => {
    function reloadIfRestoredFromBrowserCache(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload();
      }
    }

    window.addEventListener('pageshow', reloadIfRestoredFromBrowserCache);

    const navigationEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;

    if (navigationEntry?.type === 'back_forward') {
      window.location.reload();
    }

    return () => window.removeEventListener('pageshow', reloadIfRestoredFromBrowserCache);
  }, []);

  return null;
}
