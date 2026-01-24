import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "./base-api";

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  systemUptime: string;
  totalSessions: number;
  failedLogins: number;
}

export interface UserActivityData {
  date: string;
  logins: number;
  registrations: number;
  activeUsers: number;
}

export interface SystemHealthData {
  metric: string;
  value: number;
  status: "good" | "warning" | "critical";
}

export interface UserRole {
  value: string;
  label: string;
}

export interface User {
  id: string;
  email: string;
  is_super_admin: boolean;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  profile?: {
    id: string;
    user_id: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    job_title?: string;
    department?: string;
    phone_number?: string;
    created_at: string;
    updated_at: string;
  };
  assigned_roles: string[];
}

export interface CreateUserRequest {
  email: string;
  password: string;
  is_super_admin?: boolean;
  roles?: string[];
  first_name?: string;
  last_name?: string;
  job_title?: string;
  department?: string;
  phone_number?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  is_super_admin?: boolean;
  roles?: string[];
  first_name?: string;
  last_name?: string;
  job_title?: string;
  department?: string;
  phone_number?: string;
}

export interface AssignRoleRequest {
  role: string;
}

class AdminApiService extends ApiService {
  // Dashboard endpoints
  async getDashboardStats(): Promise<AdminDashboardStats> {
    return this.get<AdminDashboardStats>("/admin/dashboard/stats");
  }

  async getUserActivityData(): Promise<UserActivityData[]> {
    return this.get<UserActivityData[]>("/admin/dashboard/user-activity");
  }

  async getSystemHealthData(): Promise<SystemHealthData[]> {
    return this.get<SystemHealthData[]>("/admin/dashboard/system-health");
  }

  // User management endpoints
  async getUsers(params?: {
    skip?: number;
    limit?: number;
    search?: string;
  }): Promise<User[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined)
      queryParams.append("skip", params.skip.toString());
    if (params?.limit !== undefined)
      queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `/admin/users${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return this.get<User[]>(url);
  }

  async getUserById(userId: string): Promise<User> {
    return this.get<User>(`/admin/users/${userId}`);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return this.post<User>("/admin/users", userData);
  }

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    return this.put<User>(`/admin/users/${userId}`, userData);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.delete(`/admin/users/${userId}`);
  }

  async reactivateUser(userId: string): Promise<User> {
    return this.post<User>(`/admin/users/${userId}/reactivate`, {});
  }

  async assignRole(userId: string, roleData: AssignRoleRequest): Promise<User> {
    return this.post<User>(`/admin/users/${userId}/roles`, roleData);
  }

  async removeRole(userId: string, role: string): Promise<{ message: string }> {
    return this.delete(`/admin/users/${userId}/roles/${role}`);
  }

  async getAvailableRoles(): Promise<UserRole[]> {
    return this.get<UserRole[]>("/admin/roles");
  }
}

export const adminApiService = new AdminApiService();

// React Query hooks for dashboard
export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: () => adminApiService.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useUserActivityData = () => {
  return useQuery({
    queryKey: ["admin", "dashboard", "user-activity"],
    queryFn: () => adminApiService.getUserActivityData(),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useSystemHealthData = () => {
  return useQuery({
    queryKey: ["admin", "dashboard", "system-health"],
    queryFn: () => adminApiService.getSystemHealthData(),
    refetchInterval: 15000, // Refetch every 15 seconds
  });
};

// React Query hooks for user management
export const useUsers = (params?: {
  skip?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminApiService.getUsers(params),
  });
};

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: () => adminApiService.getUserById(userId),
    enabled: !!userId,
  });
};

export const useAvailableRoles = () => {
  return useQuery({
    queryKey: ["admin", "roles"],
    queryFn: () => adminApiService.getAvailableRoles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) =>
      adminApiService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard", "stats"],
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      userData,
    }: {
      userId: string;
      userData: UpdateUserRequest;
    }) => adminApiService.updateUser(userId, userData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "users", variables.userId],
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApiService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard", "stats"],
      });
    },
  });
};

export const useReactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApiService.reactivateUser(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "users", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard", "stats"],
      });
    },
  });
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      roleData,
    }: {
      userId: string;
      roleData: AssignRoleRequest;
    }) => adminApiService.assignRole(userId, roleData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "users", variables.userId],
      });
    },
  });
};

export const useRemoveRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApiService.removeRole(userId, role),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "users", variables.userId],
      });
    },
  });
};
