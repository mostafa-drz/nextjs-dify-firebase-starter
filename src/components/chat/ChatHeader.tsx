import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

/**
 * Chat Header Component
 * Displays the main title and instructions for the chat page
 */
export function ChatHeader() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">AI Chat Assistant</h1>
        <p className="text-muted-foreground">
          Secure server-side integration with Dify.ai using your API key
        </p>
      </div>

      {/* Instructions */}
      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>To use this demo:</strong> You need to add your Dify app API key to the
          environment variables. Set DIFY_API_KEY in your .env.local file.
        </AlertDescription>
      </Alert>
    </>
  );
}
