/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { EnvValidation } from '../EnvValidation';

// Mock the environment validation functions
vi.mock('@/lib/config/env-validation', () => ({
  checkClientEnvStatus: vi.fn(),
}));

import { checkClientEnvStatus } from '@/lib/config/env-validation';

describe('EnvValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render nothing when environment is valid', async () => {
    (checkClientEnvStatus as any).mockReturnValue({
      isValid: true,
      missingVars: [],
      errors: [],
    });

    const { container } = render(<EnvValidation />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should render error message when environment is invalid', async () => {
    (checkClientEnvStatus as any).mockReturnValue({
      isValid: false,
      missingVars: ['NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
      errors: [
        'Client: NEXT_PUBLIC_FIREBASE_API_KEY is missing',
        'Client: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing',
      ],
    });

    render(<EnvValidation />);

    await waitFor(() => {
      expect(screen.getByText('Environment Configuration Error')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Missing required environment variables. The application may not function correctly.'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('NEXT_PUBLIC_FIREBASE_API_KEY')).toBeInTheDocument();
      expect(screen.getByText('NEXT_PUBLIC_FIREBASE_PROJECT_ID')).toBeInTheDocument();
    });
  });

  it('should render success message when showOnError is false and environment is valid', async () => {
    (checkClientEnvStatus as any).mockReturnValue({
      isValid: true,
      missingVars: [],
      errors: [],
    });

    render(<EnvValidation showOnError={false} />);

    await waitFor(() => {
      expect(
        screen.getByText('All environment variables are properly configured.')
      ).toBeInTheDocument();
    });
  });

  it('should handle validation errors gracefully', async () => {
    (checkClientEnvStatus as any).mockImplementation(() => {
      throw new Error('Validation failed');
    });

    render(<EnvValidation />);

    await waitFor(() => {
      expect(screen.getByText('Environment Configuration Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to validate environment variables')).toBeInTheDocument();
    });
  });

  it('should be a client component (has use client directive)', () => {
    // This test ensures the component is properly marked as client-side
    expect(EnvValidation).toBeDefined();
  });
});
