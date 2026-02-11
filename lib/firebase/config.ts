import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton pattern - prevent multiple initializations
let app: FirebaseApp | undefined;
let auth: Auth | undefined;

// Initialize immediately if on client-side
if (typeof window !== 'undefined') {
  // Check if Firebase credentials are provided
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      auth = getAuth(app);
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  } else {
    console.log('ℹ️ Firebase credentials not configured. Authentication features disabled.');
    console.log('📚 This is OK for Week 2! Focus on Docker concepts.');
  }
}

// Ensure auth is always defined for TypeScript
export { app, auth as authInstance };

// Helper to get auth with runtime check
export function getAuthInstance(): Auth {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Make sure this is running on the client side.');
  }
  return auth;
}

// Keep backwards compatibility
export { auth };
