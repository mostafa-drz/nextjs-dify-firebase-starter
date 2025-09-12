import { useTranslations } from 'next-intl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

/**
 * Chat Header Component
 * Displays the main title and instructions for the chat page
 */
export function ChatHeader() {
  const t = useTranslations('chat');
  const tInstructions = useTranslations('instructions.difySetup');

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Instructions */}
      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>{tInstructions('title')}</strong> {tInstructions('description')}
        </AlertDescription>
      </Alert>
    </>
  );
}
