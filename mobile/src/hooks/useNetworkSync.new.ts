/**
 * Enhanced network sync hook using the new sync engine
 */
import { useState, useEffect, useCallback, useRef } from "react";
import * as Network from "expo-network";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  syncEngine,
  SyncResult,
  SyncProgress,
} from "../core/database/sync-engine";

const SYNC_SETTINGS_KEY = "sync_settings";

export interface SyncSettings {
  autoSync: boolean;
  wifiOnly: boolean;
  syncInterval: number; // in minutes
}

export interface SyncState {
  isSyncing: boolean;
  lastSyncTime: string | null;
  lastSyncSuccess: boolean;
  progress?: SyncProgress;
  error?: string;
}

export const useNetworkSync = () => {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSyncTime: null,
    lastSyncSuccess: true,
  });

  const [settings, setSettings] = useState<SyncSettings>({
    autoSync: false,
    wifiOnly: false,
    syncInterval: 15,
  });

  const syncIntervalRef = useRef<NodeJS.Timeout>();

  /**
   * Load sync settings from storage
   */
  const loadSettings = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SYNC_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      }
    } catch (error) {
      console.error("Error loading sync settings:", error);
    }
  }, []);

  /**
   * Save sync settings to storage
   */
  const saveSettings = useCallback(
    async (newSettings: Partial<SyncSettings>) => {
      try {
        const updated = { ...settings, ...newSettings };
        await AsyncStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(updated));
        setSettings(updated);
      } catch (error) {
        console.error("Error saving sync settings:", error);
      }
    },
    [settings]
  );

  /**
   * Check if device should sync based on network and settings
   */
  const shouldSync = useCallback(async (): Promise<boolean> => {
    try {
      const networkState = await Network.getNetworkStateAsync();

      if (
        !networkState.isConnected ||
        networkState.isInternetReachable === false
      ) {
        return false;
      }

      if (
        settings.wifiOnly &&
        networkState.type !== Network.NetworkStateType.WIFI
      ) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking network:", error);
      return false;
    }
  }, [settings.wifiOnly]);

  /**
   * Main sync function
   */
  const syncData = useCallback(async (): Promise<SyncResult> => {
    console.log("🔄 Starting sync...");

    // Check if already syncing
    if (syncState.isSyncing) {
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        failed: 0,
        conflicts: 0,
        errors: ["Sync already in progress"],
      };
    }

    // Check if should sync
    const canSync = await shouldSync();
    if (!canSync) {
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        failed: 0,
        conflicts: 0,
        errors: ["Network conditions not met"],
      };
    }

    setSyncState((prev) => ({ ...prev, isSyncing: true, error: undefined }));

    try {
      // Subscribe to progress updates
      const unsubscribe = syncEngine.onProgress((progress) => {
        setSyncState((prev) => ({ ...prev, progress }));
      });

      // Execute sync
      const result = await syncEngine.sync();

      // Unsubscribe from progress
      unsubscribe();

      // Update state
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        lastSyncSuccess: result.success,
        error: result.errors.length > 0 ? result.errors.join(", ") : undefined,
        progress: undefined,
      }));

      // Save last sync time
      await AsyncStorage.setItem("last_sync_time", new Date().toISOString());

      return result;
    } catch (error: any) {
      console.error("❌ Sync failed:", error);

      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncSuccess: false,
        error: error.message || "Sync failed",
        progress: undefined,
      }));

      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        failed: 0,
        conflicts: 0,
        errors: [error.message || "Sync failed"],
      };
    }
  }, [syncState.isSyncing, shouldSync]);

  /**
   * Setup auto-sync
   */
  useEffect(() => {
    if (!settings.autoSync) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = undefined;
      }
      return;
    }

    // Clear existing interval
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    // Setup new interval
    const intervalMs = settings.syncInterval * 60 * 1000;
    syncIntervalRef.current = setInterval(() => {
      syncData().catch(console.error);
    }, intervalMs);

    // Cleanup
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [settings.autoSync, settings.syncInterval, syncData]);

  /**
   * Load settings and last sync time on mount
   */
  useEffect(() => {
    const init = async () => {
      await loadSettings();

      const lastSync = await AsyncStorage.getItem("last_sync_time");
      if (lastSync) {
        setSyncState((prev) => ({ ...prev, lastSyncTime: lastSync }));
      }
    };

    init();
  }, [loadSettings]);

  return {
    syncData,
    syncState,
    settings,
    saveSettings,
    // Legacy compatibility
    isSyncing: syncState.isSyncing,
    lastSyncTime: syncState.lastSyncTime,
    lastSyncSuccess: syncState.lastSyncSuccess,
  };
};
