// Profile API service using TanStack Query and Axios
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./api-client";

// Types
export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  bio: string | null;
  jobTitle: string | null;
  department: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileInput {
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  phoneNumber?: string | null;
}

// API Endpoints
const ENDPOINTS = {
  MY_PROFILE: "/profile/me",
};

// Query Hooks

// Get the current user's profile
export function useMyProfile() {
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const { data } = await apiClient.get<Profile>(ENDPOINTS.MY_PROFILE);
      return data;
    },
  });
}

// Mutation Hooks

// Update the current user's profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProfileInput) => {
      const { data } = await apiClient.put<Profile>(
        ENDPOINTS.MY_PROFILE,
        input
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate the profile query
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}
