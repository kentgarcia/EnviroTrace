import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { useAuthStore } from "@/hooks/useAuthStore";
import { onError } from "@apollo/client/link/error";

// Create an http link
const httpLink = createHttpLink({
  uri: "http://localhost:4000/", // Your GraphQL server URL - make sure it's correct
});

// Create an error link for error handling
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    // Handle offline mode if needed
  }
});

// Auth link to add the auth token to requests
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from the store
  const { token } = useAuthStore.getState();

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Create the Apollo client
export const apolloClient = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
  // Add validationRules for better error reporting
  queryDeduplication: false,
});

export function ApolloClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
