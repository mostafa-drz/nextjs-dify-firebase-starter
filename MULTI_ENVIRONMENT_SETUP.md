# 🌍 Multi-Environment Setup Guide

This guide explains how to set up and manage multiple Vercel environments (Development, Preview, and Production) for your Next.js + Firebase boilerplate.

## 🏗️ Environment Architecture

### **Three-Tier Environment Strategy**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Preview     │    │   Production    │
│                 │    │                 │    │                 │
│ • develop branch│    │ • PR branches   │    │ • main branch   │
│ • dev Firebase  │    │ • preview Firebase│   │ • prod Firebase│
│ • dev Dify app  │    │ • preview Dify  │    │ • prod Dify app │
│ • dev Sentry    │    │ • preview Sentry│    │ • prod Sentry   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Vercel Environment Configuration

### **1. Environment Types in Vercel**

Vercel supports three environment types:

- **Production**: Live production environment
- **Preview**: Automatic deployments for PRs and branches
- **Development**: Manual deployments for development

### **2. Setting Up Environments**

#### **Step 1: Create Environment Variables in Vercel Dashboard**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add variables for each environment:

**Production Environment:**

```
NEXT_PUBLIC_FIREBASE_API_KEY=prod_key
FIREBASE_PROJECT_ID=prod_project
DIFY_API_KEY=prod_dify_key
# ... other production variables
```

**Preview Environment:**

```
NEXT_PUBLIC_FIREBASE_API_KEY=preview_key
FIREBASE_PROJECT_ID=preview_project
DIFY_API_KEY=preview_dify_key
# ... other preview variables
```

**Development Environment:**

```
NEXT_PUBLIC_FIREBASE_API_KEY=dev_key
FIREBASE_PROJECT_ID=dev_project
DIFY_API_KEY=dev_dify_key
# ... other development variables
```

#### **Step 2: Configure Environment-Specific Settings**

For each environment, set:

- **Environment**: Select `Production`, `Preview`, or `Development`
- **Git Branch**: Specify which branches trigger this environment
- **Environment Variables**: Add the appropriate variables

## 🔧 Firebase Multi-Project Setup

### **Recommended Firebase Project Structure**

```
📁 Firebase Projects
├── 🟢 your-app-dev (Development)
│   ├── Authentication (dev users)
│   ├── Firestore (dev data)
│   └── Analytics (dev metrics)
├── 🟡 your-app-preview (Preview)
│   ├── Authentication (preview users)
│   ├── Firestore (preview data)
│   └── Analytics (preview metrics)
└── 🔴 your-app-prod (Production)
    ├── Authentication (prod users)
    ├── Firestore (prod data)
    └── Analytics (prod metrics)
```

### **Setting Up Multiple Firebase Projects**

1. **Create Development Project:**

   ```bash
   firebase projects:create your-app-dev
   firebase use your-app-dev --alias dev
   ```

2. **Create Preview Project:**

   ```bash
   firebase projects:create your-app-preview
   firebase use your-app-preview --alias preview
   ```

3. **Create Production Project:**

   ```bash
   firebase projects:create your-app-prod
   firebase use your-app-prod --alias prod
   ```

4. **Configure Firebase CLI:**
   ```bash
   # Set up project aliases
   firebase use --add your-app-dev
   firebase use --add your-app-preview
   firebase use --add your-app-prod
   ```

## 🔄 CI/CD Pipeline for Multi-Environment

### **Branch Strategy**

```
main branch     → Production Environment
├── develop     → Development Environment
└── feature/*   → Preview Environment (via PRs)
```

### **Deployment Triggers**

- **Production**: Push to `main` branch
- **Development**: Push to `develop` branch
- **Preview**: Create/update Pull Request

### **Environment-Specific Deployments**

The CI/CD pipeline automatically:

1. **Development Deployments** (`develop` branch):
   - Uses development Firebase project
   - Uses development Dify app
   - Deploys to development Vercel environment

2. **Preview Deployments** (Pull Requests):
   - Uses preview Firebase project
   - Uses preview Dify app
   - Deploys to preview Vercel environment
   - Comments PR with preview URL

3. **Production Deployments** (`main` branch):
   - Uses production Firebase project
   - Uses production Dify app
   - Deploys to production Vercel environment
   - Runs Lighthouse CI
   - Creates GitHub release

## 📋 Environment-Specific Configuration

### **Development Environment**

**Purpose**: Local development and testing
**Firebase Project**: Separate development project
**Features**:

