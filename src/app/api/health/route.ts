import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring and Docker health checks
 * Returns application status and basic system information
 */
export async function GET() {
  try {
    // Basic health check
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0',
      services: {
        firebase: await checkFirebaseHealth(),
        dify: await checkDifyHealth(),
      },
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}

/**
 * Check Firebase connectivity
 */
async function checkFirebaseHealth(): Promise<{ status: string; message: string }> {
  try {
    // Check if Firebase environment variables are present
    const hasFirebaseConfig = !!(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    );

    if (!hasFirebaseConfig) {
      return { status: 'unhealthy', message: 'Firebase configuration missing' };
    }

    return { status: 'healthy', message: 'Firebase configuration present' };
  } catch (error) {
    console.error('Firebase health check error:', error);
    return { status: 'unhealthy', message: 'Firebase check failed' };
  }
}

/**
 * Check Dify API connectivity
 */
async function checkDifyHealth(): Promise<{ status: string; message: string }> {
  try {
    // Check if Dify configuration is present
    const hasDifyConfig = !!(process.env.DIFY_API_KEY && process.env.DIFY_BASE_URL);

    if (!hasDifyConfig) {
      return { status: 'unhealthy', message: 'Dify configuration missing' };
    }

    return { status: 'healthy', message: 'Dify configuration present' };
  } catch (error) {
    console.error('Dify health check error:', error);
    return { status: 'unhealthy', message: 'Dify check failed' };
  }
}
