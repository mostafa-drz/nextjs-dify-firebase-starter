'use client';

import { ReactNode } from 'react';
import { Header } from './Header';

interface PageLayoutProps {
  children: ReactNode;
  currentPage?: 'chat' | 'conversations' | 'profile';
}

export function PageLayout({ children, currentPage }: PageLayoutProps) {
  return (
    <>
      <Header currentPage={currentPage} />
      <main className="min-h-screen bg-background">
        {children}
      </main>
    </>
  );
}
