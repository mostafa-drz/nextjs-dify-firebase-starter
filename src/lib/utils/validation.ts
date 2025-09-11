/**
 * Input validation and sanitization utilities
 * Provides secure validation for user inputs and API requests
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize text input
 */
export function sanitizeText(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') return '';

  return sanitizeHtml(input).substring(0, maxLength).trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

/**
 * Validate user ID format (Firebase UID)
 */
export function isValidUserId(userId: string): boolean {
  if (typeof userId !== 'string') return false;

  // Firebase UIDs are typically 28 characters, alphanumeric
  const uidRegex = /^[a-zA-Z0-9]{20,30}$/;
  return uidRegex.test(userId);
}

/**
 * Validate conversation ID format
 */
export function isValidConversationId(conversationId: string): boolean {
  if (typeof conversationId !== 'string') return false;

  // Dify conversation IDs are typically UUID-like
  const uuidRegex = /^[a-f0-9-]{36}$/i;
  return uuidRegex.test(conversationId);
}

/**
 * Validate API key format
 */
export function isValidApiKey(apiKey: string): boolean {
  if (typeof apiKey !== 'string') return false;

  // Dify API keys start with 'app-' or 'sk-'
  const apiKeyRegex = /^(app-|sk-)[a-zA-Z0-9-]{20,}$/;
  return apiKeyRegex.test(apiKey);
}

/**
 * Validate message content for chat
 */
export function validateMessageContent(content: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (typeof content !== 'string') {
    return { isValid: false, sanitized: '', error: 'Content must be a string' };
  }

  const sanitized = sanitizeText(content, 5000); // Max 5000 characters

  if (sanitized.length === 0) {
    return { isValid: false, sanitized: '', error: 'Content cannot be empty' };
  }

  if (sanitized.length < 2) {
    return { isValid: false, sanitized: '', error: 'Content too short' };
  }

  // Check for potential injection patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /function\s*\(/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      return { isValid: false, sanitized: '', error: 'Content contains suspicious patterns' };
    }
  }

  return { isValid: true, sanitized };
}

/**
 * Validate chat request parameters
 */
export function validateChatRequest(request: {
  query?: string;
  user?: string;
  conversation_id?: string;
  response_mode?: string;
}): {
  isValid: boolean;
  sanitized: any;
  errors: string[];
} {
  const errors: string[] = [];
  const sanitized: any = {};

  // Validate query
  if (!request.query) {
    errors.push('Query is required');
  } else {
    const queryValidation = validateMessageContent(request.query);
    if (!queryValidation.isValid) {
      errors.push(`Query: ${queryValidation.error}`);
    } else {
      sanitized.query = queryValidation.sanitized;
    }
  }

  // Validate user ID
  if (!request.user) {
    errors.push('User ID is required');
  } else if (!isValidUserId(request.user)) {
    errors.push('Invalid user ID format');
  } else {
    sanitized.user = request.user;
  }

  // Validate conversation ID (optional)
  if (request.conversation_id && !isValidConversationId(request.conversation_id)) {
    errors.push('Invalid conversation ID format');
  } else {
    sanitized.conversation_id = request.conversation_id;
  }

  // Validate response mode
  const validResponseModes = ['blocking', 'streaming'];
  if (request.response_mode && !validResponseModes.includes(request.response_mode)) {
    errors.push('Invalid response mode');
  } else {
    sanitized.response_mode = request.response_mode || 'blocking';
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors,
  };
}

/**
 * Rate limiting validation
 */
export function validateRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  // This is a simple in-memory rate limiter
  // In production, use Redis or database-based rate limiting
  const now = Date.now();
  const key = `rate_limit_${identifier}`;

  if (typeof window === 'undefined') {
    // Server-side: use a simple Map (not persistent across restarts)
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }

    const store = global.rateLimitStore as Map<string, { count: number; resetTime: number }>;
    const limit = store.get(key);

    if (!limit || now > limit.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    store.set(key, limit);
    return true;
  }

  // Client-side: use localStorage
  try {
    const stored = localStorage.getItem(key);
    const limit = stored ? JSON.parse(stored) : null;

    if (!limit || now > limit.resetTime) {
      localStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
      return true;
    }

    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    localStorage.setItem(key, JSON.stringify(limit));
    return true;
  } catch {
    return true; // Fail open if localStorage is not available
  }
}

// Extend global type for server-side rate limiting
declare global {
  var rateLimitStore: Map<string, { count: number; resetTime: number }> | undefined;
}
