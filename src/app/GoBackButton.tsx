'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Client component for browser history navigation
 * Handles the "Go Back" functionality that requires browser APIs
 */
export function GoBackButton() {
  return (
    <Button variant="ghost" onClick={() => window.history.back()} className="w-full justify-start">
      <ArrowLeft className="mr-2 h-4 w-4" />
      Go Back
    </Button>
  );
}
