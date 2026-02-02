// Session management API service
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "./base-api";

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_type: "mobile" | "desktop" | "tablet" | "unknown";
  device_name?: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  created_at: string;
  last_activity_at?: string;
  expires_at: string;
  ended_at?: string;
  termination_reason?: string;
  user_email?: string;
  user_profile?: {
    first_name?: string;
    last_name?: string;
  };
}

export interface TerminateSessionRequest {
  session_id: string;
  reason?: string;
}

class SessionApiService extends ApiService {
  // Get all sessions
  async getAllSessions(params?: {
    skip?: number;
    limit?: number;
    device_type?: string;
    is_active?: boolean;
  }): Promise<UserSession[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined)
      queryParams.append("skip", params.skip.toString());
    if (params?.limit !== undefined)
      queryParams.append("limit", params.limit.toString());
    if (params?.device_type)
      queryParams.append("device_type", params.device_type);
    if (params?.is_active !== undefined)
      queryParams.append("is_active", params.is_active.toString());

    const url = `/admin/sessions${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return this.get<UserSession[]>(url);
  }

  // Get sessions for a specific user
  async getUserSessions(
    userId: string,
    activeOnly: boolean = false,
    deviceType?: string
  ): Promise<UserSession[]> {
    const queryParams = new URLSearchParams();
    if (activeOnly) queryParams.append("active_only", "true");
    if (deviceType) queryParams.append("device_type", deviceType);

    const url = `/admin/sessions/user/${userId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return this.get<UserSession[]>(url);
  }

  // Terminate a session
  async terminateSession(
    request: TerminateSessionRequest
  ): Promise<UserSession> {
    return this.post<UserSession>("/admin/sessions/terminate", request);
  }

  // Terminate all sessions for a user
  async terminateAllUserSessions(
    userId: string,
    reason: string = "All sessions terminated by admin"
  ): Promise<{ message: string; count: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append("reason", reason);

    return this.post<{ message: string; count: number }>(
      `/admin/sessions/terminate-all/${userId}?${queryParams.toString()}`,
      {}
    );
  }

  // Get my sessions
  async getMySessions(): Promise<UserSession[]> {
    return this.get<UserSession[]>("/admin/sessions/me");
  }
}

export const sessionApiService = new SessionApiService();

// React Query hooks
export const useAllSessions = (params?: {
  skip?: number;
  limit?: number;
  device_type?: string;
  is_active?: boolean;
}) => {
  return useQuery({
    queryKey: ["admin", "sessions", params],
    queryFn: () => sessionApiService.getAllSessions(params),
    staleTime: 60 * 1000, // 1 minute - sessions don't change that rapidly
  });
};

export const useUserSessions = (
  userId: string,
  activeOnly: boolean = false,
  deviceType?: string
) => {
  return useQuery({
    queryKey: ["admin", "user-sessions", userId, activeOnly, deviceType],
    queryFn: () =>
      sessionApiService.getUserSessions(userId, activeOnly, deviceType),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute cache
  });
};

export const useTerminateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TerminateSessionRequest) =>
      sessionApiService.terminateSession(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user-sessions"] });
    },
  });
};

export const useTerminateAllUserSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      sessionApiService.terminateAllUserSessions(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user-sessions"] });
    },
  });
};

export const useMySessions = () => {
  return useQuery({
    queryKey: ["sessions", "me"],
    queryFn: () => sessionApiService.getMySessions(),
    staleTime: 60 * 1000, // 1 minute cache
  });
};
