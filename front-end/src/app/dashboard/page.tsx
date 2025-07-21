"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME_QUERY } from '@/graphql/queries';
import { UPDATE_USER_MUTATION, DELETE_USER_MUTATION } from '@/graphql/mutations';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/dateUtils';

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { data, loading, refetch } = useQuery(GET_ME_QUERY, {
    skip: !user,
  });

  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
  const [deleteUser] = useMutation(DELETE_USER_MUTATION);

  const handleUpdateUser = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');

    try {
      await updateUser({
        variables: {
          id: user.id,
          email: email,
        },
      });
      
      setIsEditing(false);
      refetch();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to update user');
      } else {
        setError('Failed to update user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user || !confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await deleteUser({
        variables: {
          id: user.id,
        },
      });
      
      logout();
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to delete user');
      } else {
        setError('Failed to delete user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[var(--color-bg-primary)]">
        <div className="text-xl text-[var(--color-text-primary)]">Checking authentication...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[var(--color-bg-primary)]">
        <div className="text-xl text-[var(--color-text-primary)]">Loading user data...</div>
      </div>
    );
  }

  const currentUser = data?.me || user;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-md bg-[var(--color-bg-secondary)] rounded-lg shadow-2xl p-6 border border-[var(--color-border-primary)]">
        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-6">Dashboard</h1>
        
        {error && (
          <div className="bg-[var(--color-error)] text-[var(--color-text-button)] p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-[var(--color-text-input)]"
                disabled={isLoading}
              />
            ) : (
              <p className="mt-1 text-sm text-[var(--color-text-primary)]">{currentUser?.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Role</label>
            <p className="mt-1 text-sm text-[var(--color-text-primary)]">{currentUser?.role}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Created At</label>
            <p className="mt-1 text-sm text-[var(--color-text-primary)]">
              {formatDate(currentUser?.createdAt)}
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdateUser}
                  disabled={isLoading}
                  className="flex-1 bg-[var(--color-primary)] text-[var(--color-text-button)] px-4 py-2 rounded-md hover:bg-[var(--color-secondary)] disabled:opacity-50 transition-colors duration-200"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEmail(currentUser?.email || '');
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] px-4 py-2 rounded-md hover:bg-[var(--color-border-primary)] disabled:opacity-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-[var(--color-primary)] text-[var(--color-text-button)] px-4 py-2 rounded-md hover:bg-[var(--color-secondary)] transition-colors duration-200"
              >
                Edit Profile
              </button>
            )}
          </div>

          <button
            onClick={handleDeleteUser}
            disabled={isLoading}
            className="w-full bg-[var(--color-danger)] text-[var(--color-text-button)] px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
          >
            {isLoading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}