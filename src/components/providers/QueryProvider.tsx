'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createQueryClient } from '@/lib/query/config';
import { LazyReactQueryDevtools } from '@/components/lazy/LazyComponents';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Optimized QueryProvider using centralized configuration
 * Uses React Query v5 patterns and Next.js 15 optimizations
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && <LazyReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
