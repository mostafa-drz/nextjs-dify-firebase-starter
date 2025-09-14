import { CreditDisplay } from '@/components/credits/CreditDisplay';
import { ConversationList } from '@/components/dify/ConversationList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Chat Sidebar Component
 * Contains the conversation list, credits, and integration info
 */
interface ChatSidebarProps {
  userId: string;
  currentConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onCreateNew: () => void;
}

export function ChatSidebar({
  userId,
  currentConversationId,
  onConversationSelect,
  onCreateNew,
}: ChatSidebarProps) {
  return (
    <div className="space-y-6 lg:col-span-1">
      {/* Credit Display */}
      <CreditDisplay variant="card" />

      {/* Conversation List */}
      <ConversationList
        userId={userId}
        currentConversationId={currentConversationId}
        onConversationSelect={onConversationSelect}
        onCreateNew={onCreateNew}
      />

      {/* Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Secure Integration</CardTitle>
          <CardDescription>How this demo works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>✅ Server-side API calls</strong>
            <p className="text-muted-foreground">API keys never exposed to client</p>
          </div>

          <div>
            <strong>✅ Credit tracking</strong>
            <p className="text-muted-foreground">Automatic deduction based on token usage</p>
          </div>

          <div>
            <strong>✅ Pre-flight checks</strong>
            <p className="text-muted-foreground">Prevents calls without sufficient credits</p>
          </div>

          <div>
            <strong>✅ Error handling</strong>
            <p className="text-muted-foreground">Graceful degradation and user feedback</p>
          </div>

          <div>
            <strong>✅ Real-time updates</strong>
            <p className="text-muted-foreground">Live credit balance updates</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
