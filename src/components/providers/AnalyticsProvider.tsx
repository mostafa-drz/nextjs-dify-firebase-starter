'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize analytics and track initial page view
    if (pathname) {
      const pageName = pathname === '/' ? 'Home' : pathname.replace('/', '').replace('-', ' ');
      trackPageView(pageName);
    }
  }, [pathname]);

  return <>{children}</>;
}
