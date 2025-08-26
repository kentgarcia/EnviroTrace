import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../core/api/api-client";
import * as Network from "expo-network";

export interface TreeManagementData {
  totalRequests: number;
  pendingRequests: number;
  completedThisMonth: number;
  totalTreesCut: number;
  totalTreesPruned: number;
  totalComplaints: number;
  pendingSync: number;
  lastRequestDate?: string;
  chartData?: any;
}

export function useTreeManagementData() {
  const [localData, setLocalData] = useState<TreeManagementData>({
    totalRequests: 0,
    pendingRequests: 0,
    completedThisMonth: 0,
    totalTreesCut: 0,
    totalTreesPruned: 0,
    totalComplaints: 0,
    pendingSync: 0,
  });

  // Get local tree management stats (mock data for now)
  const fetchLocalStats = async (): Promise<TreeManagementData> => {
    try {
      // TODO: Replace with actual local database calls when tree management tables are set up
      // For now, using mock data
      return {
        totalRequests: 145,
        pendingRequests: 23,
        completedThisMonth: 18,
        totalTreesCut: 67,
        totalTreesPruned: 124,
        totalComplaints: 15,
        pendingSync: 5,
        lastRequestDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching local tree management stats:", error);
      return {
        totalRequests: 0,
        pendingRequests: 0,
        completedThisMonth: 0,
        totalTreesCut: 0,
        totalTreesPruned: 0,
        totalComplaints: 0,
        pendingSync: 0,
      };
    }
  };

  // Fetch remote tree management dashboard data
  const fetchRemoteStats = async (): Promise<TreeManagementData | null> => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        return null;
      }

      // TODO: Implement actual API call to tree management dashboard endpoint
      // const response = await apiClient.get('/tree-management/dashboard');
      // return response.data;

      console.log(
        "Remote tree management stats fetch not implemented yet, using local data"
      );
      return null;
    } catch (error) {
      console.error("Error fetching remote tree management stats:", error);
      return null;
    }
  };

  // React Query for remote data (with fallback to local)
  const {
    data: remoteData,
    isLoading: isLoadingRemote,
    refetch: refetchRemote,
    error: remoteError,
  } = useQuery({
    queryKey: ["tree-management-dashboard-stats"],
    queryFn: fetchRemoteStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  // Load local data on mount and when dependencies change
  useEffect(() => {
    const loadLocalData = async () => {
      const stats = await fetchLocalStats();
      setLocalData(stats);
    };

    loadLocalData();
  }, []);

  // Combine remote and local data, preferring remote when available
  const data = remoteData || localData;

  const refetch = async () => {
    // Refetch both local and remote data
    const [localStats] = await Promise.all([
      fetchLocalStats(),
      refetchRemote(),
    ]);
    setLocalData(localStats);
  };

  return {
    data,
    loading: isLoadingRemote && !localData.totalRequests, // Show loading only if no local data
    error: remoteError,
    refetch,
    isUsingLocalData: !remoteData,
  };
}
