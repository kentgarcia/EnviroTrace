export type UserRole =
  | "admin"
  | "air_quality"
  | "tree_management"
  | "government_emission";

export interface UserData {
  id: string;
  email: string;
  roles: UserRole[];
  lastSignInAt?: string;
  isSuperAdmin?: boolean;
}
