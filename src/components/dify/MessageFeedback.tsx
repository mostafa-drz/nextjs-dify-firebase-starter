'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

interface MessageFeedbackProps {
  messageId: string;
  userId: string;
  onFeedback?: (type: 'like' | 'dislike') => void;
}

export function MessageFeedback({ 
  messageId: _messageId, // eslint-disable-line @typescript-eslint/no-unused-vars
  userId: _userId, // eslint-disable-line @typescript-eslint/no-unused-vars
  onFeedback 
}: MessageFeedbackProps) {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFeedback = async (type: 'like' | 'dislike') => {
    if (feedback === type) return; // Already gave this feedback
    
    try {
      setLoading(true);
      
      // For now, we'll simulate the API call since we need to implement the feedback action
      // TODO: Implement actual feedback API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFeedback(type);
      onFeedback?.(type);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={() => handleFeedback('like')}
        disabled={loading}
        data-state={feedback === 'like' ? 'active' : 'inactive'}
      >
        {loading && feedback === 'like' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ThumbsUp className={`h-3 w-3 ${feedback === 'like' ? 'text-green-600' : ''}`} />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={() => handleFeedback('dislike')}
        disabled={loading}
        data-state={feedback === 'dislike' ? 'active' : 'inactive'}
      >
        {loading && feedback === 'dislike' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ThumbsDown className={`h-3 w-3 ${feedback === 'dislike' ? 'text-red-600' : ''}`} />
        )}
      </Button>
    </div>
  );
}
