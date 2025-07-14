"use client";

import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from '@/lib/apollo-client';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ReactNode, useMemo } from 'react';
import { ProvidersProps } from '@/types';

function ApolloWrapper({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    return createApolloClient();
  }, []);

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ApolloWrapper>
          {children}
        </ApolloWrapper>
      </AuthProvider>
    </ThemeProvider>
  );
} 