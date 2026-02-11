import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, success, method, userId, errorMessage } = body;

    // Get client information
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'Unknown';

    const db = await getDatabase();

    // Create login event
    const loginEvent = {
      email,
      timestamp: new Date(),
      success: Boolean(success),
      ipAddress,
      userAgent,
      method: method || 'password',
      userId: userId || null,
      errorMessage: errorMessage || null,
    };

    await db.collection('loginHistory').insertOne(loginEvent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging login event:', error);
    // Don't fail the request - logging is not critical
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
