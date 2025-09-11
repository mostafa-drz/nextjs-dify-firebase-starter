import { withErrorHandler, createApiError } from '@/lib/api-error-handler';
import { logError } from '@/lib/sentry';

export const GET = withErrorHandler(async () => {
  // Intentionally throw an error for testing
  const error = new Error('Test API error from Sentry test endpoint');
  
  // Log the error
  logError(error, { 
    endpoint: '/api/sentry-test-error',
    test: true,
    timestamp: new Date().toISOString()
  });

  // Return error response
  return createApiError('Test API error triggered successfully', 500, 'TEST_ERROR');
});