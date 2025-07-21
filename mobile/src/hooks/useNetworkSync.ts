import { useState, useEffect, useCallback } from "react";
import * as Network from "expo-network";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { database } from "../core/database/database";
import apiClient from "../core/api/api-client";

const LAST_SYNC_KEY = "last_sync_time";

export function useNetworkSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load last sync time on mount
  useEffect(() => {
    const loadLastSyncTime = async () => {
      try {
        const storedTime = await AsyncStorage.getItem(LAST_SYNC_KEY);
        if (storedTime) {
          setLastSyncTime(new Date(storedTime));
        }
      } catch (error) {
        console.error("Error loading last sync time:", error);
      }
    };

    loadLastSyncTime();
  }, []);

  // Check if device is online
  const checkNetworkConnection = async (): Promise<boolean> => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return (
        !!networkState.isConnected && networkState.isInternetReachable !== false
      );
    } catch (error) {
      console.error("Error checking network:", error);
      return false;
    }
  };

  // Sync data from local to remote (upload pending changes)
  const syncToRemote = async () => {
    try {
      const pendingData = await database.getPendingSync();
      let syncCount = 0;

      // Upload pending offices
      for (const office of pendingData.offices) {
        try {
          await apiClient.post("/emission/offices", {
            name: office.name,
            address: office.address,
            contact_number: office.contact_number,
            email: office.email,
          });
          await database.markAsSynced("offices", office.id);
          syncCount++;
        } catch (error) {
          console.error("Error syncing office:", error);
          // Continue with other items
        }
      }

      // Upload pending vehicles
      for (const vehicle of pendingData.vehicles) {
        try {
          await apiClient.post("/emission/vehicles", {
            driver_name: vehicle.driver_name,
            contact_number: vehicle.contact_number,
            engine_type: vehicle.engine_type,
            office_id: vehicle.office_id,
            plate_number: vehicle.plate_number,
            vehicle_type: vehicle.vehicle_type,
            wheels: vehicle.wheels,
          });
          await database.markAsSynced("vehicles", vehicle.id);
          syncCount++;
        } catch (error) {
          console.error("Error syncing vehicle:", error);
          // Continue with other items
        }
      }

      // Upload pending tests
      for (const test of pendingData.tests) {
        try {
          await apiClient.post("/emission/tests", {
            vehicle_id: test.vehicle_id,
            test_date: test.test_date,
            quarter: test.quarter,
            year: test.year,
            result: test.result,
            remarks: test.remarks,
          });
          await database.markAsSynced("emission_tests", test.id);
          syncCount++;
        } catch (error) {
          console.error("Error syncing test:", error);
          // Continue with other items
        }
      }

      console.log(`Synced ${syncCount} items to remote`);
      return syncCount;
    } catch (error) {
      console.error("Error in syncToRemote:", error);
      throw error;
    }
  };

  // Sync data from remote to local (download latest data)
  const syncFromRemote = async () => {
    try {
      let syncCount = 0;

      // Fetch offices
      try {
        const officesResponse = await apiClient.get(
          "/emission/offices?limit=1000"
        );
        const offices = officesResponse.data.offices || [];

        for (const office of offices) {
          await database.saveOffice({
            ...office,
            sync_status: "synced",
          });
          syncCount++;
        }
      } catch (error) {
        console.error("Error fetching offices:", error);
      }

      // Fetch vehicles
      try {
        const vehiclesResponse = await apiClient.get(
          "/emission/vehicles?limit=1000"
        );
        const vehicles = vehiclesResponse.data.vehicles || [];

        for (const vehicle of vehicles) {
          // Get office name for local storage
          const offices = await database.getOffices();
          const office = offices.find((o) => o.id === vehicle.office_id);

          await database.saveVehicle({
            ...vehicle,
            office_name: office?.name,
            sync_status: "synced",
          });
          syncCount++;
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }

      // Fetch tests
      try {
        const testsResponse = await apiClient.get("/emission/tests?limit=1000");
        const tests = testsResponse.data.tests || [];

        for (const test of tests) {
          await database.saveEmissionTest({
            ...test,
            sync_status: "synced",
          });
          syncCount++;
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
      }

      console.log(`Synced ${syncCount} items from remote`);
      return syncCount;
    } catch (error) {
      console.error("Error in syncFromRemote:", error);
      throw error;
    }
  };

  // Main sync function
  const syncData = useCallback(async (): Promise<boolean> => {
    if (isSyncing) {
      console.log("Sync already in progress");
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const isOnline = await checkNetworkConnection();
      if (!isOnline) {
        throw new Error("No internet connection");
      }

      console.log("Starting data synchronization...");

      // First, upload pending changes
      await syncToRemote();

      // Then, download latest data
      await syncFromRemote();

      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      await AsyncStorage.setItem(LAST_SYNC_KEY, now.toISOString());

      console.log("Data synchronization completed successfully");
      return true;
    } catch (error: any) {
      console.error("Sync error:", error);
      setSyncError(error.message || "Sync failed");
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Auto-sync when app comes to foreground (if enough time has passed)
  useEffect(() => {
    const handleAutoSync = async () => {
      if (lastSyncTime) {
        const timeSinceLastSync = Date.now() - lastSyncTime.getTime();
        const fifteenMinutes = 15 * 60 * 1000;

        if (timeSinceLastSync > fifteenMinutes) {
          const isOnline = await checkNetworkConnection();
          if (isOnline) {
            console.log("Auto-syncing due to time elapsed");
            syncData();
          }
        }
      }
    };

    // Check for auto-sync on mount
    handleAutoSync();
  }, [lastSyncTime, syncData]);

  return {
    isSyncing,
    lastSyncTime,
    syncError,
    syncData,
    checkNetworkConnection,
  };
}
