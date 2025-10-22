/**
 * @fileoverview Type definitions for Recipe Analyzer demo
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

/**
 * Recipe analysis result from Dify
 */
export interface RecipeAnalysisResult {
  ingredients: string[];
  suggestedRecipes: Recipe[];
  nutritionalInsights: NutritionalInsight[];
  mealPlan?: MealPlan;
}

/**
 * Recipe information
 */
export interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  nutritionalInfo?: NutritionalInfo;
}

/**
 * Nutritional information for a recipe
 */
export interface NutritionalInfo {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  fiber: number; // in grams
  sugar: number; // in grams
}

/**
 * Nutritional insight about ingredients
 */
export interface NutritionalInsight {
  ingredient: string;
  benefits: string[];
  warnings?: string[];
  alternatives?: string[];
}

/**
 * Weekly meal plan
 */
export interface MealPlan {
  week: Date;
  days: DayPlan[];
  shoppingList: ShoppingItem[];
  totalNutrition: NutritionalInfo;
}

/**
 * Daily meal plan
 */
export interface DayPlan {
  date: Date;
  meals: {
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
    snacks?: Recipe[];
  };
  totalNutrition: NutritionalInfo;
}

/**
 * Shopping list item
 */
export interface ShoppingItem {
  name: string;
  quantity: string;
  category: 'produce' | 'dairy' | 'meat' | 'pantry' | 'frozen' | 'other';
  needed: boolean; // true if not available in uploaded image
  estimatedCost?: number;
}

/**
 * Chat message for recipe analyzer
 */
export interface RecipeChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    uploadedImage?: string;
    analysisResult?: RecipeAnalysisResult;
  };
}

/**
 * Upload status for image files
 */
export interface ImageUploadStatus {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: File | null;
}

/**
 * Demo configuration
 */
export interface RecipeAnalyzerConfig {
  maxFileSize: number; // in bytes
  allowedFileTypes: string[];
  enableNutritionalAnalysis: boolean;
  enableMealPlanning: boolean;
  enableShoppingList: boolean;
}
