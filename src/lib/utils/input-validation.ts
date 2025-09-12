/**
 * @fileoverview Input validation and sanitization utilities for MVP
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 *
 * Provides basic input validation and sanitization to prevent common attacks.
 * Designed for MVP with essential security measures.
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether the input is valid */
  valid: boolean;
  /** Sanitized input (if valid) */
  sanitized?: string;
  /** Error message (if invalid) */
  error?: string;
}

/**
 * Sanitize input to prevent XSS attacks
 *
 * @param input - Input string to sanitize
 * @returns Sanitized string
 *
 * @example
 * ```typescript
 * const sanitized = sanitizeInput('<script>alert("xss")</script>Hello');
 * console.log(sanitized); // "Hello"
 * ```
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return (
    input
      .trim()
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove javascript: protocols
      .replace(/javascript:/gi, '')
      // Remove on* event handlers
      .replace(/\bon\w+\s*=/gi, '')
      // Remove data: protocols (except safe ones)
      .replace(/data:(?!image\/(png|jpg|jpeg|gif|webp);base64,)/gi, '')
      // Remove vbscript: protocols
      .replace(/vbscript:/gi, '')
      // Remove iframe tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      // Remove object tags
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      // Remove embed tags
      .replace(/<embed\b[^<]*>/gi, '')
      // Remove applet tags
      .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '')
      // Remove form tags
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
      // Remove input tags
      .replace(/<input\b[^<]*>/gi, '')
      // Remove button tags
      .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
      // Remove link tags with javascript
      .replace(/<a\b[^>]*href\s*=\s*["']?javascript:[^"'>]*["']?[^>]*>/gi, '')
      // Remove style attributes with javascript
      .replace(/\s*style\s*=\s*["'][^"']*javascript:[^"']*["']/gi, '')
      // Remove any remaining dangerous attributes
      .replace(/\s*(on\w+|style|href|src)\s*=\s*["'][^"']*["']/gi, '')
  );
}

/**
 * Validate chat message input
 *
 * @param input - Chat message to validate
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = validateChatInput('Hello, how are you?');
 * if (!result.valid) {
 *   console.error(result.error);
 * } else {
 *   console.log(result.sanitized);
 * }
 * ```
 */
export function validateChatInput(input: unknown): ValidationResult {
  // Check if input is a string
  if (typeof input !== 'string') {
    return {
      valid: false,
      error: 'Input must be a string',
    };
  }

  // Check if input is empty
  if (input.trim().length === 0) {
    return {
      valid: false,
      error: 'Message cannot be empty',
    };
  }

  // Check if input is too long
  if (input.length > 4000) {
    return {
      valid: false,
      error: 'Message is too long. Maximum 4000 characters allowed.',
    };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<applet/i,
    /<form/i,
    /<input/i,
    /<button/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      return {
        valid: false,
        error: 'Message contains potentially dangerous content',
      };
    }
  }

  // Sanitize and return
  const sanitized = sanitizeInput(input);

  return {
    valid: true,
    sanitized,
  };
}

/**
 * Validate file upload input
 *
 * @param file - File to validate
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = validateFileUpload(file);
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateFileUpload(file: File): ValidationResult {
  // Check if file exists
  if (!file) {
    return {
      valid: false,
      error: 'No file provided',
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File is too large. Maximum 10MB allowed.',
    };
  }

  // Check file type
  const allowedTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/csv',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed. Please upload images, text files, or PDFs only.',
    };
  }

  // Check file name
  const sanitizedName = sanitizeInput(file.name);
  if (sanitizedName !== file.name) {
    return {
      valid: false,
      error: 'File name contains invalid characters',
    };
  }

  return {
    valid: true,
  };
}

/**
 * Validate email input
 *
 * @param email - Email to validate
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = validateEmail('user@example.com');
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateEmail(email: unknown): ValidationResult {
  if (typeof email !== 'string') {
    return {
      valid: false,
      error: 'Email must be a string',
    };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return {
      valid: false,
      error: 'Email cannot be empty',
    };
  }

  if (trimmedEmail.length > 254) {
    return {
      valid: false,
      error: 'Email is too long',
    };
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return {
      valid: false,
      error: 'Invalid email format',
    };
  }

  // Check for suspicious patterns
  if (/<script/i.test(trimmedEmail) || /javascript:/i.test(trimmedEmail)) {
    return {
      valid: false,
      error: 'Email contains invalid content',
    };
  }

  return {
    valid: true,
    sanitized: trimmedEmail,
  };
}

/**
 * Validate user ID input
 *
 * @param userId - User ID to validate
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = validateUserId('user123');
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateUserId(userId: unknown): ValidationResult {
  if (typeof userId !== 'string') {
    return {
      valid: false,
      error: 'User ID must be a string',
    };
  }

  const trimmedUserId = userId.trim();

  if (trimmedUserId.length === 0) {
    return {
      valid: false,
      error: 'User ID cannot be empty',
    };
  }

  if (trimmedUserId.length > 128) {
    return {
      valid: false,
      error: 'User ID is too long',
    };
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  const validUserIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!validUserIdRegex.test(trimmedUserId)) {
    return {
      valid: false,
      error: 'User ID contains invalid characters',
    };
  }

  return {
    valid: true,
    sanitized: trimmedUserId,
  };
}

/**
 * Validate conversation ID input
 *
 * @param conversationId - Conversation ID to validate
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = validateConversationId('conv123');
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateConversationId(conversationId: unknown): ValidationResult {
  if (conversationId === null || conversationId === undefined) {
    return {
      valid: true, // Optional field
    };
  }

  if (typeof conversationId !== 'string') {
    return {
      valid: false,
      error: 'Conversation ID must be a string',
    };
  }

  const trimmedId = conversationId.trim();

  if (trimmedId.length === 0) {
    return {
      valid: false,
      error: 'Conversation ID cannot be empty',
    };
  }

  if (trimmedId.length > 128) {
    return {
      valid: false,
      error: 'Conversation ID is too long',
    };
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  const validIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!validIdRegex.test(trimmedId)) {
    return {
      valid: false,
      error: 'Conversation ID contains invalid characters',
    };
  }

  return {
    valid: true,
    sanitized: trimmedId,
  };
}
