/**
 * @fileoverview Common layout component for demo pages
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

interface DemoLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  backPath?: string;
}

/**
 * Common layout component for demo pages
 *
 * Provides consistent navigation and structure for all demo applications
 *
 * @param props - Component props
 * @returns JSX element for the demo layout
 */
export function DemoLayout({ children, title, description, backPath = '/demos' }: DemoLayoutProps) {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={backPath}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Demos
                </Link>
              </Button>
              <div className="bg-border h-6 w-px" />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Demo Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-lg">{description}</p>
        </div>

        {/* Demo Content */}
        {children}
      </main>
    </div>
  );
}
