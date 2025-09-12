# Feedback Service Documentation

## Overview

The feedback service provides an elegant, plug-and-play solution for collecting user feedback in your AI applications. It leverages Sentry's user feedback capabilities and can be configured to forward feedback to Slack channels for real-time team notifications.

## Features

- **Floating Feedback Button**: Customizable position and styling
- **Rich Feedback Form**: Categories, priority levels, and optional user details
- **Sentry Integration**: Automatic error tracking and context capture
- **Slack Integration**: Real-time notifications to team channels
- **TypeScript Support**: Full type safety and IntelliSense
- **Responsive Design**: Works on all device sizes

## Quick Start

### 1. Basic Usage

```tsx
import { FeedbackButton } from '@/components/feedback';

function MyPage() {
  return (
    <div>
      {/* Your page content */}

      <FeedbackButton
        config={{
          enabled: true,
          position: 'bottom-right',
          buttonText: 'Feedback',
        }}
      />
    </div>
  );
}
```

### 2. Advanced Configuration

```tsx
<FeedbackButton
  config={{
    enabled: true,
    position: 'bottom-right',
    buttonText: 'Share Feedback',
    requireEmail: true,
    requireName: false,
    categories: ['bug', 'feature', 'general', 'improvement'],
    placeholder: 'Tell us what you think...',
  }}
/>
```

## Configuration Options

### FeedbackConfig Interface

```typescript
interface FeedbackConfig {
  /** Whether to show the feedback button */
  enabled: boolean;
  /** Position of the feedback button */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Custom button text */
  buttonText?: string;
  /** Whether to require email */
  requireEmail?: boolean;
  /** Whether to require name */
  requireName?: boolean;
  /** Available feedback categories */
  categories?: Array<'bug' | 'feature' | 'general' | 'improvement'>;
  /** Custom placeholder text for the feedback input */
  placeholder?: string;
}
```

## Sentry Integration Setup

The feedback service automatically integrates with your existing Sentry configuration. It captures:

- User feedback messages
- Page context (current route)
- User agent and device information
- Custom context data
- Error tracking for failed submissions

### Automatic Context Capture

The service automatically captures:

- Current page URL and path
- User agent string
- Screen resolution
- Viewport size
- Timestamp
- Any additional context you provide

## Slack Integration Setup

### Step 1: Connect Sentry to Slack

1. **Navigate to Sentry Settings**:
   - Go to your Sentry organization dashboard
   - Click on "Settings" → "Integrations"

2. **Add Slack Integration**:
   - Find "Slack" in the integrations list
   - Click "Add Workspace"
   - Authorize Sentry to access your Slack workspace
   - Follow the OAuth prompts to complete the connection

3. **Configure Notification Settings**:
   - After integration, you can configure which channels receive notifications
   - Set up different channels for different types of alerts

### Step 2: Create Alert Rules for Feedback

1. **Navigate to Alerts**:
   - Go to your Sentry project
   - Click on "Alerts" → "Rules"

2. **Create New Alert Rule**:
   - Click "Create Alert Rule"
   - Set the following conditions:
     - **Event Type**: "User Feedback"
     - **Environment**: Choose your environment (production, staging, etc.)
     - **Frequency**: "Every time" or set a threshold

3. **Configure Actions**:
   - **Action Type**: "Send a notification"
   - **Integration**: Select your Slack workspace
   - **Channel**: Choose the channel where you want feedback notifications
   - **Message Template**: Customize the notification message

### Step 3: Customize Notification Messages

You can customize the Slack notification message to include:

```
🚀 New User Feedback Received!

**Category**: {{feedback_category}}
**Priority**: {{feedback_priority}}
**Page**: {{page}}

**Message**: {{feedback_message}}

**User**: {{user_name}} ({{user_email}})
**Timestamp**: {{timestamp}}

**Context**: {{context}}
```

### Step 4: Test the Integration

1. **Submit Test Feedback**:
   - Use the feedback button in your application
   - Submit a test message
   - Check your Sentry dashboard for the feedback event

2. **Verify Slack Notifications**:
   - Check your configured Slack channel
   - Ensure notifications are being received
   - Adjust settings if needed

## Advanced Usage

### Custom Feedback Service

```typescript
import { submitFeedback, getPageContext, getUserContext } from '@/lib/services/feedback';

// Submit feedback programmatically
const result = await submitFeedback({
  message: 'User reported an issue',
  email: 'user@example.com',
  name: 'John Doe',
  category: 'bug',
  priority: 'high',
  page: getPageContext(),
  context: getUserContext(),
});

if (result.success) {
  console.log('Feedback submitted:', result.messageId);
} else {
  console.error('Failed to submit feedback:', result.error);
}
```

### Custom Context Data

```typescript
// Add custom context to feedback
const customContext = {
  userId: user?.uid,
  sessionId: sessionId,
  featureFlags: activeFlags,
  userPreferences: preferences,
};

await submitFeedback({
  message: 'Feature request',
  category: 'feature',
  context: customContext,
});
```

## Environment Variables

Ensure these environment variables are set:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_DSN=your_sentry_dsn_here
```

## Troubleshooting

### Common Issues

1. **Feedback Not Appearing in Sentry**:
   - Check your Sentry DSN configuration
   - Verify the Sentry client is properly initialized
   - Check browser console for errors

2. **Slack Notifications Not Working**:
   - Verify Slack integration is properly connected
   - Check alert rule configuration
   - Ensure the correct channel is selected
   - Test with a simple alert rule first

3. **Button Not Showing**:
   - Check that `config.enabled` is set to `true`
   - Verify the component is properly imported
   - Check for CSS conflicts

### Debug Mode

Enable debug mode in your Sentry configuration to see detailed logs:

```typescript
// In sentry.client.config.ts
Sentry.init({
  // ... other config
  debug: process.env.NODE_ENV !== 'production',
});
```

## Best Practices

1. **Privacy Considerations**:
   - Don't require email unless necessary
   - Be transparent about data collection
   - Follow GDPR/privacy regulations

2. **User Experience**:
   - Position the button where it's visible but not intrusive
   - Use clear, friendly button text
   - Provide helpful placeholder text

3. **Team Workflow**:
   - Set up different Slack channels for different feedback types
   - Create alert rules for different priority levels
   - Establish a process for responding to feedback

4. **Monitoring**:
   - Monitor feedback volume and response times
   - Track common issues and feature requests
   - Use feedback data to prioritize development

## Examples

### Minimal Setup

```tsx
<FeedbackButton config={{ enabled: true }} />
```

### Full Configuration

```tsx
<FeedbackButton
  config={{
    enabled: true,
    position: 'bottom-left',
    buttonText: 'Report Issue',
    requireEmail: true,
    requireName: true,
    categories: ['bug', 'feature'],
    placeholder: 'Describe the issue you encountered...',
  }}
/>
```

### Conditional Rendering

```tsx
{
  process.env.NODE_ENV === 'production' && <FeedbackButton config={{ enabled: true }} />;
}
```

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Sentry and Slack integration documentation
3. Check the browser console for error messages
4. Verify environment variable configuration

The feedback service is designed to be robust and fail gracefully, so even if Sentry is unavailable, the UI will still function and show appropriate error messages to users.
