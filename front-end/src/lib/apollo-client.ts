import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { Observable } from '@apollo/client/utilities';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include', // Send all cookies including access token
});

// Error link for token refresh
const createErrorLink = () => {
  return onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      for (const _err of graphQLErrors) {
        console.log('GraphQL Error:', _err.message, _err.extensions);
        // Handle expired token
        if (_err.extensions?.code === 'UNAUTHENTICATED' && _err.message.includes('logged in')) {
          console.log('Attempting to refresh token...');
          return new Observable(observer => {
            fetch('http://localhost:4000/api/refresh-token', {
              method: 'POST',
              credentials: 'include',
            })
            .then(response => {
              console.log('Refresh token response status:', response.status);
              if (response.ok) {
                return response.json();
              }
              throw new Error('Token refresh failed');
            })
            .then(() => {
              console.log('Token refresh successful, new token received');
              // Reload page to update auth context
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            })
            .catch(error => {
              console.error('Token refresh failed:', error);
              // Redirect to login on refresh failure
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
              observer.error(error);
            });
          });
        }
      }
    }
    
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  });
};

// Export a function to create the client
export const createApolloClient = () => {
  const errorLink = createErrorLink();
  
  return new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
    },
  });
};

// Default client for initial setup
const client = new ApolloClient({
  link: from([createErrorLink(), httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client; 