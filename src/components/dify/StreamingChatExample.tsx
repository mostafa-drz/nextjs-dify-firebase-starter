'use client';

import { DifyChat } from './DifyChat';

/**
 * Example component showing how to use DifyChat with streaming enabled
 * This demonstrates the new streaming capabilities
 */
export function StreamingChatExample() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Streaming Chat Example</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          This chat component has streaming enabled for real-time message updates.
        </p>
      </div>

      <DifyChat
        name="Streaming Assistant"
        enableStreaming={true}
        streamingMode="auto"
        placeholder="Ask me anything with real-time streaming..."
        welcomeMessage="Hello! I'm your streaming assistant. Ask me anything and watch the response appear in real-time!"
      />
    </div>
  );
}

/**
 * Example component showing traditional blocking chat
 * This maintains backward compatibility
 */
export function BlockingChatExample() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Traditional Chat Example</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          This chat component uses the traditional blocking mode (default behavior).
        </p>
      </div>

      <DifyChat
        name="Traditional Assistant"
        enableStreaming={false}
        placeholder="Ask me anything..."
        welcomeMessage="Hello! I'm your traditional assistant. Ask me anything!"
      />
    </div>
  );
}
