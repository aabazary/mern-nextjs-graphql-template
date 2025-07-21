"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordPageInner() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (!tokenParam || !emailParam) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          newPassword: password,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to reset password');
      }
    } catch {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[var(--color-bg-primary)]">
        <div className="w-full max-w-md bg-[var(--color-bg-secondary)] rounded-lg shadow-2xl p-6 border border-[var(--color-border-primary)]">
          <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-6">Reset Password</h1>
          <div className="bg-[var(--color-error)] text-[var(--color-text-button)] p-3 rounded-md text-sm mb-4">
            Invalid reset link. Please request a new password reset.
          </div>
          <Link href="/forgot-password" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors duration-200">
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-md bg-[var(--color-bg-secondary)] rounded-lg shadow-2xl p-6 border border-[var(--color-border-primary)]">
        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-6">Reset Password</h1>
        
        {error && (
          <div className="bg-[var(--color-error)] text-[var(--color-text-button)] p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-[var(--color-success)] text-[var(--color-text-button)] p-3 rounded-md text-sm mb-4">
            Password reset successfully! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)]">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-md shadow-sm text-[var(--color-text-input)]"
              value={email}
              disabled
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-secondary)]">
              New Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-[var(--color-text-input)]"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-[var(--color-text-secondary)]">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirm-password"
              className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-[var(--color-text-input)]"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--color-text-button)] bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>

          <div className="text-center text-sm">
            <Link href="/" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors duration-200">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordPageInner />
    </Suspense>
  );
}