# Dify Service Architecture

A comprehensive, modular service architecture for integrating with Dify AI API. This architecture provides clean separation of concerns, excellent maintainability, and comprehensive TypeScript support.

## 🏗️ Architecture Overview

The service architecture follows the **Facade Pattern** with individual service classes for each functionality area:

```
DifyService (Facade)
├── ChatService          # Message sending & streaming
├── ConversationService  # Conversation management
├── FeedbackService      # Message feedback (like/dislike)
├── SuggestionsService   # Dynamic question suggestions
├── AudioService         # Speech-to-text & text-to-audio
└── FileUploadService    # File uploads
```

## 🚀 Quick Start

```typescript
import { DifyService } from '@/lib/services/dify';

// Initialize the service
const difyService = new DifyService({
  apiKey: process.env.DIFY_API_KEY!,
  userId: 'user123'
});

// Send a message
const response = await difyService.chat.sendMessage({
  query: "Hello, how are you?",
  user: "user123",
  response_mode: "blocking"
});

if (response.success) {
  console.log("Assistant:", response.data?.answer);
}
```

## 📚 Service Documentation

### ChatService

Handles all chat-related operations including blocking and streaming messages.

```typescript
// Blocking message
const response = await difyService.chat.sendMessage({
  query: "Tell me about AI",
  user: "user123",
  response_mode: "blocking"
});

// Streaming message
const stream = await difyService.chat.sendMessageStreaming({
  query: "Write a story",
  user: "user123",
  response_mode: "streaming"
});

// Parse streaming events
for await (const event of difyService.chat.parseStreamingEvents(stream)) {
  if (event.event === 'message') {
    console.log("Partial:", event.answer);
  }
}

// Stop generation
await difyService.chat.stopGeneration(taskId);
```

### ConversationService

Manages conversations and message history.

```typescript
// Get conversations
const conversations = await difyService.conversation.getConversations({
  limit: 20,
  sort_by: '-updated_at'
});

// Get conversation history
const history = await difyService.conversation.getConversationHistory(
  conversationId,
  { limit: 50 }
);

// Rename conversation
await difyService.conversation.renameConversation(
  conversationId,
  "New Name",
  false
);

// Delete conversation
await difyService.conversation.deleteConversation(conversationId);
```

### FeedbackService

Handles message feedback (likes/dislikes).

```typescript
// Like a message
await difyService.feedback.likeMessage("msg-123", "Great answer!");

// Dislike a message
await difyService.feedback.dislikeMessage("msg-456", "Not helpful");

// Toggle feedback
await difyService.feedback.toggleFeedback("msg-789", "like");

// Batch feedback
await difyService.feedback.sendBatchFeedback([
  { messageId: "msg-1", rating: "like" },
  { messageId: "msg-2", rating: "dislike" }
]);
```

### SuggestionsService

Provides dynamic question suggestions.

```typescript
// Get suggested questions
const suggestions = await difyService.suggestions.getSuggestedQuestions("msg-123");

// With fallback
const questions = await difyService.suggestions.getSuggestedQuestionsWithFallback(
  "msg-123",
  ["What else can you help with?"]
);

// Filter and format questions
const filtered = difyService.suggestions.filterQuestions(questions, {
  minLength: 10,
  maxLength: 100
});
```

### AudioService

Handles speech-to-text and text-to-audio conversion.

```typescript
// Speech to text
const result = await difyService.audio.speechToText(audioFile);
if (result.success) {
  console.log("Transcribed:", result.data?.text);
}

// Text to audio
const audioResult = await difyService.audio.textToAudio("Hello world!");
if (audioResult.success) {
  const audioUrl = URL.createObjectURL(audioResult.data);
  const audio = new Audio(audioUrl);
  audio.play();
}

// Message to audio
const messageAudio = await difyService.audio.messageToAudio("msg-123");
```

### FileUploadService

Manages file uploads for images and documents.

```typescript
// Upload file
const result = await difyService.files.uploadFile(file);
if (result.success) {
  console.log("File uploaded:", result.data?.url);
}

// Upload image
const imageResult = await difyService.files.uploadImage(imageFile);

// Upload with progress
await difyService.files.uploadWithProgress(file, (progress) => {
  console.log(`Upload: ${progress}%`);
});

// Validate file
const validation = difyService.files.validateFile(file);
if (!validation.isValid) {
  console.error("Invalid file:", validation.error);
}
```

## 🔧 Configuration

```typescript
const difyService = new DifyService({
  apiKey: 'app-your-api-key',           // Required
  userId: 'user123',                    // Required
  baseUrl: 'https://api.dify.ai/v1',    // Optional
  timeout: 30000                        // Optional
});
```

## 🎯 Advanced Usage

### Multiple Users

```typescript
// Create service for different user
const user2Service = difyService.forUser('user456');

// Both services work independently
const user1Response = await difyService.chat.sendMessage({...});
const user2Response = await user2Service.chat.sendMessage({...});
```

### Health Monitoring

```typescript
const health = await difyService.getHealth();
if (health.isHealthy) {
  console.log("All services healthy");
} else {
  console.log("Issues:", health.issues);
}
```

### Error Handling

```typescript
const response = await difyService.chat.sendMessage(request);

if (!response.success) {
  switch (response.error?.code) {
    case 'INSUFFICIENT_CREDITS':
      console.log("Need more credits");
      break;
    case 'INVALID_PARAM':
      console.log("Invalid parameters");
      break;
    default:
      console.log("Unknown error:", response.error?.message);
  }
}
```

## 📝 TypeScript Support

All services are fully typed with comprehensive interfaces:

```typescript
import {
  DifyService,
  ChatRequest,
  ChatCompletionResponse,
  StreamingEvent,
  ConversationListItem,
  MessageFeedbackRequest
} from '@/lib/services/dify';
```

## 🧪 Testing

See `examples.ts` for comprehensive usage examples:

```typescript
import { examples } from '@/lib/services/dify/examples';

// Run examples
await examples.basicChat();
await examples.streamingChat();
await examples.completeChatFlow();
```

## 🔒 Security

- API keys are never exposed to client-side code
- All requests are made server-side only
- Proper error handling prevents information leakage
- Input validation prevents malicious requests

## 📈 Performance

- Connection pooling and reuse
- Request timeout handling
- Streaming support for real-time responses
- Batch operations for multiple items
- Progress tracking for file uploads

## 🛠️ Maintenance

- Comprehensive JSDoc documentation
- Modular architecture for easy updates
- Consistent error handling patterns
- Type-safe interfaces
- Extensive examples and tests

## 🚀 Migration from Old Architecture

If migrating from the old `dify.ts` file:

```typescript
// Old way
import { sendDifyMessage } from '@/lib/actions/dify';
const result = await sendDifyMessage(userId, apiKey, request);

// New way
import { DifyService } from '@/lib/services/dify';
const difyService = new DifyService({ apiKey, userId });
const result = await difyService.chat.sendMessage(request);
```

The new architecture provides the same functionality with better organization, type safety, and maintainability.
