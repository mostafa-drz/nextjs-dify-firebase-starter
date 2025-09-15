'use client';

/**
 * @fileoverview Client wrapper for Recipe Analyzer Demo
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RecipeAnalyzerDemo } from '@/demos/recipe-analyzer/components/RecipeAnalyzerDemo';
import { DemoLayout } from '@/demos/shared/DemoLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

/**
 * Client-side wrapper for Recipe Analyzer Demo
 *
 * This component handles authentication, URL parameters, and client-side functionality
 * while keeping the server component page clean.
 */
export function RecipeAnalyzerDemoClient() {
  const searchParams = useSearchParams();
  const [conversationId, setConversationId] = useState<string | undefined>();

  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    setConversationId(conversationParam || undefined);
  }, [searchParams]);

  const handleConversationSelect = (newConversationId: string) => {
    setConversationId(newConversationId);
  };

  const handleCreateNew = () => {
    setConversationId(undefined);
  };

  return (
    <ProtectedRoute>
      <DemoLayout
        title="What Can I Cook?"
        description="Snap a photo of your ingredients and get instant recipe suggestions"
      >
        <RecipeAnalyzerDemo
          conversationId={conversationId}
          onConversationSelect={handleConversationSelect}
          onCreateNew={handleCreateNew}
        />
      </DemoLayout>
    </ProtectedRoute>
  );
}
