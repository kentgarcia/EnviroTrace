export type UserRole =
  | "admin"
  | "air-quality"
  | "tree-management"
  | "government-emission";

export interface UserData {
  id: string;
  email: string;
  roles: UserRole[];
}
