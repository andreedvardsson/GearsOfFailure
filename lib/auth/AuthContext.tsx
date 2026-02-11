'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authenticate: (email: string, password: string) => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || 'chasacademy.se';
const SKIP_EMAIL_VERIFICATION = process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION === 'true';

function validateEmailDomain(email: string): boolean {
  const domain = email.split('@')[1];
  return domain === ALLOWED_DOMAIN;
}

// Helper to create server-side session cookie
async function createSessionCookie(user: User): Promise<void> {
  try {
    const idToken = await user.getIdToken();
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  } catch (error) {
    console.error('Failed to create session cookie:', error);
    // Don't fail auth if session creation fails - client-side auth still works
  }
}

// Helper to log login events for audit trail
async function logLoginEvent(
  email: string,
  success: boolean,
  method: 'password' | 'email_link',
  userId?: string,
  errorMessage?: string
): Promise<void> {
  try {
    await fetch('/api/auth/log-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        success,
        method,
        userId,
        errorMessage,
      }),
    });
  } catch (error) {
    console.error('Failed to log login event:', error);
    // Don't fail auth if logging fails
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Guard against auth not being initialized (SSR)
    if (typeof window === 'undefined' || !auth) {
      // Retry when auth becomes available
      const timer = setTimeout(() => {
        setLoading(false); // Prevent infinite loading
      }, 100);
      return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verify domain on every auth state change
        if (!validateEmailDomain(user.email || '')) {
          if (auth) await firebaseSignOut(auth);
          setUser(null);
          setLoading(false);
          return;
        }
        // Allow user to be set even if email not verified
        // Pages can check user.emailVerified if they need to
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Unified authenticate method - tries sign in, auto-creates account if user doesn't exist
  const authenticate = async (email: string, password: string) => {
    try {
      if (!auth) {
        return { success: false, error: 'Authentication not initialized' };
      }

      if (!validateEmailDomain(email)) {
        return {
          success: false,
          error: `Only @${ALLOWED_DOMAIN} email addresses are allowed`
        };
      }

      // First, try to sign in
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if email is verified (skip in dev mode)
        if (!SKIP_EMAIL_VERIFICATION && !user.emailVerified) {
          // Log failed login (email not verified)
          await logLoginEvent(email, false, 'password', user.uid, 'Email not verified');

          // Sign them out and show error
          await firebaseSignOut(auth);
          return {
            success: false,
            error: 'Please verify your email before signing in. Check your inbox for the verification link.'
          };
        }

        // Create server-side session cookie
        await createSessionCookie(user);

        // Log successful login
        await logLoginEvent(email, true, 'password', user.uid);

        router.push('/');
        return { success: true, isNewUser: false };
      } catch (signInError: unknown) {
        // If user doesn't exist or credentials are invalid, try to create new account
        const firebaseError = signInError as { code?: string };
        if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/invalid-credential') {
          // Auto-signup: Create new Firebase user
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Send verification email (unless skipped in dev mode)
          if (!SKIP_EMAIL_VERIFICATION) {
            await sendEmailVerification(user);
          }

          // Create student profile in database
          try {
            await fetch('/api/user/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, role: 'student' }),
            });
          } catch (profileError) {
            console.error('Error creating profile:', profileError);
            // Continue anyway - profile can be created later
          }

          // In dev mode with skip enabled, sign them in immediately
          if (SKIP_EMAIL_VERIFICATION) {
            // Create server-side session cookie
            await createSessionCookie(user);

            // Log successful login (new user)
            await logLoginEvent(email, true, 'password', user.uid);

            router.push('/dashboard');
            return {
              success: true,
              isNewUser: true,
              error: 'Welcome! Your account has been created.'
            };
          }

          // In production, sign out - they need to verify email first
          await firebaseSignOut(auth);

          // Log account creation (not a successful login yet)
          await logLoginEvent(email, false, 'password', user.uid, 'Account created - email verification required');

          return {
            success: true,
            isNewUser: true,
            error: 'Account created! Please check your email to verify your account before signing in.'
          };
        }

        // If it's a different error (like wrong password for existing user), throw it
        throw signInError;
      }
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      const firebaseError = error as { code?: string };
      const errorMessage = firebaseError.code === 'auth/wrong-password'
        ? 'Incorrect password'
        : firebaseError.code === 'auth/invalid-email'
        ? 'Invalid email address'
        : firebaseError.code === 'auth/weak-password'
        ? 'Password should be at least 6 characters'
        : firebaseError.code === 'auth/email-already-in-use'
        ? 'Incorrect password' // Don't reveal that account exists
        : 'Authentication failed. Please try again.';

      // Log failed login attempt
      await logLoginEvent(email, false, 'password', undefined, firebaseError.code || 'Unknown error');

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!auth) {
        return { success: false, error: 'Authentication not initialized' };
      }

      if (!validateEmailDomain(email)) {
        return {
          success: false,
          error: `Only @${ALLOWED_DOMAIN} email addresses are allowed`
        };
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create server-side session cookie
      await createSessionCookie(user);

      // Log successful login
      await logLoginEvent(email, true, 'password', user.uid);

      router.push('/');
      return { success: true };
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      const firebaseError = error as { code?: string };

      // Log failed login attempt
      await logLoginEvent(email, false, 'password', undefined, firebaseError.code || 'Unknown error');

      return {
        success: false,
        error: firebaseError.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : 'Failed to sign in. Please try again.'
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      if (!auth) {
        return { success: false, error: 'Authentication not initialized' };
      }

      if (!validateEmailDomain(email)) {
        return {
          success: false,
          error: `Only @${ALLOWED_DOMAIN} email addresses are allowed`
        };
      }

      await createUserWithEmailAndPassword(auth, email, password);

      // Create student profile in database
      try {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role: 'student' }),
        });
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
        // Continue anyway - profile can be created later
      }

      router.push('/dashboard');
      return { success: true };
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const firebaseError = error as { code?: string };
      return {
        success: false,
        error: firebaseError.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists'
          : firebaseError.code === 'auth/weak-password'
          ? 'Password should be at least 6 characters'
          : 'Failed to create account. Please try again.'
      };
    }
  };

  const signOut = async () => {
    try {
      // Clear server-side session cookie
      await fetch('/api/auth/session', { method: 'DELETE' });

      // Sign out from Firebase
      if (auth) {
        await firebaseSignOut(auth);
      }

      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!auth) {
        return { success: false, error: 'Authentication not initialized' };
      }

      if (!validateEmailDomain(email)) {
        return {
          success: false,
          error: `Only @${ALLOWED_DOMAIN} email addresses are allowed`
        };
      }

      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'Failed to send reset email. Please try again.'
      };
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!user) {
        return {
          success: false,
          error: 'No user is signed in'
        };
      }

      if (user.emailVerified) {
        return {
          success: false,
          error: 'Email is already verified'
        };
      }

      await sendEmailVerification(user);
      return { success: true };
    } catch (error: unknown) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        error: 'Failed to send verification email. Please try again.'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, authenticate, signIn, signUp, signOut, resetPassword, resendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
