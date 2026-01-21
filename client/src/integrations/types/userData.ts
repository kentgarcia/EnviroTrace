export type UserRole =
  | "admin"
  | "urban_greening"
  | "government_emission";

export interface UserData {
  id?: string;
  email?: string;
  roles?: UserRole[];
  assigned_roles?: UserRole[]; // Added to match backend response format
  lastSignInAt?: string;
  last_sign_in_at?: string; // Added to match backend response format
  isSuperAdmin?: boolean;
  is_super_admin?: boolean; // Added to match backend response format
  createdAt?: string;
  created_at?: string; // Added to match backend response format
  updatedAt?: string;
  updated_at?: string; // Added to match backend response format
  profile?: any; // Optional profile data that may be included
}

// Authentication response
export interface AuthResponse {
  token: string;
  user: UserData;
}