- Debug logging enabled
- Development-specific API endpoints
- Test data and users
- Development analytics

**Configuration**:

```env
NODE_ENV=development
DEBUG=true
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-dev-project
FIREBASE_PROJECT_ID=your-dev-project
```

### **Preview Environment**

**Purpose**: Testing PRs and feature branches
**Firebase Project**: Separate preview project
**Features**:

- Preview-specific branding
- Test data isolation
- Preview analytics
- PR-specific URLs

**Configuration**:

```env
NODE_ENV=preview
NEXT_PUBLIC_IS_PREVIEW=true
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-preview-project
FIREBASE_PROJECT_ID=your-preview-project
```

### **Production Environment**

**Purpose**: Live production application
**Firebase Project**: Production project
**Features**:

- Production analytics
- Real user data
- Performance monitoring
- Error tracking

**Configuration**:

```env
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-prod-project
FIREBASE_PROJECT_ID=your-prod-project
```

## 🛠️ Local Development Setup

### **Environment File Management**

1. **Copy environment templates:**

   ```bash
   cp env.development.template .env.development
   cp env.preview.template .env.preview
   cp env.production.template .env.production
   ```

2. **Fill in development values:**

   ```bash
   # Edit .env.development with your development Firebase project
   nano .env.development
   ```

3. **Validate environment:**
   ```bash
   npm run validate:production
   ```

### **Local Development Commands**

```bash
# Development with development environment
npm run dev

# Build for production
npm run build

# Start production build
npm run start

# Validate environment
npm run validate:production
```

## 🔒 Security Considerations

### **Environment Isolation**

1. **Separate Firebase Projects**: Each environment uses its own Firebase project
2. **Separate API Keys**: Different Dify API keys for each environment
3. **Separate Service Accounts**: Different Firebase service accounts
4. **Environment-Specific Secrets**: Different secrets for each environment

### **Access Control**

- **Development**: Full access for developers
- **Preview**: Limited access for testing
- **Production**: Restricted access, approval required

### **Data Isolation**

- **Development**: Test data, safe to reset
- **Preview**: Temporary data, auto-cleanup
- **Production**: Real user data, backup required

## 📊 Monitoring and Observability

### **Environment-Specific Monitoring**

1. **Sentry Projects**: Separate projects for each environment
2. **Firebase Analytics**: Separate analytics for each environment
3. **Performance Monitoring**: Environment-specific metrics
4. **Error Tracking**: Environment-specific error tracking

### **Monitoring Setup**

```bash
# Development Sentry
SENTRY_PROJECT=your-app-dev

# Preview Sentry
SENTRY_PROJECT=your-app-preview

# Production Sentry
SENTRY_PROJECT=your-app-prod
```

## 🚀 Deployment Workflow

### **Development Workflow**

1. **Create feature branch:**

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Develop locally:**

   ```bash
   npm run dev
   ```

3. **Push to develop:**
   ```bash
   git push origin develop
   # Triggers development deployment
   ```

### **Preview Workflow**

1. **Create Pull Request:**

   ```bash
   git push origin feature/new-feature
   # Create PR from feature branch to main
   ```

2. **Automatic Preview Deployment:**
   - CI/CD creates preview deployment
   - Comments PR with preview URL
   - Team can test changes

### **Production Workflow**

1. **Merge to main:**

   ```bash
   git checkout main
   git merge feature/new-feature
   git push origin main
   ```

2. **Automatic Production Deployment:**
   - CI/CD deploys to production
   - Runs Lighthouse CI
   - Creates GitHub release
   - Notifies team

## 🔧 Troubleshooting

### **Common Issues**

1. **Environment Variables Not Loading:**
   - Check Vercel dashboard environment settings
   - Verify variable names match exactly
   - Ensure variables are set for correct environment

2. **Firebase Project Mismatch:**
   - Verify Firebase project IDs match between client and server
   - Check service account permissions
   - Ensure project is properly configured

3. **Preview Deployments Not Working:**
   - Check PR branch configuration
   - Verify preview environment variables
   - Check Vercel project settings

### **Debugging Commands**

```bash
# Check environment variables
vercel env ls

# Pull environment variables
vercel env pull .env.local

# Deploy specific environment
vercel --target=preview
vercel --target=development
vercel --prod
```

## 📞 Support

For multi-environment setup issues:

- Check [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- Review [Firebase Multi-Project Setup](https://firebase.google.com/docs/cli#project-aliases)
- Create an issue in this repository

---

**Remember**: Always test your multi-environment setup in development before deploying to production!
