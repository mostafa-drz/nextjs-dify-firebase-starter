# Dify Firebase Boilerplate

A secure Next.js 15 boilerplate for integrating [Dify.ai](https://dify.ai) with Firebase authentication and credit-based usage tracking. This project provides a complete foundation for building AI-powered applications with proper user management and cost tracking.

## 🚀 Features

### Core Features

- ✅ **Next.js 15** with App Router and Server Actions
- ✅ **Firebase Authentication** with magic link (passwordless) login
- ✅ **Firestore Database** with security rules and real-time updates
- ✅ **Credit Management System** with token-based deduction (1 credit = 1000 tokens)
- ✅ **Secure Dify.ai Integration** using server-side API calls only
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS 4** with shadcn/ui components
- ✅ **ESLint & Prettier** for code quality
- ✅ **Google Analytics** with Firebase Analytics integration

### Security Features

- 🔒 **API keys never exposed** to client-side code
- 🔒 **Server-side validation** for all Dify API calls
- 🔒 **Credit pre-flight checks** to prevent unauthorized usage
- 🔒 **Atomic transactions** for credit deduction
- 🔒 **Firebase security rules** protecting user data
- 🔒 **Sentry error tracking** with privacy-first configuration

### User Experience

- 📱 **Responsive design** for all screen sizes
- ⚡ **Real-time credit updates** via Firestore listeners
- 💬 **Custom chat interface** with token usage tracking
- 📊 **Credit history and usage analytics**
- 🎨 **Modern UI** with loading states and error handling- 🔄 **Conversation management** with React Query caching
- ⚡ **Optimistic updates** for instant UI feedback

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project with Firestore and Authentication enabled
- Dify.ai account with API access

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd dify-firebase-boilerplate
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** and add **Email/Password** provider
3. Enable **Firestore Database** in production mode
4. Generate a **Service Account Key** for Firebase Admin SDK
5. Copy Firebase configuration from Project Settings

### 3. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Dify AI Configuration
DIFY_API_KEY=your_dify_api_key
DIFY_BASE_URL=https://api.dify.ai/v1

# Application Configuration
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com

# Sentry Configuration (Optional)
NEXT_PUBLIC_SENTRY_DSN=https://your_public_key@o0.ingest.sentry.io/0
SENTRY_DSN=https://your_public_key@o0.ingest.sentry.io/0
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
SENTRY_ORG=your_sentry_org_slug
SENTRY_PROJECT=your_sentry_project_slug

# App Configuration
SUPPORT_EMAIL=support@yourdomain.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
```

### 4. Deploy Firestore Security Rules

Deploy the security rules from `firestore.rules`:

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (select existing project)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🔨 Development Experience

This project includes a comprehensive development setup with automated code formatting, linting, and quality checks to ensure consistent code style and prevent common errors.

### Development Tools Setup

The project is configured with modern development tools for the best developer experience:

#### Code Quality Tools

- **Prettier**: Simple, standard code formatting with Tailwind CSS class sorting
- **ESLint**: Minimal linting with Next.js and TypeScript defaults
- **TypeScript**: Type checking for build validation
- **Husky**: Git hooks for automated quality checks

#### IDE Configuration

Pre-configured VSCode/Cursor settings for optimal development:

- Format on save enabled
- Auto-fix ESLint issues on save
- Tailwind CSS IntelliSense support
- TypeScript IntelliSense and error highlighting
- Recommended extensions list

#### Git Hooks

Automated quality checks run on every commit and push:

- **Pre-commit**: Runs linting and formatting on staged files
- **Pre-push**: Runs TypeScript checking and build verification

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Check code with ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check if code is properly formatted
npm run typecheck    # Type check with TypeScript compiler

# Git Hooks (handled automatically)
npm run prepare      # Initialize Husky (runs on npm install)
```

### IDE Setup (VSCode/Cursor)

The project includes `.vscode/` configuration with:

#### Recommended Extensions

- **Prettier**: Code formatting
- **ESLint**: Code linting
- **Tailwind CSS IntelliSense**: CSS class completion
- **Code Spell Checker**: Spelling validation
- **Error Lens**: Inline error display
- **Auto Rename Tag**: Automatic HTML/JSX tag renaming

#### Editor Settings

- **Auto-format on save** for consistent code style
- **Auto-fix ESLint issues** to prevent common errors
- **Tailwind class sorting** for better organization
- **TypeScript hints** for better development experience

### First-Time Setup for New Developers

1. **Clone and install dependencies**:

   ```bash
   git clone <repository-url>
   cd dify-firebase-boilerplate
   npm install
   ```

2. **Open in VSCode/Cursor**:

   ```bash
   code .  # or cursor .
   ```

3. **Install recommended extensions** when prompted

4. **Configure environment** (see Environment Configuration section)

5. **Verify setup**:
   ```bash
   npm run typecheck  # Should pass without errors
   npm run lint       # Should pass without errors
   npm run build      # Should build successfully
   ```

### Code Formatting Rules

The project uses minimal, standard formatting conventions:

- **Print width**: 100 characters
- **Single quotes** for strings
- **Semicolons** required
- **2 spaces** for indentation
- **Tailwind classes** automatically sorted

### Quality Checks

Before every commit, the following checks run automatically:

1. **ESLint**: Checks for code quality issues
2. **Prettier**: Ensures consistent formatting
3. **TypeScript**: Validates type safety

Before every push:

1. **TypeScript compilation**: Ensures no type errors
2. **Production build**: Ensures the app builds successfully

### Troubleshooting

**Husky hooks not working?**

```bash
npx husky install
```

**ESLint/Prettier conflicts?**
The project uses `eslint-config-prettier` to disable conflicting rules automatically.

**TypeScript errors on build?**

```bash
npm run typecheck  # Check specific TypeScript issues
```

**Extensions not working in Cursor?**
Cursor is compatible with VSCode extensions. Install the recommended extensions manually if auto-prompt doesn't appear.

## 🎯 Usage

### Basic Integration

Use the `DifyChat` component in your pages:

```tsx
import { DifyChat } from '@/components/dify/DifyChat';

export default function MyPage() {
  return (
    <DifyChat
      apiKey="app-your-dify-key" // Server-side only, never exposed
      name="My Assistant"
      placeholder="Ask me anything..."
      welcomeMessage="Hello! How can I help you today?"
    />
  );
}
```

### Credit Management

Access credit information using the `useCredits` hook:

```tsx
import { useCredits } from '@/lib/hooks/useCredits';

export function MyComponent() {
  const { availableCredits, hasEnoughCredits, deductForTokens } = useCredits();

  return (
    <div>
      <p>Available: {availableCredits} credits</p>
      {!hasEnoughCredits(10) && <p>Insufficient credits!</p>}
    </div>
  );
}
```

### Server Actions

Use server actions for secure Dify API calls:

```tsx
import { sendDifyMessage } from '@/lib/actions/dify';

// In a server action or API route
const result = await sendDifyMessage(userId, apiKey, {
  query: 'Hello',
  user: userId,
  response_mode: 'blocking',
});

if (result.success) {
  console.log('Response:', result.data?.answer);
  console.log('Tokens used:', result.usage?.total_tokens);
}
```

## 💬 Conversation Management

This boilerplate implements a **client-side conversation management system** using React Query for caching and optimistic updates. This approach prioritizes simplicity and performance while providing a solid foundation for developers to extend with their own persistence strategies.

### Architecture Overview

**Why React Query?**

- **Automatic caching** with intelligent invalidation
- **Optimistic updates** for instant UI feedback
- **Background refetching** to keep data fresh
- **Error handling** with retry logic
- **DevTools** for debugging (development only)

**Why Not Firebase/Firestore?**

- **Simplicity**: Avoids additional database complexity
- **Performance**: Client-side caching is faster than database queries
- **Flexibility**: Developers can choose their own persistence layer
- **Cost**: Reduces Firebase read/write operations

### Data Flow

```
User Action → Optimistic Update → API Call → Cache Update → UI Update
     ↓              ↓                ↓           ↓           ↓
  Click Send → Show Message → Call Dify → Update Cache → Show Response
```

### Usage Examples

#### Basic Conversation Management

```tsx
import { useConversationMessages } from '@/lib/hooks/useConversationMessages';

export function ChatComponent() {
  const { messages, isLoading, addMessageOptimistically, invalidate } = useConversationMessages(
    conversationId,
    userId,
    apiKey
  );

  const handleSendMessage = async (content: string) => {
    const tempMessage = { id: 'temp', content, role: 'user' };
    addMessageOptimistically(tempMessage); // Instant UI update

    const result = await sendDifyMessage(userId, apiKey, { query: content });
    // Cache automatically updated with real data
  };

  return (
    <div>
      {isLoading && <div>Loading conversation...</div>}
      {messages.map((message) => (
        <div key={message.id}>{message.content}</div>
      ))}
    </div>
  );
}
```

#### Conversation List Management

```tsx
import { ConversationList } from '@/components/dify/ConversationList';

export function ChatPage() {
  const [currentConversationId, setCurrentConversationId] = useState<string>();

  return (
    <div className="grid gap-8 lg:grid-cols-4">
      <div className="lg:col-span-1">
        <ConversationList
          apiKey="app-demo-key"
          userId={user.uid}
          currentConversationId={currentConversationId}
          onConversationSelect={setCurrentConversationId}
          onCreateNew={() => setCurrentConversationId(undefined)}
        />
      </div>
      <div className="lg:col-span-3">
        <DifyChat
          apiKey="app-demo-key"
          conversationId={currentConversationId}
          // ... other props
        />
      </div>
    </div>
  );
}
```

### Performance Features

- **Smart Caching**: 5-minute cache with 1-minute stale time
- **Background Refetching**: Keep data fresh without user interaction
- **Prefetching**: Preload messages on conversation hover
- **Memory Management**: Automatic garbage collection of unused data
- **Bundle Size**: React Query adds only ~13KB gzipped

### Extending the System

#### Option 1: Add Firebase Persistence

```tsx
// Add to your Firebase functions
export const syncConversationToFirestore = async (conversationId: string, messages: unknown[]) => {
  await db.collection('conversations').doc(conversationId).set({
    messages,
    lastUpdated: new Date(),
    userId: auth.currentUser?.uid,
  });
};

// Call after successful message send
const result = await sendDifyMessage(userId, apiKey, request);
await syncConversationToFirestore(result.data.conversation_id, messages);
```

#### Option 2: Add Local Storage Backup

```tsx
// Add to useConversationMessages hook
useEffect(() => {
  if (data) {
    localStorage.setItem(`conversation-${conversationId}`, JSON.stringify(data));
  }
}, [data, conversationId]);
```

#### Option 3: Add Real-time Sync

```tsx
// Add WebSocket or Server-Sent Events
const useRealtimeMessages = (conversationId: string) => {
  useEffect(() => {
    const ws = new WebSocket(`/ws/conversations/${conversationId}`);
    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      addMessageOptimistically(newMessage);
    };
    return () => ws.close();
  }, [conversationId]);
};
```

### Debug Tools

React Query DevTools are automatically enabled in development:

```tsx
// Automatically included in development builds
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
```

### Best Practices

**Do's:**

- ✅ Use optimistic updates for better UX
- ✅ Implement proper error boundaries
- ✅ Add loading states for all async operations
- ✅ Use TypeScript for type safety
- ✅ Test with React Query DevTools

**Don'ts:**

- ❌ Don't bypass the cache for real-time updates
- ❌ Don't store sensitive data in client-side cache
- ❌ Don't forget to handle offline scenarios
- ❌ Don't over-fetch data (use pagination)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── chat/              # Chat demo page with conversation management
│   ├── conversations/     # Dedicated conversation management page
│   ├── dashboard/         # User dashboard
│   ├── login/            # Authentication page
│   └── test-credits/     # Credit testing utilities
├── components/
│   ├── auth/             # Authentication components
│   ├── credits/          # Credit management UI
│   ├── dify/            # Dify integration components
│   │   ├── DifyChat.tsx           # Main chat interface
│   │   ├── ConversationList.tsx  # Conversation management
│   │   ├── MessageFeedback.tsx   # Message feedback system
│   │   └── SuggestedQuestions.tsx # Suggested questions
│   ├── providers/        # React context providers
│   │   └── QueryProvider.tsx     # React Query provider
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── actions/         # Server actions
│   ├── hooks/           # Custom React hooks
│   │   ├── useCredits.ts              # Credit management
│   │   └── useConversationMessages.ts # Conversation caching
│   ├── services/        # Dify API services
│   │   └── dify/        # Modular Dify service architecture
│   ├── utils/           # Utility functions
│   └── config/          # Configuration constants
└── types/               # TypeScript type definitions
```

## 🔧 Configuration

### Credit System

Configure credit costs and limits in `src/lib/config/constants.ts`:

```typescript
export const CREDIT_CONFIG = {
  TOKENS_PER_CREDIT: 1000, // 1 credit = 1000 tokens
  FREE_TIER_CREDITS: 100, // Free credits per month
  MIN_CREDITS_WARNING: 10, // Show warning below this
  CREDIT_PURCHASE_AMOUNTS: [10, 50, 100, 500],
} as const;
```

### Dify Apps

For multiple Dify apps, create an app configuration:

```typescript
const DIFY_APPS = {
  chat: {
    name: 'Chat Assistant',
    apiKey: process.env.DIFY_CHAT_API_KEY!,
  },
  summarizer: {
    name: 'Document Summarizer',
    apiKey: process.env.DIFY_SUMMARIZER_API_KEY!,
  },
};
```

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Credit System

Visit `/test-credits` to test credit deduction and management.

### Test Dify Integration

Visit `/chat` to test the Dify chat interface.

### Test Sentry Integration

Visit `/sentry-test` to test error tracking and logging.

### Enable Google Analytics

1. Enable Analytics in your Firebase project console
2. Copy the Measurement ID from Analytics settings
3. Add `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX` to `.env.local`

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

This Next.js app can be deployed to any platform supporting Node.js:

- Railway
- Render
- Heroku
- DigitalOcean App Platform
- AWS Amplify

## 📊 Monitoring

### Firebase Console

- Monitor authentication metrics
- View Firestore usage and costs
- Check security rule violations

### Sentry Error Tracking

This project includes production-ready **Sentry integration** with minimal but essential logging:

#### Features

- **Smart Error Filtering**: Automatically filters non-critical errors (network timeouts, browser quirks)
- **Privacy-First**: Masks sensitive data, excludes cookies and IP addresses
- **Performance Monitoring**: Tracks slow operations and API performance
- **Production Optimized**: Lower sampling rates to reduce noise (10% traces, 1% sessions)

#### Setup

1. Create a free [Sentry account](https://sentry.io) and project
2. Copy your DSN and add to `.env.local`:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://your_key@o0.ingest.sentry.io/0
   SENTRY_DSN=https://your_key@o0.ingest.sentry.io/0
   ```
3. Test with `/sentry-test` page

#### Usage Examples

```typescript
import { logError, logMessage, LogLevel } from '@/lib/sentry';

// Log critical errors
try {
  await processPayment();
} catch (error) {
  logError(error, { userId, amount, paymentMethod });
}

// Log important events
logMessage('User upgraded to premium', LogLevel.INFO);
```

#### What Gets Logged

- ✅ API errors (5xx responses)
- ✅ Authentication failures
- ✅ Payment processing errors
- ✅ Slow operations (>3s)
- ✅ Unhandled exceptions
- ❌ Network timeouts (filtered)
- ❌ Browser extension errors (filtered)
- ❌ Expected auth errors (filtered)

### Application Monitoring

- Credit usage patterns in Firestore
- Real-time error alerts and performance monitoring
- User activity via Firebase Analytics

### Google Analytics Integration

This project includes **privacy-first Google Analytics** using Firebase Analytics with minimal data collection:

#### Features

- **Production Only**: Analytics only tracks in production environment
- **Essential Events**: Tracks only business-critical events (auth, chat, credits)
- **Privacy Focused**: No personal data collection or tracking
- **Client-Side Only**: Simple Firebase Analytics integration

#### Tracked Events

- ✅ **Page Views**: User navigation patterns
- ✅ **Authentication**: Login/logout events
- ✅ **Chat Usage**: Message sending and conversation starts
- ✅ **Credit Usage**: Purchase and deduction events
- ✅ **External Links**: Outbound link clicks

#### Setup

1. **Enable Analytics** in your [Firebase Console](https://console.firebase.google.com)
2. **Copy Measurement ID** from Analytics → Data Streams
3. **Add to Environment**: `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX`
4. **Deploy**: Analytics will automatically start tracking in production

#### Usage Examples

```typescript
import { trackAuth, trackChat, trackCredits } from '@/lib/analytics';

// Track user authentication
trackAuth('login');

// Track chat interactions
trackChat('message_sent', messageLength);

// Track credit events
trackCredits('purchase', amount);
```

#### Privacy Compliance

- **GDPR Compliant**: No personal data collection
- **Development Safe**: No tracking in development environment
- **Error Handling**: Graceful failures without breaking user experience

## 🛡️ Security Considerations

1. **API Keys**: Never expose Dify API keys to client-side code
2. **Credit Limits**: Implement proper credit limits to prevent abuse
3. **Rate Limiting**: Consider adding rate limiting for API calls
4. **User Validation**: Always validate user authentication server-side
5. **Firestore Rules**: Keep security rules restrictive and test thoroughly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in this repository
- Email: support@yourdomain.com
- Check the [Dify Documentation](https://docs.dify.ai/)
- Review [Firebase Documentation](https://firebase.google.com/docs)

## 🚧 Roadmap

### ✅ Completed Features

- [x] **Conversation Management**: Full conversation history with React Query caching
- [x] **Optimistic Updates**: Instant UI feedback for better user experience
- [x] **Message Feedback**: Like/dislike system for assistant messages
- [x] **Suggested Questions**: Dynamic question suggestions from Dify
- [x] **Modular Architecture**: Clean service separation for maintainability

### 🔄 Planned Features

- [ ] Stripe integration for credit purchases
- [ ] Multiple Dify app management
- [ ] Usage analytics dashboard
- [ ] Admin panel for user management
- [ ] Webhook support for real-time events
- [ ] Message search functionality
- [ ] Conversation export/import
- [ ] Offline message queuing
- [ ] Docker containerization
- [ ] End-to-end testing with Cypress
