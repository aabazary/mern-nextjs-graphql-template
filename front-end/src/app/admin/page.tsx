"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@apollo/client';
import { GET_USERS_QUERY } from '@/graphql/queries';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { formatDate } from '@/utils/dateUtils';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const { data, loading, error } = useQuery(GET_USERS_QUERY, {
    skip: !isAuthenticated || (user?.role !== 'SUPERADMIN' && user?.role !== 'OWNER'),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    if (user && user.role !== 'SUPERADMIN' && user.role !== 'OWNER') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (user && user.role !== 'SUPERADMIN' && user.role !== 'OWNER') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[var(--color-bg-primary)]">
        <div className="text-xl text-[var(--color-text-primary)]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[var(--color-bg-primary)]">
        <div className="text-xl text-[var(--color-error)]">Error loading users: {error.message}</div>
        <div className="text-sm text-[var(--color-text-secondary)] mt-2">
          The system will automatically try to refresh your token. If the problem persists, please log in again.
        </div>
      </div>
    );
  }

  const users = data?.users || [];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-6">Admin Panel</h1>
        
        {user?.role === 'OWNER' ? (
          <div className="bg-[var(--color-bg-secondary)] rounded-lg shadow-2xl p-6 border border-[var(--color-border-primary)]">
            <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-4">Owner Dashboard</h2>
            <p className="text-[var(--color-text-secondary)]">Welcome to the owner dashboard. This area is reserved for OWNER functionality.</p>
          </div>
        ) : (
          <div className="bg-[var(--color-bg-secondary)] rounded-lg shadow-2xl p-6 border border-[var(--color-border-primary)]">
            <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-4">All Users</h2>
            
            {users.length === 0 ? (
              <p className="text-[var(--color-text-secondary)]">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--color-border-primary)]">
                  <thead className="bg-[var(--color-bg-tertiary)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--color-bg-secondary)] divide-y divide-[var(--color-border-primary)]">
                    {users.map((user: import("@/types").User) => (
                      <tr key={user.id} className="hover:bg-[var(--color-bg-tertiary)] transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'SUPERADMIN' ? 'bg-[var(--color-role-superadmin)] text-[var(--color-role-superadmin-text)]' :
                            user.role === 'OWNER' ? 'bg-[var(--color-role-owner)] text-[var(--color-role-owner-text)]' :
                            user.role === 'REGISTERED' ? 'bg-[var(--color-role-registered)] text-[var(--color-role-registered-text)]' :
                            'bg-[var(--color-role-default)] text-[var(--color-role-default-text)]'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 