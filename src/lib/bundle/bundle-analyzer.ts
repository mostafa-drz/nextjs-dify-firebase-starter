/**
 * Bundle Analysis and Optimization Utilities
 * Helps identify and optimize bundle size
 */

/**
 * Bundle size thresholds for different environments
 */
export const BUNDLE_THRESHOLDS = {
  development: {
    maxInitialChunkSize: 1000 * 1024, // 1MB
    maxChunkSize: 500 * 1024, // 500KB
    maxTotalSize: 5 * 1024 * 1024, // 5MB
  },
  production: {
    maxInitialChunkSize: 200 * 1024, // 200KB
    maxChunkSize: 100 * 1024, // 100KB
    maxTotalSize: 1 * 1024 * 1024, // 1MB
  },
} as const;

/**
 * Critical components that should be loaded immediately
 */
export const CRITICAL_COMPONENTS = [
  'ErrorBoundary',
  'AuthProvider',
  'QueryProvider',
  'FirebaseProvider',
  'PageLayout',
  'Header',
] as const;

/**
 * Non-critical components that can be lazy-loaded
 */
export const LAZY_COMPONENTS = [
  'DifyChat',
  'ConversationList',
  'SuggestedQuestions',
  'MessageFeedback',
  'CreditDisplay',
  'InsufficientCredits',
  'ReactQueryDevtools',
] as const;

/**
 * Heavy libraries that should be dynamically imported
 */
export const HEAVY_LIBRARIES = [
  '@tanstack/react-query-devtools',
  '@sentry/nextjs',
  'firebase/analytics',
  'recharts',
  '@tiptap/react',
  'react-dropzone',
  'monaco-editor',
  'codemirror',
] as const;

/**
 * Bundle optimization strategies
 */
export const OPTIMIZATION_STRATEGIES = {
  // Split vendor chunks
  vendorChunking: {
    react: ['react', 'react-dom'],
    ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label'],
    firebase: ['firebase', 'firebase-admin'],
    utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
  },

  // Preload critical resources
  preloadCritical: ['/fonts/geist-sans.woff2', '/fonts/geist-mono.woff2'],

  // Prefetch non-critical resources
  prefetchNonCritical: ['/api/conversations', '/api/credits'],
} as const;

/**
 * Bundle size monitoring
 */
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return null;

  const performance = window.performance;
  if (!performance || !performance.getEntriesByType) return null;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  const bundleAnalysis = {
    totalSize: 0,
    jsSize: 0,
    cssSize: 0,
    fontSize: 0,
    imageSize: 0,
    otherSize: 0,
    chunks: [] as Array<{
      name: string;
      size: number;
      loadTime: number;
    }>,
  };

  resources.forEach((resource) => {
    const size = resource.transferSize || 0;
    bundleAnalysis.totalSize += size;

    if (resource.name.includes('.js')) {
      bundleAnalysis.jsSize += size;
    } else if (resource.name.includes('.css')) {
      bundleAnalysis.cssSize += size;
    } else if (resource.name.includes('font') || resource.name.includes('.woff')) {
      bundleAnalysis.fontSize += size;
    } else if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      bundleAnalysis.imageSize += size;
    } else {
      bundleAnalysis.otherSize += size;
    }

    // Track chunks
    if (resource.name.includes('_next/static/chunks/')) {
      bundleAnalysis.chunks.push({
        name: resource.name.split('/').pop() || 'unknown',
        size,
        loadTime: resource.responseEnd - resource.requestStart,
      });
    }
  });

  return bundleAnalysis;
}

/**
 * Check if bundle size is within acceptable limits
 */
export function isBundleSizeAcceptable(
  environment: 'development' | 'production' = 'production'
): boolean {
  const analysis = analyzeBundleSize();
  if (!analysis) return true; // Can't analyze, assume it's fine

  const thresholds = BUNDLE_THRESHOLDS[environment];

  return (
    analysis.totalSize <= thresholds.maxTotalSize &&
    analysis.jsSize <= thresholds.maxInitialChunkSize
  );
}

/**
 * Get bundle optimization recommendations
 */
export function getBundleOptimizationRecommendations(): string[] {
  const analysis = analyzeBundleSize();
  if (!analysis) return [];

  const recommendations: string[] = [];

  if (analysis.jsSize > BUNDLE_THRESHOLDS.production.maxInitialChunkSize) {
    recommendations.push('Consider code splitting for JavaScript bundles');
  }

  if (analysis.cssSize > 50 * 1024) {
    // 50KB
    recommendations.push('Consider purging unused CSS');
  }

  if (analysis.fontSize > 100 * 1024) {
    // 100KB
    recommendations.push('Consider font subsetting or using system fonts');
  }

  if (analysis.imageSize > 200 * 1024) {
    // 200KB
    recommendations.push('Consider image optimization and lazy loading');
  }

  const largeChunks = analysis.chunks.filter((chunk) => chunk.size > 50 * 1024); // 50KB
  if (largeChunks.length > 0) {
    recommendations.push(
      `Consider splitting large chunks: ${largeChunks.map((c) => c.name).join(', ')}`
    );
  }

  return recommendations;
}
