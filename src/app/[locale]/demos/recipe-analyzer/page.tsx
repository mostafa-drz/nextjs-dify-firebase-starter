/**
 * @fileoverview Smart Recipe Analyzer & Meal Planner demo page
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { RecipeAnalyzerDemo } from '@/demos/recipe-analyzer/components/RecipeAnalyzerDemo';
import { DemoLayout } from '@/demos/shared/DemoLayout';

/**
 * Smart Recipe Analyzer & Meal Planner demo page
 *
 * A production-ready demo showcasing Dify's multimodal capabilities for meal planning
 *
 * @returns JSX element for the recipe analyzer demo page
 */
export default function RecipeAnalyzerPage() {
  return (
    <DemoLayout
      title="What Can I Cook?"
      description="Snap a photo of your ingredients and get instant recipe suggestions"
    >
      <RecipeAnalyzerDemo />
    </DemoLayout>
  );
}
