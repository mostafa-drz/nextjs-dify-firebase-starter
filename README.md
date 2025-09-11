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

### Security Features
- 🔒 **API keys never exposed** to client-side code
- 🔒 **Server-side validation** for all Dify API calls
- 🔒 **Credit pre-flight checks** to prevent unauthorized usage
- 🔒 **Atomic transactions** for credit deduction
- 🔒 **Firebase security rules** protecting user data

### User Experience
- 📱 **Responsive design** for all screen sizes
- ⚡ **Real-time credit updates** via Firestore listeners
- 💬 **Custom chat interface** with token usage tracking
- 📊 **Credit history and usage analytics**
- 🎨 **Modern UI** with loading states and error handling

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

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Dify Integration
DIFY_BASE_URL=https://api.dify.ai/v1
DIFY_API_KEY=app-your_dify_api_key

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
  const { 
    availableCredits, 
    hasEnoughCredits, 
    deductForTokens 
  } = useCredits();

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
  query: "Hello",
  user: userId,
  response_mode: 'blocking'
});

if (result.success) {
  console.log('Response:', result.data?.answer);
  console.log('Tokens used:', result.usage?.total_tokens);
}
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── chat/              # Chat demo page
│   ├── dashboard/         # User dashboard
│   ├── login/            # Authentication page
│   └── test-credits/     # Credit testing utilities
├── components/            
│   ├── auth/             # Authentication components
│   ├── credits/          # Credit management UI
│   ├── dify/            # Dify integration components
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── actions/         # Server actions
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   └── config/          # Configuration constants
└── types/               # TypeScript type definitions
```

## 🔧 Configuration

### Credit System

Configure credit costs and limits in `src/lib/config/constants.ts`:

```typescript
export const CREDIT_CONFIG = {
  TOKENS_PER_CREDIT: 1000,        // 1 credit = 1000 tokens
  FREE_TIER_CREDITS: 100,         // Free credits per month
  MIN_CREDITS_WARNING: 10,        // Show warning below this
  CREDIT_PURCHASE_AMOUNTS: [10, 50, 100, 500]
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
  }
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

### Application Monitoring
- Credit usage patterns in Firestore
- Error tracking with console logs
- User activity via Firebase Analytics

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

- [ ] Stripe integration for credit purchases
- [ ] Multiple Dify app management
- [ ] Usage analytics dashboard
- [ ] Admin panel for user management
- [ ] Webhook support for real-time events
- [ ] Docker containerization
- [ ] End-to-end testing with Cypress
