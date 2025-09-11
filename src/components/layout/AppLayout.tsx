import { ReactNode } from 'react';
import { PageLayout } from './PageLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

/**
 * App Layout Component
 * Provides a consistent layout structure for the application
 */
interface AppLayoutProps {
  children: ReactNode;
  currentPage?: 'chat' | 'conversations' | 'profile';
  requireAuth?: boolean;
}

export function AppLayout({ children, currentPage, requireAuth = true }: AppLayoutProps) {
  const content = <PageLayout currentPage={currentPage}>{children}</PageLayout>;

  if (requireAuth) {
    return <ProtectedRoute>{content}</ProtectedRoute>;
  }

  return content;
}
