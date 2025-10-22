/**
 * @fileoverview Usage examples for Dify service architecture
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

import { DifyService } from './index';

/**
 * Example usage of the Dify service architecture
 * This file demonstrates how to use all the services in a real application
 */

// Initialize the service
const difyService = new DifyService({
  apiKey: process.env.DIFY_API_KEY || '',
  userId: 'user123',
  baseUrl: 'https://api.dify.ai/v1',
  timeout: 30000,
});

/**
 * Example: Basic chat functionality
 */
export async function basicChatExample() {
  console.log('=== Basic Chat Example ===');

  // Send a blocking message
  const response = await difyService.chat.sendMessage({
    query: 'Hello, how are you?',
    user: 'user123',
    response_mode: 'blocking',
  });

  if (response.success) {
    console.log('Assistant:', response.data?.answer);
    console.log('Tokens used:', response.usage?.total_tokens);
  } else {
    console.error('Error:', response.error?.message);
  }
}

/**
 * Example: Streaming chat functionality
 */
export async function streamingChatExample() {
  console.log('=== Streaming Chat Example ===');

  const stream = await difyService.chat.sendMessageStreaming({
    query: 'Tell me a story',
    user: 'user123',
    response_mode: 'streaming',
  });

  let fullResponse = '';
  let taskId = '';

  for await (const event of difyService.chat.parseStreamingEvents(stream)) {
    switch (event.event) {
      case 'message':
        fullResponse += event.answer;
        console.log('Streaming:', event.answer);
        taskId = event.task_id;
        break;
      case 'message_end':
        console.log('Complete response:', fullResponse);
        console.log('Tokens used:', event.metadata?.usage?.total_tokens);
        break;
      case 'error':
        console.error('Streaming error:', event.message);
        break;
    }
  }

  // Example: Stop generation if needed
  if (taskId) {
    // Uncomment to test stop functionality
    // await difyService.chat.stopGeneration(taskId);
  }
}

/**
 * Example: Conversation management
 */
export async function conversationManagementExample() {
  console.log('=== Conversation Management Example ===');

  // Get all conversations
  const conversations = await difyService.conversation.getConversations({
    limit: 10,
    sort_by: '-updated_at',
  });

  if (conversations.success && conversations.data) {
    console.log(`Found ${conversations.data.data.length} conversations`);

    for (const conv of conversations.data.data) {
      console.log(`- ${conv.name} (${conv.id})`);

      // Get conversation history
      const history = await difyService.conversation.getConversationHistory(conv.id, {
        limit: 5,
      });

      if (history.success && history.data) {
        console.log(`  Messages: ${history.data.data.length}`);
      }

      // Rename conversation
      const renameResult = await difyService.conversation.renameConversation(
        conv.id,
        `Updated: ${conv.name}`,
        false
      );

      if (renameResult.success) {
        console.log(`  Renamed to: ${renameResult.data?.name}`);
      }
    }
  }
}

/**
 * Example: Feedback system
 */
export async function feedbackExample() {
  console.log('=== Feedback Example ===');

  // Like a message
  const likeResult = await difyService.feedback.likeMessage('msg-123', 'This was very helpful!');

  if (likeResult.success) {
    console.log('Message liked successfully');
  }

  // Dislike a message
  const dislikeResult = await difyService.feedback.dislikeMessage(
    'msg-456',
    'This answer was not accurate'
  );

  if (dislikeResult.success) {
    console.log('Message disliked successfully');
  }

  // Toggle feedback
  const toggleResult = await difyService.feedback.toggleFeedback(
    'msg-789',
    'like', // Current rating
    "Actually, this wasn't helpful"
  );

  if (toggleResult.success) {
    console.log('Feedback toggled successfully');
  }
}

/**
 * Example: Suggested questions
 */
export async function suggestionsExample() {
  console.log('=== Suggestions Example ===');

  // Get suggested questions for a message
  const suggestions = await difyService.suggestions.getSuggestedQuestions('msg-123');

  if (suggestions.success && suggestions.data) {
    console.log('Suggested questions:');
    suggestions.data.data.forEach((question, index) => {
      console.log(`${index + 1}. ${question}`);
    });
  }

  // Get suggestions with fallback
  const fallbackQuestions = await difyService.suggestions.getSuggestedQuestionsWithFallback(
    'msg-123',
    ['What else can you help with?', 'Tell me more about this topic']
  );

  console.log('Questions (with fallback):', fallbackQuestions);
}

