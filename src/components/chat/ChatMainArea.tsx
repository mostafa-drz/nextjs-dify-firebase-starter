import { useTranslations } from 'next-intl';
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
  const t = useTranslations('chat');

  return (
    <div className="lg:col-span-3">
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t('tabs.chat')}
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t('tabs.conversations')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <DifyChat
            name="Demo Assistant"
            placeholder={t('placeholder')}
            welcomeMessage={t('welcome')}
            className="w-full"
            conversationId={currentConversationId}
          />
        </TabsContent>

        <TabsContent value="conversations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('conversations.title')}</CardTitle>
              <CardDescription>{t('conversations.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground py-8 text-center">
                <History className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>{t('conversations.empty')}</p>
                <p className="text-sm">{t('conversations.emptyDescription')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
