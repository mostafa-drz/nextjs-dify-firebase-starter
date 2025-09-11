import { Button } from './button';
import { MessageSquare, MessageCircle, CreditCard, FileText, Users } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-12 text-center ${className}`}
    >
      <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

/**
 * Empty state for conversation list
 */
export function EmptyConversations({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <EmptyState
      icon={<MessageSquare className="text-muted-foreground h-8 w-8" />}
      title="No conversations yet"
      description="Start a new conversation with your AI assistant to get started."
      action={{
        label: 'Start New Chat',
        onClick: onCreateNew,
      }}
    />
  );
}

/**
 * Empty state for messages in a conversation
 */
export function EmptyMessages() {
  return (
    <EmptyState
      icon={<MessageCircle className="text-muted-foreground h-8 w-8" />}
      title="No messages yet"
      description="Send a message to start the conversation."
      className="py-8"
    />
  );
}

/**
 * Empty state for credit history
 */
export function EmptyCreditHistory() {
  return (
    <EmptyState
      icon={<CreditCard className="text-muted-foreground h-8 w-8" />}
      title="No credit history"
      description="Your credit usage history will appear here once you start using the AI assistant."
    />
  );
}

/**
 * Empty state for search results
 */
export function EmptySearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<FileText className="text-muted-foreground h-8 w-8" />}
      title="No results found"
      description={`No conversations found matching "${query}". Try a different search term.`}
    />
  );
}

/**
 * Empty state for user profile
 */
export function EmptyUserProfile() {
  return (
    <EmptyState
      icon={<Users className="text-muted-foreground h-8 w-8" />}
      title="Profile not found"
      description="Unable to load your profile information. Please try refreshing the page."
    />
  );
}

/**
 * Empty state for suggested questions
 */
export function EmptySuggestedQuestions() {
  return (
    <div className="py-8 text-center">
      <MessageSquare className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
      <p className="text-muted-foreground text-sm">
        No suggested questions available at the moment.
      </p>
    </div>
  );
}
