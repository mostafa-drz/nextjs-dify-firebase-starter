# 🚀 Production Deployment Guide

This guide provides comprehensive instructions for deploying your Next.js + Firebase boilerplate to production environments.

## 📋 Prerequisites

- GitHub repository with your code
- Firebase project with authentication and Firestore enabled
- Dify.ai account with API access
- Sentry account (optional, for error monitoring)

## 🏗️ Environment Setup

### 1. Production Environment Variables

Create a `.env.production` file with your production values:

```env
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_production_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin Configuration (Server-side)
FIREBASE_PROJECT_ID=your_production_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"

# Dify AI Configuration
DIFY_API_KEY=your_production_dify_api_key
DIFY_BASE_URL=https://api.dify.ai/v1

# Application Configuration
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com

# Sentry Configuration (Optional)
SENTRY_DSN=your_production_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Environment
NODE_ENV=production
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**

- Native Next.js optimization
- Automatic deployments from GitHub
- Built-in environment variable management
- Global CDN with edge caching
- Preview deployments for PRs

#### Setup Steps:

1. **Connect to Vercel:**

   ```bash
   npm install -g vercel
   vercel login
   vercel link
   ```

2. **Configure Environment Variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all production environment variables
   - Set them for "Production" environment

3. **Deploy:**

   ```bash
   vercel --prod
   ```

4. **GitHub Integration:**
   - Connect your GitHub repository in Vercel dashboard
   - Enable automatic deployments
   - Set up preview deployments for PRs

#### Required GitHub Secrets:

```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_PROJECT_URL=your_vercel_project_url
```

### Option 2: Railway

**Why Railway?**

- Simple deployment process
- Built-in database support
- Automatic HTTPS
- Good for full-stack applications

#### Setup Steps:

1. **Connect to Railway:**
   - Visit [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Railway will auto-detect Next.js

2. **Configure Environment Variables:**
   - Add all production environment variables in Railway dashboard

3. **Deploy:**
   - Railway automatically deploys on push to main branch

### Option 3: Docker Deployment

For self-hosted or cloud provider deployments:

#### Build and Run:

```bash
# Build the Docker image
docker build -t nextjs-dify-firebase-starter .

# Run with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=your_key \
  -e FIREBASE_PROJECT_ID=your_project \
  # ... other environment variables
  nextjs-dify-firebase-starter
```

#### Using Docker Compose:

```bash
# Copy environment variables
cp .env.production .env

# Start the application
docker-compose up -d
```

## 🔧 CI/CD Pipeline Setup

### GitHub Actions Configuration

The project includes comprehensive CI/CD workflows:

1. **Quality Assurance** (`ci-cd.yml`):
   - Type checking
   - Linting
   - Format checking
   - Build verification
   - Security scanning

2. **Firebase Deployment** (`firebase-deploy.yml`):
   - Automatic Firestore rules deployment
   - Firestore indexes deployment

3. **Semantic Release** (`release.yml`):
   - Automated version management
   - GitHub releases
   - Changelog generation

### Required GitHub Secrets:

```bash
# Vercel (if using Vercel)
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_PROJECT_URL=your_vercel_project_url

# Firebase
FIREBASE_TOKEN=your_firebase_token

# Sentry (optional)
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### Getting Firebase Token:

```bash
npm install -g firebase-tools
firebase login:ci
```

## 🔒 Security Considerations

### 1. Environment Variables

- **Never commit** `.env` files to version control
- Use **different Firebase projects** for development and production
- **Rotate API keys** regularly
- Use **least privilege** principle for service accounts

### 2. Firebase Security Rules

- Test rules thoroughly in Firebase Console
- Use Firebase Emulator for local testing
- Implement proper user authentication checks
- Restrict admin operations to server-side only

### 3. API Security

- Implement rate limiting (already included)
- Validate all inputs server-side
- Use HTTPS everywhere
- Implement proper CORS policies

### 4. Monitoring

- Set up Sentry for error tracking
- Monitor Firebase usage and costs
- Set up alerts for critical errors
- Regular security audits

## 📊 Monitoring & Observability

### 1. Sentry Integration

- Error tracking and performance monitoring
- User feedback collection
- Release tracking
- Performance metrics

### 2. Firebase Monitoring

- Authentication metrics
- Firestore usage and performance
- Security rule violations
- Cost monitoring

### 3. Application Monitoring

- Uptime monitoring
- Performance metrics
- User analytics
- Error rates

## 🚀 Deployment Checklist

### Pre-Deployment:

- [ ] All environment variables configured
- [ ] Firebase project set up with production settings
- [ ] Firestore security rules tested
- [ ] Dify API keys configured
- [ ] Sentry project configured (optional)
- [ ] Domain configured (if using custom domain)

### Post-Deployment:

- [ ] Test authentication flow
- [ ] Verify Firestore operations
- [ ] Test Dify AI integration
- [ ] Check error monitoring
- [ ] Verify HTTPS and security headers
- [ ] Test performance and loading times
- [ ] Set up monitoring alerts

## 🔄 Maintenance

### Regular Tasks:

- Monitor Firebase usage and costs
- Review and update dependencies
- Security updates and patches
- Performance optimization
- Backup verification
- Log analysis

### Updates:

- Use semantic release for version management
- Test updates in staging environment
- Gradual rollout for major changes
- Monitor error rates after updates

## 🆘 Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check environment variables
   - Verify Firebase configuration
   - Check for TypeScript errors

2. **Authentication Issues:**
   - Verify Firebase project settings
   - Check domain configuration
   - Verify service account permissions

3. **API Errors:**
   - Check Dify API key validity
   - Verify rate limiting
   - Check network connectivity

4. **Performance Issues:**
   - Monitor bundle size
   - Check image optimization
   - Review caching strategies

## 📞 Support

For deployment issues:

- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Check [Vercel Documentation](https://vercel.com/docs) (if using Vercel)
- Create an issue in this repository

---

**Remember:** Always test your deployment in a staging environment before deploying to production!
