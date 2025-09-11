import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Page Container Component
 * Provides consistent container styling and spacing
 */
interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export function PageContainer({ children, className, maxWidth = '7xl' }: PageContainerProps) {
  return (
    <div className={cn('container mx-auto px-4 py-8', maxWidthClasses[maxWidth], className)}>
      {children}
    </div>
  );
}
