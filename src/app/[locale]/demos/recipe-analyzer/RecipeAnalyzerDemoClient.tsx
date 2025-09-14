'use client';

/**
 * @fileoverview Client wrapper for Recipe Analyzer Demo
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { RecipeAnalyzerDemo } from '@/demos/recipe-analyzer/components/RecipeAnalyzerDemo';
import { DemoLayout } from '@/demos/shared/DemoLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

/**
 * Client-side wrapper for Recipe Analyzer Demo
 *
 * This component handles authentication and client-side functionality
 * while keeping the server component page clean.
 */
export function RecipeAnalyzerDemoClient() {
  return (
    <ProtectedRoute>
      <DemoLayout
        title="What Can I Cook?"
        description="Snap a photo of your ingredients and get instant recipe suggestions"
      >
        <RecipeAnalyzerDemo />
      </DemoLayout>
    </ProtectedRoute>
  );
}
