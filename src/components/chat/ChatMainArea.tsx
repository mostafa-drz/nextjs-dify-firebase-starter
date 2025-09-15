import { DifyChat } from '@/components/dify/DifyChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, MessageSquare } from 'lucide-react';

/**
 * Chat Main Area Component
 * Contains the main chat interface and conversation management
 */
interface ChatMainAreaProps {
  currentConversationId?: string;
}

export function ChatMainArea({ currentConversationId }: ChatMainAreaProps) {
  return (
    <div className="lg:col-span-3">
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Conversations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <DifyChat
            name="Demo Assistant"
            placeholder="Type your message..."
            welcomeMessage="Hello! I'm your AI assistant powered by Dify. How can I help you today?"
            className="w-full"
            conversationId={currentConversationId}
          />
        </TabsContent>

        <TabsContent value="conversations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Conversations</CardTitle>
              <CardDescription>Browse and manage your conversation history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground py-8 text-center">
                <History className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>Conversation management is available in the sidebar</p>
                <p className="text-sm">
                  Use the conversation list on the left to browse your chats
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
