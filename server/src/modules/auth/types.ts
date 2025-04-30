export enum UserRole {
  ADMIN = "admin",
  AIR_QUALITY = "air_quality",
  TREE_MANAGEMENT = "tree_management",
  GOVERNMENT_EMISSION = "government_emission",
}

export interface User {
  id: string;
  email: string;
  lastSignInAt?: Date;
  isSuperAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
  encrypted_password?: string;
  roles?: UserRole[];
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface UserRoleEntity {
  id: string;
  userId: string;
  role: UserRole;
  createdAt: Date;
}

export interface AuthContext {
  user?: {
    id: string;
    email: string;
    isSuperAdmin?: boolean;
  } | null;
}
