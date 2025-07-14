"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:4000/api/refresh-token', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            query: `
              query {
                me {
                  id
                  email
                  role
                  createdAt
                  updatedAt
                }
              }
            `
          })
        });

        const result = await response.json();
        
        if (result.data?.me) {
          setUser(result.data.me);
        } else if (result.errors && result.errors.some((err: any) => err.extensions?.code === 'UNAUTHENTICATED')) {
          const success = await refreshToken();
          if (success) {
            // Retry query after token refresh
            const retryResponse = await fetch('http://localhost:4000/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                query: `
                  query {
                    me {
                      id
                      email
                      role
                      createdAt
                      updatedAt
                    }
                  }
                `
              })
            });

            const retryResult = await retryResponse.json();
            
            if (retryResult.data?.me) {
              setUser(retryResult.data.me);
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Refresh token when user returns to tab
  useEffect(() => {
    const handleFocus = async () => {
      if (user) {
        await refreshToken();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const login = (token: string, userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 