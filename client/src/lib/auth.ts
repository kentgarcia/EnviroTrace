import { gql, useMutation, useQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useAuthStore } from "@/hooks/useAuthStore";
import { UserData, UserRole } from "@/integrations/types/userData";

const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`;

const SIGN_UP = gql`
  mutation SignUp($email: String!, $password: String!, $fullName: String!) {
    signUp(email: $email, password: $password, fullName: $fullName) {
      id
      email
    }
  }
`;

const SIGN_OUT = gql`
  mutation SignOut {
    signOut
  }
`;

const GET_USER_ROLES = gql`
  query GetUserRoles($userId: String!) {
    userRoles(userId: $userId) {
      role
    }
  }
`;

export async function signIn(email: string, password: string) {
  const [signInMutation] = useMutation(SIGN_IN);
  const { data, errors } = await signInMutation({
    variables: { email, password },
  });

  if (errors) {
    throw new Error(errors[0].message);
  }

  return data.signIn;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
) {
  const [signUpMutation] = useMutation(SIGN_UP);
  const { data, errors } = await signUpMutation({
    variables: { email, password, fullName },
  });

  if (errors) {
    throw new Error(errors[0].message);
  }

  return data.signUp;
}

export async function signOut() {
  const [signOutMutation] = useMutation(SIGN_OUT);
  const { errors } = await signOutMutation();

  if (errors) {
    throw new Error(errors[0].message);
  }
}

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const { data, error } = useQuery(GET_USER_ROLES, { variables: { userId } });

  if (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }

  return data.userRoles.map((item: { role: UserRole }) => item.role);
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useOfflineSync();
  const { setRoles, clearRoles } = useAuthStore();

  useEffect(() => {
    // Implement logic to fetch user session from your backend
    // Example: Fetch user session from local storage or a session endpoint
  }, []);

  useEffect(() => {
    if (isOnline && user) {
      fetchUserData(user);
    }
  }, [isOnline, user]);

  const fetchUserData = async (user: any) => {
    try {
      const roles = await getUserRoles(user.id);
      setRoles(roles);
      setUserData({
        id: user.id,
        email: user.email,
        roles: roles,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

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
