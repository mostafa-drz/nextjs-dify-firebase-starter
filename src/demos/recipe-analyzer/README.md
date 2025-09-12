# Smart Recipe Analyzer & Meal Planner

A daily tool that analyzes food images and creates personalized meal plans with nutritional insights.

## Overview

This demo showcases how to build a practical AI-powered application using Dify's multimodal capabilities. Users can upload photos of their food, fridge contents, or pantry, and get intelligent meal planning suggestions.

## Features

- **Image Analysis**: Upload photos of food/fridge contents
- **Smart Chat**: AI analyzes what you have and suggests recipes
- **Meal Planning**: Conversational meal planning for the week
- **Nutritional Insights**: Get health recommendations based on your food
- **Shopping Lists**: Generate shopping lists from meal plans

## User Flow

1. User uploads photo of their fridge/pantry/food
2. AI analyzes the image and identifies available ingredients
3. User chats with AI to plan meals: "What can I make with these ingredients?"
4. AI suggests recipes and creates a meal plan
5. User can ask follow-up questions: "Make it healthier" or "Add more protein"
6. AI generates shopping list for missing ingredients

## Technical Implementation

- **Page**: `/demos/recipe-analyzer`
- **Dify Features Used**:
  - File upload (image analysis)
  - Chat with context
  - Conversation management
  - Suggested questions
- **UI Components**: Reuses existing chat, file upload, and conversation components

## Setup Instructions

1. Follow the [Dify Setup Guide](./dify-setup.md) to configure your Dify application
2. Ensure your environment variables are properly configured
3. Run the demo and start uploading food images!

## Demo URL

Access the demo at: `/demos/recipe-analyzer`

## Use Cases

- **Home Cooks**: Plan meals with ingredients they already have
- **Health-Conscious Users**: Get nutritional insights and healthier alternatives
- **Busy Professionals**: Quick meal planning without manual ingredient tracking
- **Students**: Budget-friendly meal planning with available ingredients
