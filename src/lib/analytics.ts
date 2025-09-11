'use client';

import { logEvent } from 'firebase/analytics';
import { getFirebaseAnalytics } from './utils/firebase-client';

/**
 * Simple Analytics for Dify Firebase Boilerplate
 * Focuses on essential business metrics only
 */

// Core analytics function
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  // Only track in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('📊 Analytics (dev):', eventName, parameters);
    return;
  }

  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  try {
    logEvent(analytics, eventName, parameters);
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

// === Essential Events ===

/**
 * Track page navigation
 */
export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '/',
  });
};

/**
 * Track user authentication
 */
export const trackAuth = (action: 'login' | 'logout' | 'signup') => {
  trackEvent('auth', {
    action,
  });
};

/**
 * Track credit usage - essential for business metrics
 */
export const trackCredits = (action: 'purchase' | 'deduct' | 'low_balance', amount?: number) => {
  trackEvent('credits', {
    action,
    amount,
  });
};

/**
 * Track Dify chat usage - core feature
 */
export const trackChat = (
  action: 'message_sent' | 'conversation_started',
  messageLength?: number
) => {
  trackEvent('chat', {
    action,
    message_length: messageLength,
  });
};

/**
 * Track external links
 */
export const trackExternalLink = (url: string) => {
  const domain = new URL(url).hostname;
  trackEvent('external_link', {
    domain,
  });
};
