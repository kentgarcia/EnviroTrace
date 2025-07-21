import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { database } from "../core/database/database";
import apiClient from "../core/api/api-client";
import * as Network from "expo-network";

interface DashboardData {
  totalVehicles: number;
  testedVehicles: number;
  complianceRate: number;
  departments: number;
  pendingSync: number;
  lastTestDate?: string;
  chartData?: any;
}

export function useDashboardData() {
  const [localData, setLocalData] = useState<DashboardData>({
    totalVehicles: 0,
    testedVehicles: 0,
    complianceRate: 0,
    departments: 0,
    pendingSync: 0,
  });

  // Get local dashboard stats
  const fetchLocalStats = async (): Promise<DashboardData> => {
    try {
      const stats = await database.getDashboardStats();
      const vehicles = await database.getVehicles();
      const tests = await database.getEmissionTests();
      const offices = await database.getOffices();

      // Calculate tested vehicles (vehicles with at least one test)
      const vehicleIds = vehicles.map((v) => v.id);
      const testedVehicleIds = new Set(tests.map((t) => t.vehicle_id));
      const testedCount = vehicleIds.filter((id) =>
        testedVehicleIds.has(id)
      ).length;

      // Calculate compliance rate (passed tests / total tests)
      const passedTests = tests.filter((t) => t.result === true).length;
      const totalTests = tests.length;
      const complianceRate =
        totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

      // Get last test date
      const sortedTests = tests.sort(
        (a, b) =>
          new Date(b.test_date).getTime() - new Date(a.test_date).getTime()
      );
      const lastTestDate =
        sortedTests.length > 0 ? sortedTests[0].test_date : undefined;

      return {
        totalVehicles: stats.totalVehicles,
        testedVehicles: testedCount,
        complianceRate,
        departments: stats.totalOffices,
        pendingSync: stats.pendingSync,
        lastTestDate,
      };
    } catch (error) {
      console.error("Error fetching local stats:", error);
      return {
        totalVehicles: 0,
        testedVehicles: 0,
        complianceRate: 0,
        departments: 0,
        pendingSync: 0,
      };
    }
  };

  // Fetch remote dashboard data
  const fetchRemoteStats = async (): Promise<DashboardData | null> => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        return null;
      }

      // This would call your backend dashboard endpoint
      // For now, we'll use local data as fallback
      console.log("Remote stats fetch not implemented yet, using local data");
      return null;
    } catch (error) {
      console.error("Error fetching remote stats:", error);
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
    queryKey: ["dashboard-stats"],
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
    loading: isLoadingRemote && !localData.totalVehicles, // Show loading only if no local data
    error: remoteError,
    refetch,
    isUsingLocalData: !remoteData,
  };
}
