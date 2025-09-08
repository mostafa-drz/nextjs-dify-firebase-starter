// Credit system configuration
export const CREDIT_CONFIG = {
  TOKENS_PER_CREDIT: 1000,      // 1 credit = 1000 tokens
  FREE_TIER_CREDITS: 100,       // New users get 100 credits
  MIN_CREDITS_WARNING: 10,      // Warn when below 10 credits
  SESSION_DURATION: 60 * 60,    // Session expires after 1 hour (in seconds)
} as const;

// App configuration
export const APP_CONFIG = {
  SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@yourapp.com',
  DOMAIN_RESTRICTIONS: [], // No domain restrictions by default - flexible
  MAX_CONCURRENT_SESSIONS: 3, // Max 3 concurrent chat sessions per user
} as const;

// Dify API configuration
export const DIFY_CONFIG = {
  API_BASE_URL: 'https://api.dify.ai',
  EMBED_BASE_URL: 'https://udify.app',
  TIMEOUT: 30000, // 30 seconds timeout
} as const;