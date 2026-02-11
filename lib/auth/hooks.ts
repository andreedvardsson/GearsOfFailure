'use client';

import { useAuth } from './AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Check if Firebase is configured
      const firebaseConfigured = !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      );

      // Redirect to status page if Firebase isn't configured
      // Otherwise redirect to login
      router.push(firebaseConfigured ? '/login' : '/status');
    }
  }, [user, loading, router]);

  return { user, loading };
}

export function useRedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  return { user, loading };
}
