import { gql } from "@apollo/client";
import { apolloClient } from "./apollo-client";

// Define the UserRole type to match the one in AdminUserManagement.tsx
export type UserRole =
  | "admin"
  | "air_quality"
  | "tree_management"
  | "government_emission"
  | "user"
  | "revoked";

// TypeScript interfaces for GraphQL responses
interface UserRoleEntity {
  id?: string;
  role: string;
}

interface UserProfile {
  fullName?: string;
}

interface User {
  id: string;
  email: string;
  lastSignInAt?: string;
  createdAt: string;
  updatedAt?: string;
  roles?: UserRoleEntity[];
  profile?: UserProfile;
}

interface GetUsersResponse {
  users: User[];
}

interface GetUserResponse {
  user: User;
}

interface CreateUserResponse {
  createUser: User;
}

interface AddUserRoleResponse {
  addUserRole: UserRoleEntity;
}

interface DeleteUserResponse {
  deleteUser: boolean;
}

// Query to fetch all users
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      lastSignInAt
      createdAt
      updatedAt
      roles {
        role
      }
    }
  }
`;

// Query to fetch a specific user
export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      lastSignInAt
      createdAt
      updatedAt
      roles {
        role
      }
    }
  }
`;

// Query to fetch user roles
export const GET_USER_ROLES = gql`
  query GetUserRoles($userId: ID!) {
    userRoles(userId: $userId) {
      id
      role
    }
  }
`;

// Mutation to create a new user
export const CREATE_USER = gql`
  mutation CreateUser($email: String!, $password: String!) {
    createUser(email: $email, password: $password) {
      id
      email
      createdAt
    }
  }
`;

// Mutation to add a role to a user
export const ADD_USER_ROLE = gql`
  mutation AddUserRole($userId: ID!, $role: UserRole!) {
    addUserRole(userId: $userId, role: $role) {
      id
      role
    }
  }
`;

// Mutation to remove a role from a user
export const REMOVE_USER_ROLE = gql`
  mutation RemoveUserRole($userId: ID!, $role: UserRole!) {
    removeUserRole(userId: $userId, role: $role)
  }
`;

// Mutation to delete a user
export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

// Helper function to fetch all users
export async function fetchUsers() {
  try {
    const { data } = await apolloClient.query<GetUsersResponse>({
      query: GET_USERS,
      fetchPolicy: "network-only",
    });

    // Function to validate and convert role string to UserRole type
    const validateRole = (role: string): UserRole => {
      const validRoles: UserRole[] = [
        "admin",
        "air_quality",
        "tree_management",
        "government_emission",
        "user",
        "revoked",
      ];
      return validRoles.includes(role as UserRole)
        ? (role as UserRole)
        : "user";
    };

    // Map user roles to the format expected by the component
    return data.users.map((user) => ({
      id: user.id,
      email: user.email,
      full_name: user.profile?.fullName || "N/A",
      role: validateRole(user.roles?.[0]?.role ?? "user"),
      status: "active", // Default status
      created_at: user.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Helper function to create a new user
export async function createUser(
  email: string,
  password: string,
  role: UserRole
) {
  try {
    // First create the user
    const { data } = await apolloClient.mutate<CreateUserResponse>({
      mutation: CREATE_USER,
      variables: { email, password },
    });

    if (!data) {
      throw new Error("No data returned from createUser mutation");
    }

    // Then add the role
    if (role) {
      await apolloClient.mutate<AddUserRoleResponse>({
        mutation: ADD_USER_ROLE,
        variables: { userId: data.createUser.id, role },
      });
    }

    return data.createUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Helper function to update user roles
export async function updateUserRole(
  userId: string,
  oldRole: UserRole | string,
  newRole: UserRole | string
) {
  try {
    // Only update if the role has changed
    if (oldRole !== newRole) {
      // First remove the old role if it exists
      if (oldRole) {
        await apolloClient.mutate({
          mutation: REMOVE_USER_ROLE,
          variables: { userId, role: oldRole },
        });
      }

      // Then add the new role
      if (newRole) {
        await apolloClient.mutate({
          mutation: ADD_USER_ROLE,
          variables: { userId, role: newRole },
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

// Helper function to delete a user
export async function deleteUser(id: string) {
  try {
    const { data } = await apolloClient.mutate<DeleteUserResponse>({
      mutation: DELETE_USER,
      variables: { id },
      update: (cache) => {
        // Update the cache to remove the deleted user
        const existingData = cache.readQuery<GetUsersResponse>({
          query: GET_USERS,
        });
        if (existingData && existingData.users) {
          cache.writeQuery<GetUsersResponse>({
            query: GET_USERS,
            data: {
              users: existingData.users.filter((user) => user.id !== id),
            },
          });
        }
      },
    });

    return data?.deleteUser;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
