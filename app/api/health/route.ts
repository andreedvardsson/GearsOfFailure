import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 *
 * Used by Docker Compose and load balancers to verify the app is running.
 * Returns:
 * - status: 'healthy' or 'unhealthy'
 * - timestamp: current server time
 * - database: connection status
 * - version: app version from env
 */
export async function GET() {
  const startTime = Date.now();

  let dbStatus = 'disconnected';
  let dbLatency = 0;

  // Check MongoDB connection if URI is configured
  if (process.env.MONGODB_URI) {
    try {
      // Dynamic import to avoid issues if MongoDB isn't configured
      const { getDatabase } = await import('@/lib/mongodb');
      const db = await getDatabase();

      // Ping the database to verify connection
      const pingStart = Date.now();
      await db.command({ ping: 1 });
      dbLatency = Date.now() - pingStart;
      dbStatus = 'connected';
    } catch (error) {
      console.error('Health check - DB connection failed:', error);
      dbStatus = 'error';
    }
  } else {
    dbStatus = 'not_configured';
  }

  const isHealthy = dbStatus === 'connected' || dbStatus === 'not_configured';
  const totalLatency = Date.now() - startTime;

  const response = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: {
        status: dbStatus,
        latency_ms: dbLatency,
      },
    },
    latency_ms: totalLatency,
  };

  return NextResponse.json(response, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
