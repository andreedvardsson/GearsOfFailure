import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK - Optional Configuration
 *
 * For Week 2-3: Firebase is NOT required. Focus on Docker concepts.
 * For Week 5+: Add Firebase credentials when implementing authentication.
 *
 * Required env vars for Firebase Admin:
 * - FIREBASE_ADMIN_PROJECT_ID
 * - FIREBASE_ADMIN_CLIENT_EMAIL
 * - FIREBASE_ADMIN_PRIVATE_KEY
 */

// Check if Firebase Admin credentials are configured
const isFirebaseConfigured =
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY;

// Initialize Firebase Admin SDK only if credentials are present
if (isFirebaseConfigured && !admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
} else if (!isFirebaseConfigured) {
  console.log('ℹ️ Firebase Admin not configured - auth features disabled');
  console.log('📚 This is OK for Week 2-4! Focus on Docker & CI/CD concepts.');
}

// Export auth and app - will be undefined if not configured
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;
export const adminApp = admin.apps.length > 0 ? admin.app() : null;

// Helper to check if Firebase Admin is available
export const isFirebaseAdminAvailable = (): boolean => admin.apps.length > 0;
