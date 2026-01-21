// User API service using TanStack Query and Axios
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./api-client";

// Types
export type UserRole =
  | "admin"
  | "urban_greening"
  | "government_emission"
  | "user"
  | "revoked";

export interface UserRoleEntity {
  id?: string;
  role: UserRole;
  createdAt?: string;
}

export interface UserProfile {
  id?: string;
  userId?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  phoneNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  lastSignInAt?: string;
  createdAt: string;
  updatedAt?: string;
  isSuperAdmin: boolean;
  roles?: UserRoleEntity[];
  profile?: UserProfile;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
}

// API Endpoints
const ENDPOINTS = {
  USERS: "/users",
  USER: (id: string) => `/users/${id}`,
  USER_ROLES: (userId: string) => `/users/${userId}/roles`,
  USER_ROLE: (userId: string, roleId: string) =>
    `/users/${userId}/roles/${roleId}`,
};

// Query Hooks

// Get all users
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>(ENDPOINTS.USERS);
      return data;
    },
  });
}

// Get a specific user
export function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const { data } = await apiClient.get<User>(ENDPOINTS.USER(id));
      return data;
    },
    enabled: !!id,
  });
}

// Get user roles
export function useUserRoles(userId: string) {
  return useQuery({
    queryKey: ["userRoles", userId],
    queryFn: async () => {
      const { data } = await apiClient.get<UserRoleEntity[]>(
        ENDPOINTS.USER_ROLES(userId)
      );
      return data;
    },
    enabled: !!userId,
  });
}

// Mutation Hooks

// Create a new user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const { data } = await apiClient.post<User>(ENDPOINTS.USERS, input);
      return data;
    },
    onSuccess: () => {
      // Invalidate users query
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Add a role to a user
export function useAddUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }) => {
      const { data } = await apiClient.post<UserRoleEntity>(
        ENDPOINTS.USER_ROLES(userId),
        { role }
      );
      return { userId, role: data };
    },
    onSuccess: ({ userId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["userRoles", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Remove a role from a user
export function useRemoveUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      roleId,
    }: {
      userId: string;
      roleId: string;
    }) => {
      await apiClient.delete(ENDPOINTS.USER_ROLE(userId, roleId));
      return { userId, roleId };
    },
    onSuccess: ({ userId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["userRoles", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Delete a user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(ENDPOINTS.USER(id));
      return id;
    },
    onSuccess: () => {
      // Invalidate users query
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Update a user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<Omit<CreateUserInput, "password">>;
    }) => {
      const { data } = await apiClient.put<User>(ENDPOINTS.USER(id), input);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["user", data.id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
