// TODO: Remove this provider, it seems redundant
'use client';

/**
 * Firebase Provider Component
 * Simple wrapper - Firebase is already initialized in client.ts
 */
interface FirebaseProviderProps {
  children: React.ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  return <>{children}</>;
}
