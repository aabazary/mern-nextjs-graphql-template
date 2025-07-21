"use client";

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REQUEST_PASSWORD_RESET_MUTATION } from '@/graphql/mutations';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [requestPasswordReset] = useMutation(REQUEST_PASSWORD_RESET_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      await requestPasswordReset({
        variables: { email },
      });
      
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to request password reset');
      } else {
        setError('Failed to request password reset');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-md bg-[var(--color-bg-secondary)] rounded-lg shadow-2xl p-6 border border-[var(--color-border-primary)]">
        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-6">Forgot Password</h1>
        
        {error && (
          <div className="bg-[var(--color-error)] text-[var(--color-text-button)] p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-[var(--color-success)] text-[var(--color-text-button)] p-3 rounded-md text-sm mb-4">
            If an account with that email exists, a password reset link has been sent.
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
              className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-md shadow-sm placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-[var(--color-text-input)]"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--color-text-button)] bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
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