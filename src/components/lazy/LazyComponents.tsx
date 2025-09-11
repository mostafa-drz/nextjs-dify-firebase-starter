/**
 * Lazy Components for Code Splitting
 * Implements dynamic imports for better bundle optimization
 */

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

/**
 * Loading component for lazy-loaded components
 */
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
  </div>
);

/**
 * Lazy-loaded DifyChat component
 * This is a heavy component with many dependencies
 */
export const LazyDifyChat = dynamic(
  () => import('@/components/dify/DifyChat').then((mod) => ({ default: mod.DifyChat })),
  {
    loading: LoadingSpinner,
    ssr: false, // Disable SSR for this component as it's client-heavy
  }
);

/**
 * Lazy-loaded ConversationList component
 * Contains complex state management and API calls
 */
export const LazyConversationList = dynamic(
  () =>
    import('@/components/dify/ConversationList').then((mod) => ({ default: mod.ConversationList })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

/**
 * Lazy-loaded SuggestedQuestions component
 * Not critical for initial page load
 */
export const LazySuggestedQuestions = dynamic(
  () =>
    import('@/components/dify/SuggestedQuestions').then((mod) => ({
      default: mod.SuggestedQuestions,
    })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

/**
 * Lazy-loaded MessageFeedback component
 * Only needed when messages are displayed
 */
export const LazyMessageFeedback = dynamic(
  () =>
    import('@/components/dify/MessageFeedback').then((mod) => ({ default: mod.MessageFeedback })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

/**
 * Lazy-loaded CreditDisplay component
 * Contains complex credit calculations
 */
export const LazyCreditDisplay = dynamic(
  () =>
    import('@/components/credits/CreditDisplay').then((mod) => ({ default: mod.CreditDisplay })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

/**
 * Lazy-loaded InsufficientCredits component
 * Only shown when credits are low
 */
export const LazyInsufficientCredits = dynamic(
  () =>
    import('@/components/credits/InsufficientCredits').then((mod) => ({
      default: mod.InsufficientCredits,
    })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

/**
 * Lazy-loaded React Query Devtools
 * Only needed in development
 */
export const LazyReactQueryDevtools = dynamic(
  () =>
    import('@tanstack/react-query-devtools').then((mod) => ({ default: mod.ReactQueryDevtools })),
  {
    loading: () => null, // No loading state for devtools
    ssr: false,
  }
);

/**
 * Note: Sentry withErrorBoundary and Firebase getAnalytics are functions, not components
 * They should be imported directly when needed, not dynamically loaded
 */

/**
 * Additional lazy-loaded components can be added here as needed
 * Examples: Charts, Rich Text Editors, File Upload components, etc.
 * Only add them when the actual packages are installed
 */
