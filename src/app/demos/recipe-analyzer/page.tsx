/**
 * @fileoverview Smart Recipe Analyzer & Meal Planner demo page
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { Suspense } from 'react';
import { RecipeAnalyzerDemoClient } from './RecipeAnalyzerDemoClient';

/**
 * Smart Recipe Analyzer & Meal Planner demo page
 *
 * A production-ready demo showcasing Dify's multimodal capabilities for meal planning
 *
 * @returns JSX element for the recipe analyzer demo page
 */
export default function RecipeAnalyzerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipeAnalyzerDemoClient />
    </Suspense>
  );
}
