import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, isFirebaseAdminAvailable } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'session';
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 5; // 5 days in seconds

// POST - Create session cookie from Firebase ID token
export async function POST(request: NextRequest) {
  // Check if Firebase is configured
  if (!isFirebaseAdminAvailable() || !adminAuth) {
    return NextResponse.json(
      {
        error: 'Authentication not configured',
        message: 'Firebase Admin SDK is not set up. This is OK for Week 2-4 - focus on Docker concepts!',
      },
      { status: 503 }
    );
  }

  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    // Verify the ID token and create a session cookie
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create session cookie with 5 day expiration
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_COOKIE_MAX_AGE * 1000, // milliseconds
    });

    // Set the cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({
      success: true,
      email: decodedToken.email,
    });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// DELETE - Clear session cookie (logout)
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
