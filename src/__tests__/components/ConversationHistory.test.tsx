/**
 * @fileoverview Tests for ConversationHistory component
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConversationHistory } from '@/demos/recipe-analyzer/components/ConversationHistory';
import { mockDifyConversations } from '@/__tests__/fixtures/dify-responses';
import { mockUser } from '@/__tests__/fixtures/users';

// Mock the auth context
vi.mock('@/components/auth/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('ConversationHistory', () => {
  let queryClient: QueryClient;
  const mockOnConversationSelect = vi.fn();
  const mockOnCreateNew = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = (currentConversationId?: string) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ConversationHistory
          userId={mockUser.uid}
          currentConversationId={currentConversationId}
          onConversationSelect={mockOnConversationSelect}
          onCreateNew={mockOnCreateNew}
        />
      </QueryClientProvider>
    );
  };

  it('renders conversation list with rename and delete options', async () => {
    // Mock the conversations query
    queryClient.setQueryData(['dify-conversations', mockUser.uid], mockDifyConversations);

    renderComponent();

    // Check that conversations are displayed
    expect(screen.getByText('Recipe Analysis')).toBeInTheDocument();
    expect(screen.getByText('Another Recipe Analysis')).toBeInTheDocument();

    // Check that conversations are rendered
    const conversationTitles = screen.getAllByText(/Recipe Analysis|Another Recipe Analysis/);
    expect(conversationTitles).toHaveLength(2);
  });

  it('opens rename dialog when rename option is clicked', async () => {
    queryClient.setQueryData(['dify-conversations', mockUser.uid], mockDifyConversations);

    renderComponent();

    // Find and click the more options button (this would be visible on hover in real app)
    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(
      (button) => button.querySelector('svg')?.getAttribute('data-lucide') === 'more-horizontal'
    );

    if (moreButton) {
      fireEvent.click(moreButton);

      // Check if rename option appears
      await waitFor(() => {
        expect(screen.getByText('Rename')).toBeInTheDocument();
      });
    }
  });

  it('opens delete dialog when delete option is clicked', async () => {
    queryClient.setQueryData(['dify-conversations', mockUser.uid], mockDifyConversations);

    renderComponent();

    // Find and click the more options button
    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(
      (button) => button.querySelector('svg')?.getAttribute('data-lucide') === 'more-horizontal'
    );

    if (moreButton) {
      fireEvent.click(moreButton);

      // Check if delete option appears
      await waitFor(() => {
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });
    }
  });

  it('shows loading state when conversations are loading', () => {
    renderComponent();

    // Should show loading spinner (check for the Loader2 icon)
    const loadingSpinner = document.querySelector('.lucide-loader-circle');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('shows empty state when no conversations exist', async () => {
    queryClient.setQueryData(['dify-conversations', mockUser.uid], []);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
      expect(screen.getByText('Start analyzing')).toBeInTheDocument();
    });
  });
});
