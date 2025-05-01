import { gql } from "@apollo/client";
import { useState, useEffect } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useAuthStore } from "@/hooks/useAuthStore";
import { UserData, UserRole } from "@/integrations/types/userData";
import { apolloClient } from "./apollo-client";

// GraphQL mutations aligned with our backend server
const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
      user {
        id
        email
        lastSignInAt
        isSuperAdmin
        roles
      }
    }
  }
`;

const SIGN_UP = gql`
  mutation SignUp($email: String!, $password: String!) {
    signUp(email: $email, password: $password) {
      token
      user {
        id
        email
        lastSignInAt
        isSuperAdmin
        roles
      }
    }
  }
`;

const GET_ME = gql`
  query Me {
    me {
      id
      email
      lastSignInAt
      isSuperAdmin
      createdAt
      updatedAt
      roles
    }
  }
`;

export async function signIn(email: string, password: string) {
  try {
    const { data, errors } = await apolloClient.mutate({
      mutation: SIGN_IN,
      variables: { email, password },
    });

    if (errors) {
      throw new Error(errors[0].message);
    }

    if (!data || !data.signIn) {
      throw new Error("Login failed");
    }

    const { token, user } = data.signIn;

    // Store the token
    useAuthStore.getState().setToken(token);

    // Store user roles
    if (user.roles) {
      useAuthStore.getState().setRoles(user.roles);
    }

    // Store user data
    useAuthStore.getState().setUserData({
      id: user.id,
      email: user.email,
      lastSignInAt: user.lastSignInAt,
      isSuperAdmin: user.isSuperAdmin || false,
    });

    return {
      token,
      user,
    };
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}

export async function signUp(email: string, password: string) {
  try {
    const { data, errors } = await apolloClient.mutate({
      mutation: SIGN_UP,
      variables: { email, password },
    });

    if (errors) {
      throw new Error(errors[0].message);
    }

    if (!data || !data.signUp) {
      throw new Error("Sign up failed");
    }

    const { token, user } = data.signUp;

    // Store the token
    useAuthStore.getState().setToken(token);

    // Store user roles
    if (user.roles) {
      useAuthStore.getState().setRoles(user.roles);
    }

    // Store user data
    useAuthStore.getState().setUserData({
      id: user.id,
      email: user.email,
      lastSignInAt: user.lastSignInAt,
      isSuperAdmin: user.isSuperAdmin || false,
    });

    return {
      token,
      user,
    };
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    // Reset the entire store
    useAuthStore.getState().resetStore();

    // Clear Apollo client cache
    await apolloClient.clearStore();

    return true;
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

export function useAuth() {
  const { token, roles } = useAuthStore();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useOfflineSync();

  // Define the initAuth function outside the useEffect
  const initAuth = async () => {
    try {
      // Check if we have a valid token
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch current user data using the token
      const { data } = await apolloClient.query({
        query: GET_ME,
        fetchPolicy: "network-only",
      });

      if (data && data.me) {
        setUser(data.me);

        // Set user data including roles
        setUserData({
          id: data.me.id,
          email: data.me.email,
          roles: data.me.roles || [],
        });

        // Update roles in the store if needed
        if (data.me.roles) {
          useAuthStore.getState().setRoles(data.me.roles);
        }
      } else {
        // Invalid token or user not found
        useAuthStore.getState().clearToken();
        useAuthStore.getState().clearRoles();
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      // Clear invalid token
      useAuthStore.getState().clearToken();
      useAuthStore.getState().clearRoles();
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth on component mount
  useEffect(() => {
    initAuth();
  }, [token]);

  // Re-fetch user data when coming back online
  useEffect(() => {
    if (isOnline && token && !user) {
      initAuth();
    }
  }, [isOnline, token, user]);

  return {
    user,
    userData,
    loading,
    isOnline,
    signIn,
    signUp,
    signOut,
  };
}
