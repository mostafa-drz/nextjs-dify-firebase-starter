'use client';

/**
 * Floating feedback button component
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { FeedbackDialog } from './FeedbackDialog';
import type { FeedbackConfig } from '@/types/feedback';

interface FeedbackButtonProps {
  /** Configuration for the feedback button and dialog */
  config?: FeedbackConfig;
  /** Custom className for styling */
  className?: string;
}

export function FeedbackButton({ config, className }: FeedbackButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Don't render if feedback is disabled
  if (config?.enabled === false) {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6',
  };

  const position = config?.position || 'bottom-right';

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className={`${positionClasses[position]} z-50 shadow-lg transition-all duration-200 hover:shadow-xl ${className || ''}`}
        size="lg"
        variant="default"
      >
        <MessageSquare className="mr-2 h-5 w-5" />
        {config?.buttonText || 'Feedback'}
      </Button>

      <FeedbackDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} config={config} />
    </>
  );
}
