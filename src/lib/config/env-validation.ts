/**
 * Environment variable validation utilities
 * Ensures all required environment variables are present at startup
 */

interface EnvConfig {
  // Firebase Client Configuration
  NEXT_PUBLIC_FIREBASE_API_KEY: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  NEXT_PUBLIC_FIREBASE_APP_ID: string;

  // Firebase Admin Configuration (Server-side only)
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;

  // Dify Configuration (Server-side only - NEVER expose to client)
  DIFY_API_KEY: string;
  DIFY_BASE_URL: string;

  // Application Configuration
  NEXT_PUBLIC_SUPPORT_EMAIL: string;
}

/**
 * Required environment variables for client-side
 */
const CLIENT_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_SUPPORT_EMAIL',
] as const;

/**
 * Required environment variables for server-side
 */
const SERVER_ENV_VARS = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'DIFY_API_KEY',
  'DIFY_BASE_URL',
] as const;

/**
 * Validation error class
 */
export class EnvValidationError extends Error {
  constructor(
    message: string,
    public missingVars: string[]
  ) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * Validates client-side environment variables
 * Should be called in client components
 */
export function validateClientEnv(): void {
  const missing: string[] = [];

  for (const varName of CLIENT_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new EnvValidationError(
      `Missing required client environment variables: ${missing.join(', ')}`,
      missing
    );
  }
}

/**
 * Validates server-side environment variables
 * Should be called in server actions/components
 */
export function validateServerEnv(): void {
  const missing: string[] = [];

  for (const varName of SERVER_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new EnvValidationError(
      `Missing required server environment variables: ${missing.join(', ')}`,
      missing
    );
  }
}

/**
 * Validates all environment variables (client + server)
 * Should be called in server-side code only
 */
export function validateAllEnv(): void {
  validateClientEnv();
  validateServerEnv();
}

/**
 * Gets a validated environment variable value
 * Throws if the variable is missing
 */
export function getRequiredEnv(key: keyof EnvConfig): string {
  const value = process.env[key];
  if (!value) {
    throw new EnvValidationError(`Required environment variable ${key} is missing`, [key]);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
export function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Environment validation status
 */
export interface EnvStatus {
  isValid: boolean;
  missingVars: string[];
  errors: string[];
}

/**
 * Checks client-side environment status without throwing
 * Should only be called from client components
 * Returns validation status for client-side variables only
 */
export function checkClientEnvStatus(): EnvStatus {
  const missing: string[] = [];
  const errors: string[] = [];

  // Only check client vars when running on client
  if (typeof window !== 'undefined') {
    for (const varName of CLIENT_ENV_VARS) {
      if (!process.env[varName]) {
        missing.push(varName);
        errors.push(`Client: ${varName} is missing`);
      }
    }
  }

  return {
    isValid: missing.length === 0,
    missingVars: missing,
    errors,
  };
}

/**
 * Checks server-side environment status without throwing
 * Should only be called from server components
 * Returns validation status for server-side variables only
 */
export function checkServerEnvStatus(): EnvStatus {
  const missing: string[] = [];
  const errors: string[] = [];

  // Only check server vars when running on server
  if (typeof window === 'undefined') {
    for (const varName of SERVER_ENV_VARS) {
      if (!process.env[varName]) {
        missing.push(varName);
        errors.push(`Server: ${varName} is missing`);
      }
    }
  }

  return {
    isValid: missing.length === 0,
    missingVars: missing,
    errors,
  };
}

/**
 * Checks environment status without throwing
 * Returns validation status for both client and server variables
 * @deprecated Use checkClientEnvStatus() or checkServerEnvStatus() instead
 */
export function checkEnvStatus(): EnvStatus {
  const missing: string[] = [];
  const errors: string[] = [];

  // Check client vars
  for (const varName of CLIENT_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
      errors.push(`Client: ${varName} is missing`);
    }
  }

  // Check server vars (only in server context)
  if (typeof window === 'undefined') {
    for (const varName of SERVER_ENV_VARS) {
      if (!process.env[varName]) {
        missing.push(varName);
        errors.push(`Server: ${varName} is missing`);
      }
    }
  }

  return {
    isValid: missing.length === 0,
    missingVars: missing,
    errors,
  };
}
