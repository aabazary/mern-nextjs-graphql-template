"use client";

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SIGNUP_MUTATION } from '@/graphql/mutations';
import { useAuth } from '@/contexts/AuthContext';
import { SignupFormProps } from '@/types';

export default function SignupForm({ onClose, onToggleToLogin }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const [signupMutation] = useMutation(SIGNUP_MUTATION);

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
      const { data } = await signupMutation({
        variables: { email, password },
      });

      if (data?.signup) {
        login(data.signup.token, data.signup.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-[var(--color-error)] text-[var(--color-text-button)] p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email-signup" className="block text-sm font-medium text-[var(--color-text-secondary)]">
          Email
        </label>
        <input
          type="email"
          id="email-signup"
          className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-md shadow-sm placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-[var(--color-text-input)]"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label htmlFor="password-signup" className="block text-sm font-medium text-[var(--color-text-secondary)]">
          Password
        </label>
        <input
          type="password"
          id="password-signup"
          className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-md shadow-sm placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-[var(--color-text-input)]"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label htmlFor="confirm-password-signup" className="block text-sm font-medium text-[var(--color-text-secondary)]">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirm-password-signup"
          className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-md shadow-sm placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-[var(--color-text-input)]"
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
        {isLoading ? 'Signing up...' : 'Sign Up'}
      </button>
      
      <div className="text-center text-sm mt-4">
        <p className="text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggleToLogin}
            className="font-medium text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors duration-200 focus:outline-none"
          >
            Log In
          </button>
        </p>
      </div>
    </form>
  );
}