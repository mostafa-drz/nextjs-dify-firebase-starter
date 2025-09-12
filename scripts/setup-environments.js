#!/usr/bin/env node

/**
 * Multi-Environment Setup Script
 * Helps configure and validate multiple Vercel environments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const environments = {
  development: {
    branch: 'develop',
    firebaseProject: 'your-app-dev',
    difyApp: 'development',
    sentryProject: 'your-app-dev',
    description: 'Development environment for local testing'
  },
  preview: {
    branch: 'feature/*',
    firebaseProject: 'your-app-preview',
    difyApp: 'preview',
    sentryProject: 'your-app-preview',
    description: 'Preview environment for PR testing'
  },
  production: {
    branch: 'main',
    firebaseProject: 'your-app-prod',
    difyApp: 'production',
    sentryProject: 'your-app-prod',
    description: 'Production environment for live application'
  }
};

function printHeader() {
  console.log('🌍 Multi-Environment Setup Script');
  console.log('=====================================\n');
}

function printEnvironmentInfo() {
  console.log('📋 Environment Configuration:');
  console.log('============================\n');
  
  Object.entries(environments).forEach(([env, config]) => {
    console.log(`🔹 ${env.toUpperCase()}`);
    console.log(`   Branch: ${config.branch}`);
    console.log(`   Firebase Project: ${config.firebaseProject}`);
    console.log(`   Dify App: ${config.difyApp}`);
    console.log(`   Sentry Project: ${config.sentryProject}`);
    console.log(`   Description: ${config.description}`);
    console.log('');
  });
}

function checkEnvironmentFiles() {
  console.log('📁 Checking Environment Files:');
  console.log('===============================\n');
  
  const envFiles = [
    '.env.development',
    '.env.preview',
    '.env.production',
    'env.development.template',
    'env.preview.template',
    'env.production.template'
  ];
  
  envFiles.forEach(file => {
    const exists = fs.existsSync(file);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${file}`);
  });
  
  console.log('');
}

function checkVercelCLI() {
  console.log('🔧 Checking Vercel CLI:');
  console.log('========================\n');
  
  try {
    const version = execSync('vercel --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Vercel CLI installed: ${version}`);
    
    try {
      const whoami = execSync('vercel whoami', { encoding: 'utf8' }).trim();
      console.log(`✅ Logged in as: ${whoami}`);
    } catch (error) {
      console.log('❌ Not logged in to Vercel');
      console.log('   Run: vercel login');
    }
  } catch (error) {
    console.log('❌ Vercel CLI not installed');
    console.log('   Install: npm install -g vercel');
  }
  
  console.log('');
}

function checkFirebaseCLI() {
  console.log('🔥 Checking Firebase CLI:');
  console.log('==========================\n');
  
  try {
    const version = execSync('firebase --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Firebase CLI installed: ${version}`);
    
    try {
      const projects = execSync('firebase projects:list', { encoding: 'utf8' });
      console.log('✅ Firebase projects accessible');
    } catch (error) {
      console.log('❌ Firebase CLI not authenticated');
      console.log('   Run: firebase login');
    }
  } catch (error) {
    console.log('❌ Firebase CLI not installed');
    console.log('   Install: npm install -g firebase-tools');
  }
  
  console.log('');
}

function generateEnvironmentSetup() {
  console.log('🚀 Environment Setup Commands:');
  console.log('===============================\n');
  
  console.log('1. Create Firebase Projects:');
  Object.entries(environments).forEach(([env, config]) => {
    console.log(`   firebase projects:create ${config.firebaseProject}`);
  });
  
  console.log('\n2. Set up Firebase Project Aliases:');
  Object.entries(environments).forEach(([env, config]) => {
    console.log(`   firebase use --add ${config.firebaseProject} --alias ${env}`);
  });
  
  console.log('\n3. Deploy Firebase Rules to Each Environment:');
  Object.entries(environments).forEach(([env, config]) => {
    console.log(`   firebase use ${env} && firebase deploy --only firestore:rules`);
  });
  
  console.log('\n4. Set up Vercel Environments:');
  console.log('   - Go to Vercel Dashboard → Project Settings → Environment Variables');
  console.log('   - Add variables for each environment (Development, Preview, Production)');
  console.log('   - Configure branch settings for each environment');
  
  console.log('\n5. Test Deployments:');
  console.log('   vercel --target=development');
  console.log('   vercel --target=preview');
  console.log('   vercel --prod');
  
  console.log('');
}

function generateGitHubSecrets() {
  console.log('🔐 Required GitHub Secrets:');
  console.log('============================\n');
  
  const secrets = [
    'VERCEL_TOKEN',
    'VERCEL_ORG_ID',
    'VERCEL_PROJECT_ID',
    'VERCEL_PROJECT_URL',
    'FIREBASE_TOKEN',
    'SENTRY_AUTH_TOKEN'
  ];
  
  secrets.forEach(secret => {
    console.log(`🔑 ${secret}`);
  });
  
  console.log('\n📝 How to get these secrets:');
  console.log('   VERCEL_TOKEN: vercel login:ci');
  console.log('   VERCEL_ORG_ID: vercel orgs list');
  console.log('   VERCEL_PROJECT_ID: vercel project ls');
  console.log('   FIREBASE_TOKEN: firebase login:ci');
  console.log('   SENTRY_AUTH_TOKEN: Sentry → Settings → Auth Tokens');
  
  console.log('');
}

function printNextSteps() {
  console.log('📋 Next Steps:');
  console.log('==============\n');
  
  console.log('1. 📁 Create environment files:');
  console.log('   cp env.development.template .env.development');
  console.log('   cp env.preview.template .env.preview');
  console.log('   cp env.production.template .env.production');
  
  console.log('\n2. 🔥 Set up Firebase projects:');
  console.log('   Run the Firebase commands shown above');
  
  console.log('\n3. 🌐 Configure Vercel environments:');
  console.log('   Set up environment variables in Vercel dashboard');
  
  console.log('\n4. 🔐 Add GitHub secrets:');
  console.log('   Add the required secrets to your GitHub repository');
  
  console.log('\n5. 🚀 Test deployments:');
  console.log('   Push to develop branch → Development deployment');
  console.log('   Create PR → Preview deployment');
  console.log('   Merge to main → Production deployment');
  
  console.log('\n6. 📚 Read the documentation:');
  console.log('   MULTI_ENVIRONMENT_SETUP.md');
  
  console.log('');
}

function main() {
  printHeader();
  printEnvironmentInfo();
  checkEnvironmentFiles();
  checkVercelCLI();
  checkFirebaseCLI();
  generateEnvironmentSetup();
  generateGitHubSecrets();
  printNextSteps();
  
  console.log('✅ Multi-environment setup analysis complete!');
  console.log('   Follow the steps above to configure your environments.');
}

// Run the script
main();
