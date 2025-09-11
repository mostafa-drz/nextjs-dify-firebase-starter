/**
 * @fileoverview Base service class for Dify API operations
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { DifyServiceConfig, DifyApiResponse } from './types';

/**
 * Custom error class for Dify API operations
 */
export class DifyApiError extends Error {
  /**
   * HTTP status code
   */
  public readonly status: number;

  /**
   * Error code for programmatic handling
   */
  public readonly code?: string;

  /**
   * Creates a new DifyApiError instance
   * @param message - Error message
   * @param status - HTTP status code
   * @param code - Error code (optional)
   */
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'DifyApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Base service class providing common functionality for all Dify services
 * @abstract
 */
export abstract class BaseDifyService {
  /**
   * Dify API key for authentication
   * @protected
   */
  protected readonly apiKey: string;

  /**
   * User identifier for conversation isolation
   * @protected
   */
  protected readonly userId: string;

  /**
   * Base URL for Dify API
   * @protected
   */
  protected readonly baseUrl: string;

  /**
   * Request timeout in milliseconds
   * @protected
   */
  protected readonly timeout: number;

  /**
   * Creates a new BaseDifyService instance
   * @param config - Service configuration
   */
  constructor(config: DifyServiceConfig) {
    this.apiKey = config.apiKey;
    this.userId = config.userId;
    this.baseUrl = config.baseUrl || 'https://api.dify.ai/v1';
    this.timeout = config.timeout || 30000;
  }

  /**
   * Makes a request to the Dify API
   * @param endpoint - API endpoint path
   * @param options - Fetch options
   * @returns Promise resolving to the response
   * @protected
   */
  protected async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new DifyApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DifyApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new DifyApiError('Request timeout', 408, 'TIMEOUT');
      }

      throw new DifyApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Makes a multipart form data request (for file uploads)
   * @param endpoint - API endpoint path
   * @param formData - Form data to send
   * @returns Promise resolving to the response
   * @protected
   */
  protected async makeMultipartRequest(endpoint: string, formData: FormData): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new DifyApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DifyApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new DifyApiError('Request timeout', 408, 'TIMEOUT');
      }

      throw new DifyApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Handles API errors and converts them to DifyApiResponse format
   * @param error - The error that occurred
   * @returns DifyApiResponse with error information
   * @protected
   */
  protected handleError<T = unknown>(error: unknown): DifyApiResponse<T> {
    console.error('Dify API error:', error);

    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.status,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 500,
      },
    };
  }

  /**
   * Validates required parameters with enhanced security checks
   * @param params - Object containing parameters to validate
   * @param requiredFields - Array of required field names
   * @throws {DifyApiError} If validation fails
   * @protected
   */
  protected validateRequired(params: unknown, requiredFields: string[]): void {
    if (typeof params !== 'object' || params === null) {
      throw new DifyApiError('Parameters must be an object', 400, 'INVALID_PARAM');
    }

    const paramObj = params as Record<string, unknown>;
    for (const field of requiredFields) {
      if (paramObj[field] === undefined || paramObj[field] === null || paramObj[field] === '') {
        throw new DifyApiError(`Missing required parameter: ${field}`, 400, 'INVALID_PARAM');
      }

      // Additional security validation for string fields
      if (typeof paramObj[field] === 'string') {
        const value = paramObj[field] as string;

        // Check for suspicious patterns
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /eval\s*\(/i,
          /function\s*\(/i,
        ];

        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            throw new DifyApiError(
              `Parameter ${field} contains suspicious content`,
              400,
              'INVALID_PARAM'
            );
          }
        }

        // Length validation
        if (value.length > 10000) {
          throw new DifyApiError(`Parameter ${field} is too long`, 400, 'INVALID_PARAM');
        }
      }
    }
  }

  /**
   * Gets the current user ID
   * @returns The user ID
   */
  public getUserId(): string {
    return this.userId;
  }

  /**
   * Gets the API key (masked for security)
   * @returns Masked API key
   */
  public getApiKey(): string {
    return this.apiKey.substring(0, 8) + '...';
  }
}
