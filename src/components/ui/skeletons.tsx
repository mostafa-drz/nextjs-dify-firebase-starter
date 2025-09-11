import { Skeleton } from './skeleton';

/**
 * Skeleton for chat messages
 */
export function MessageSkeleton() {
  return (
    <div className="flex items-start space-x-3 p-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

/**
 * Skeleton for conversation list items
 */
export function ConversationSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

/**
 * Skeleton for conversation list
 */
export function ConversationListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <ConversationSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for chat input
 */
export function ChatInputSkeleton() {
  return (
    <div className="flex items-center space-x-2 p-4">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-10" />
    </div>
  );
}

/**
 * Skeleton for app info
 */
export function AppInfoSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-6 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Skeleton for credit display
 */
export function CreditDisplaySkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}

/**
 * Skeleton for suggested questions
 */
export function SuggestedQuestionsSkeleton() {
  return (
    <div className="space-y-2 p-4">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-1 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}
