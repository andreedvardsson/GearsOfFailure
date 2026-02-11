'use client';

import { useState, useEffect } from 'react';
import { useRedirectIfAuthenticated } from '@/lib/auth/hooks';
import { useAuth } from '@/lib/auth/AuthContext';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TeamFlagsMini from '@/app/components/TeamFlagsMini';

const TAGLINES = [
  'Join your team • Track your progress • Compete for glory',
  'DevSecOps 2026 • Learn by doing • Build together',
  'Submit your work • Climb the leaderboard • Master the cloud',
  'Your security journey starts here',
];

export default function LoginPage() {
  const { authenticate, resetPassword } = useAuth();
  const { loading: authLoading } = useRedirectIfAuthenticated();
  const router = useRouter();

  const [showResetForm, setShowResetForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ teams: number; students: number } | null>(null);

  // Check if Firebase is configured, redirect to status page if not
  useEffect(() => {
    const firebaseConfigured = !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );

    if (!firebaseConfigured) {
      router.push('/status');
    }
  }, [router]);

  // Fetch stats on mount
  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats({ teams: 8, students: 45 }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (showResetForm) {
        const result = await resetPassword(email);
        if (result.success) {
          setSuccess('Password reset email sent! Check your inbox.');
          setEmail('');
        } else {
          setError(result.error || 'Failed to send reset email');
        }
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const result = await authenticate(email, password);
        if (!result.success) {
          setError(result.error || 'Authentication failed');
        } else if (result.isNewUser) {
          // New user - show success message about email verification
          setSuccess(result.error || 'Account created! Check your email to verify your account.');
          setEmail('');
          setPassword('');
        }
        // If result.success && !result.isNewUser, user is redirected automatically
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            TEAM FLAGS
          </h1>
          {/* Scrolling Banner */}
          <div className="relative overflow-hidden w-full h-8 flex items-center">
            <div className="absolute whitespace-nowrap animate-scroll">
              {TAGLINES.map((tagline, idx) => (
                <span key={idx} className="text-slate-300 text-lg mx-8">
                  {tagline}
                </span>
              ))}
              {/* Duplicate for seamless loop */}
              {TAGLINES.map((tagline, idx) => (
                <span key={`dup-${idx}`} className="text-slate-300 text-lg mx-8">
                  {tagline}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <TeamFlagsMini />
          </div>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {showResetForm ? 'Reset Password' : 'Sign In'}
            </h2>
            <p className="text-slate-300 text-sm">
              {showResetForm
                ? 'Enter your email to receive a password reset link'
                : 'Enter your credentials to sign in or create an account'}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-200">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@chasacademy.se"
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Password Field */}
            {!showResetForm && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>{showResetForm ? 'Send Reset Link' : 'Continue'}</>
              )}
            </button>
          </form>

          {/* Password Reset Link */}
          {!showResetForm && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowResetForm(true);
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Back to Sign In Link */}
          {showResetForm && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowResetForm(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Back to sign in
              </button>
            </div>
          )}

          {/* Domain Restriction Notice */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-400 text-center">
              {!showResetForm
                ? 'New users will receive a verification email. Only @chasacademy.se emails allowed.'
                : 'Only @chasacademy.se email addresses are allowed'}
            </p>
          </div>
        </div>

        {/* Stats Display */}
        {stats && (
          <div className="mt-6 flex items-center justify-center gap-6 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span className="text-sm">
                <strong className="text-white">{stats.teams}</strong> Teams
              </span>
            </div>
            <div className="w-px h-4 bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-sm">
                <strong className="text-white">{stats.students}</strong> Students
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
