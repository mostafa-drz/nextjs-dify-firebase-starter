// Credit system configuration
export const CREDIT_CONFIG = {
  INITIAL_CREDITS: 100,         // Credits for new users
  WARNING_THRESHOLD: 10,        // Show warning below this amount
  TOKENS_PER_CREDIT: 1000,      // 1 credit = 1000 tokens
  FREE_TIER_CREDITS: 100,       // New users get 100 credits
  MIN_CREDITS_WARNING: 10,      // Warn when below 10 credits
} as const;

// Analytics configuration
export const ANALYTICS_CONFIG = {
  TRACK_USER_AGENTS: true,
  TRACK_RESPONSE_TIMES: true,
  AGGREGATE_DAILY: true,
} as const;

// App configuration
export const APP_CONFIG = {
  NAME: 'Dify AI Assistant',
  DESCRIPTION: 'AI-powered assistant with secure integration',
  SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@yourdomain.com',
} as const;

// Dify API configuration (server-side only)
export const DIFY_CONFIG = {
  API_BASE_URL: 'https://api.dify.ai',
  EMBED_BASE_URL: 'https://udify.app',
  TIMEOUT: 30000, // 30 seconds timeout
} as const;