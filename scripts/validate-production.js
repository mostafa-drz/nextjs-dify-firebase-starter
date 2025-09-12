#!/usr/bin/env node

/**
 * Production Environment Validation Script
 * Validates all required environment variables and configurations for production deployment
 */

const requiredEnvVars = {
  client: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_SUPPORT_EMAIL',
  ],
  server: [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'DIFY_API_KEY',
    'DIFY_BASE_URL',
  ],
  optional: [
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
    'SENTRY_DSN',
    'SENTRY_ORG',
    'SENTRY_PROJECT',
    'SENTRY_AUTH_TOKEN',
  ],
};

function validateEnvironment() {
  console.log('🔍 Validating production environment...\n');

  let hasErrors = false;

  // Check client-side environment variables
  console.log('📱 Client-side environment variables:');
  requiredEnvVars.client.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ Missing: ${varName}`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    }
  });

  console.log('\n🔒 Server-side environment variables:');
  requiredEnvVars.server.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ Missing: ${varName}`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    }
  });

  console.log('\n🔧 Optional environment variables:');
  requiredEnvVars.optional.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      console.log(`⚠️  Missing (optional): ${varName}`);
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    }
  });

  // Validate Firebase configuration
  console.log('\n🔥 Firebase configuration validation:');
  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
  const nextPublicProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (firebaseProjectId !== nextPublicProjectId) {
    console.log('❌ Firebase project IDs do not match between client and server');
    hasErrors = true;
  } else {
    console.log('✅ Firebase project IDs match');
  }

  // Validate private key format
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.log('❌ Firebase private key format appears incorrect');
    hasErrors = true;
  } else if (privateKey) {
    console.log('✅ Firebase private key format looks correct');
  }

  // Validate Dify configuration
  console.log('\n🤖 Dify configuration validation:');
  const difyBaseUrl = process.env.DIFY_BASE_URL;
  if (difyBaseUrl && !difyBaseUrl.startsWith('https://')) {
    console.log('❌ Dify base URL should use HTTPS');
    hasErrors = true;
  } else if (difyBaseUrl) {
    console.log('✅ Dify base URL uses HTTPS');
  }

  // Environment summary
  console.log('\n📊 Environment Summary:');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Node Version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);

  if (hasErrors) {
    console.log('\n❌ Validation failed! Please fix the errors above before deploying.');
    process.exit(1);
  } else {
    console.log('\n✅ All validations passed! Ready for production deployment.');
  }
}

// Run validation
validateEnvironment();
