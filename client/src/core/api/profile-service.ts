import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./api-client";

// Types
export interface Profile {
  id: string;
  user_id: string; // From snake_case backend field
  firstName?: string; // Frontend expects camelCase but backend returns snake_case
  lastName?: string;
  first_name?: string; // Backend returns snake_case
  last_name?: string;
  bio: string | null;
  jobTitle?: string | null;
  job_title?: string | null; // Backend returns snake_case
  department: string | null;
  phoneNumber?: string | null;
  phone_number?: string | null; // Backend returns snake_case
  created_at: string; // Snake_case from backend
  updated_at: string;
  createdAt?: string; // Frontend might expect camelCase
  updatedAt?: string;

  // Computed property for backward compatibility
  get fullName(): string;
}

export interface ProfileInput {
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  phoneNumber?: string | null;
  // Don't include snake_case versions in input - we'll convert internally
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
      try {
        const { data } = await apiClient.get<Profile>(ENDPOINTS.MY_PROFILE);

        // Convert snake_case to camelCase for frontend consistency
        const transformedData: Profile = {
          ...data,
          // Map snake_case fields to camelCase equivalents for frontend consistency
          firstName: data.first_name || data.firstName,
          lastName: data.last_name || data.lastName,
          jobTitle: data.job_title || data.jobTitle,
          phoneNumber: data.phone_number || data.phoneNumber,
          createdAt: data.created_at || data.createdAt,
          updatedAt: data.updated_at || data.updatedAt,
        };

        console.log("Profile data received:", transformedData);
        return transformedData;
      } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
    },
  });
}

// Mutation Hooks

// Update the current user's profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProfileInput) => {
      try {
        // Convert camelCase to snake_case for the backend API
        const backendInput = {
          first_name: input.firstName,
          last_name: input.lastName,
          bio: input.bio,
          job_title: input.jobTitle,
          department: input.department,
          phone_number: input.phoneNumber,
        };

        console.log("Sending profile update:", backendInput);

        const { data } = await apiClient.put<Profile>(
          ENDPOINTS.MY_PROFILE,
          backendInput
        );

        // Transform response data back to camelCase
        const transformedData: Profile = {
          ...data,
          firstName: data.first_name || data.firstName,
          lastName: data.last_name || data.lastName,
          jobTitle: data.job_title || data.jobTitle,
          phoneNumber: data.phone_number || data.phoneNumber,
          createdAt: data.created_at || data.createdAt,
          updatedAt: data.updated_at || data.updatedAt,
        };

        return transformedData;
      } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the profile query
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}