/**
 * Example: Audio features
 */
export async function audioExample() {
  console.log('=== Audio Example ===');

  // Convert text to audio
  const audioResult = await difyService.audio.textToAudio('Hello, this is a test message');

  if (audioResult.success && audioResult.data) {
    // Create audio URL and play
    const audioUrl = URL.createObjectURL(audioResult.data);
    const audio = new Audio(audioUrl);

    console.log('Audio generated, playing...');
    audio.play();

    // Clean up URL after use
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(audioUrl);
    });
  }

  // Convert message to audio
  const messageAudioResult = await difyService.audio.messageToAudio('msg-123');

  if (messageAudioResult.success && messageAudioResult.data) {
    const audioUrl = URL.createObjectURL(messageAudioResult.data);
    console.log('Message audio URL:', audioUrl);
  }
}

/**
 * Example: Complete chat flow with all features
 */
export async function completeChatFlowExample() {
  console.log('=== Complete Chat Flow Example ===');

  try {
    // 1. Send initial message
    const initialResponse = await difyService.chat.sendMessage({
      query: 'Hello, I need help with a project',
      user: 'user123',
      response_mode: 'blocking',
    });

    if (!initialResponse.success || !initialResponse.data) {
      throw new Error('Failed to send initial message');
    }

    const conversationId = initialResponse.data.conversation_id;
    const messageId = initialResponse.data.message_id;

    console.log('Initial response:', initialResponse.data.answer);

    // 2. Provide feedback
    await difyService.feedback.likeMessage(messageId, 'Great start!');

    // 3. Get suggested questions
    const suggestions = await difyService.suggestions.getSuggestedQuestions(messageId);
    if (suggestions.success && suggestions.data) {
      console.log('Suggested follow-up questions:', suggestions.data.data);
    }

    // 4. Continue conversation
    const followUpResponse = await difyService.chat.sendMessage({
      query: 'Can you provide more details?',
      user: 'user123',
      conversation_id: conversationId,
      response_mode: 'blocking',
    });

    if (followUpResponse.success) {
      console.log('Follow-up response:', followUpResponse.data?.answer);
    }

    // 5. Get conversation history
    const history = await difyService.conversation.getConversationHistory(conversationId);
    if (history.success && history.data) {
      console.log(`Conversation has ${history.data.data.length} messages`);
    }

    // 6. Rename conversation
    await difyService.conversation.renameConversation(
      conversationId,
      'Project Help Discussion',
      false
    );

    console.log('Complete chat flow finished successfully!');
  } catch (error) {
    console.error('Error in complete chat flow:', error);
  }
}

/**
 * Example: Service health check
 */
export async function healthCheckExample() {
  console.log('=== Health Check Example ===');

  const health = await difyService.getHealth();

  if (health.isHealthy) {
    console.log('✅ All services are healthy');
  } else {
    console.log('❌ Some services have issues:');
    health.issues.forEach((issue) => console.log(`  - ${issue}`));
  }

  console.log('Service status:', health.services);
}

/**
 * Example: Multiple users
 */
export async function multipleUsersExample() {
  console.log('=== Multiple Users Example ===');

  // Create service for different user
  const user2Service = difyService.forUser('user456');

  // Both services can work independently
  const user1Response = await difyService.chat.sendMessage({
    query: 'Hello from user 1',
    user: 'user123',
    response_mode: 'blocking',
  });

  const user2Response = await user2Service.chat.sendMessage({
    query: 'Hello from user 2',
    user: 'user456',
    response_mode: 'blocking',
  });

  console.log('User 1 response:', user1Response.data?.answer);
  console.log('User 2 response:', user2Response.data?.answer);
}

// Export all examples for easy testing
export const examples = {
  basicChat: basicChatExample,
  streamingChat: streamingChatExample,
  conversationManagement: conversationManagementExample,
  feedback: feedbackExample,
  suggestions: suggestionsExample,
  audio: audioExample,
  completeChatFlow: completeChatFlowExample,
  healthCheck: healthCheckExample,
  multipleUsers: multipleUsersExample,
};
