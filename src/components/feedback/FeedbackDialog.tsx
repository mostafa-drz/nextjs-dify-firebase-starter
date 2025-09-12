'use client';

/**
 * Feedback dialog component for collecting user feedback
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { submitFeedback, getPageContext, getUserContext } from '@/lib/services/feedback';
import type { FeedbackData, FeedbackConfig } from '@/types/feedback';

interface FeedbackDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Configuration for the feedback form */
  config?: FeedbackConfig;
}

export function FeedbackDialog({ open, onOpenChange, config }: FeedbackDialogProps) {
  const [formData, setFormData] = useState<FeedbackData>({
    message: '',
    email: '',
    name: '',
    category: 'general',
    priority: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      setSubmitResult({
        success: false,
        message: 'Please enter your feedback message.',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const result = await submitFeedback({
        ...formData,
        page: getPageContext(),
        context: getUserContext(),
      });

      if (result.success) {
        setSubmitResult({
          success: true,
          message: "Thank you for your feedback! We'll review it and get back to you if needed.",
        });

        // Reset form
        setFormData({
          message: '',
          email: '',
          name: '',
          category: 'general',
          priority: 'medium',
        });

        // Close dialog after a short delay
        setTimeout(() => {
          onOpenChange(false);
          setSubmitResult(null);
        }, 2000);
      } else {
        setSubmitResult({
          success: false,
          message: result.error || 'Failed to submit feedback. Please try again.',
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FeedbackData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve by sharing your thoughts, reporting bugs, or suggesting new features.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feedback Category */}
          {config?.categories && config.categories.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                {config.categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Name Field */}
          {(config?.requireName || formData.name) && (
            <div className="space-y-2">
              <Label htmlFor="name">
                Name {config?.requireName && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your name"
                required={config?.requireName}
              />
            </div>
          )}

          {/* Email Field */}
          {(config?.requireEmail || formData.email) && (
            <div className="space-y-2">
              <Label htmlFor="email">
                Email {config?.requireEmail && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required={config?.requireEmail}
              />
            </div>
          )}

          {/* Feedback Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Feedback <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder={config?.placeholder || "Tell us what's on your mind..."}
              className="w-full resize-none rounded-md border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low - General feedback</option>
              <option value="medium">Medium - Important issue</option>
              <option value="high">High - Critical issue</option>
            </select>
          </div>

          {/* Submit Result */}
          {submitResult && (
            <div
              className={`flex items-center gap-2 rounded-md p-3 ${
                submitResult.success
                  ? 'border border-green-200 bg-green-50 text-green-800'
                  : 'border border-red-200 bg-red-50 text-red-800'
              }`}
            >
              {submitResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{submitResult.message}</span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.message.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
