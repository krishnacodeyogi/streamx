'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { signIn, signUp, signInWithGoogle } from '@/lib/supabase';

type Mode = 'signin' | 'signup';

export default function AuthModal() {
  const showAuthModal = useStore((s) => s.showAuthModal);
  const setShowAuthModal = useStore((s) => s.setShowAuthModal);

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!showAuthModal) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      setError('');
      setSuccess('');
      setMode('signin');
    }
  }, [showAuthModal]);

  // Close on Escape key
  useEffect(() => {
    if (!showAuthModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAuthModal(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showAuthModal, setShowAuthModal]);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error: err } = await signUp(email, password, displayName || undefined);
        if (err) throw err;
        // Supabase returns user but no session when email confirmation is enabled
        if (data.user && !data.session) {
          setSuccess('Account created! Check your email to confirm, then sign in.');
          setMode('signin');
          setPassword('');
          return;
        }
      } else {
        const { error: err } = await signIn(email, password);
        if (err) throw err;
      }
      setShowAuthModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const { error: err } = await signInWithGoogle();
      if (err) throw err;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setShowAuthModal(false)}
    >
      <div
        className="relative w-full max-w-md mx-4 bg-surface-elevated border border-border rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-surface-tertiary transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1 mb-2">
            <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
              <rect width="28" height="20" rx="4" fill="#FF0000" />
              <polygon points="11,5 21,10 11,15" fill="white" />
            </svg>
            <span className="font-bold text-xl text-text-primary tracking-tight">
              Stream<span className="text-brand">X</span>
            </span>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            {mode === 'signin' ? 'Sign in to StreamX' : 'Create your account'}
          </h2>
        </div>

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-lg hover:bg-surface-tertiary transition-colors mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          <span className="text-sm font-medium text-text-primary">Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-text-muted">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue-500 transition-colors"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue-500 transition-colors"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue-500 transition-colors"
            required
          />

          {mode === 'signup' && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue-500 transition-colors"
              required
            />
          )}

          {success && (
            <p className="text-green-500 text-xs px-1">{success}</p>
          )}

          {error && (
            <p className="text-red-500 text-xs px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand hover:bg-red-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-text-muted mt-4">
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                className="text-blue-500 hover:underline font-medium"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setError(''); }}
                className="text-blue-500 hover:underline font-medium"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
