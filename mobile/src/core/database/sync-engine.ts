/**
 * Enhanced Sync Engine
 * Handles bidirectional synchronization with conflict resolution and retry logic
 */

import * as Network from "expo-network";
import {
  syncQueue,
  SyncQueueItem,
  SyncEntityType,
  SyncOperation,
} from "./sync-queue";
import { database } from "./database";
import apiClient from "../api/api-client";

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
}

export interface SyncResult {
  success: boolean;
  uploaded: number;
  downloaded: number;
  failed: number;
  conflicts: number;
  errors: string[];
}

class SyncEngine {
  private isSyncing = false;
  private syncListeners: Array<(progress: SyncProgress) => void> = [];

  /**
   * Check if device has network connectivity
   */
  async isOnline(): Promise<boolean> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return (
        !!networkState.isConnected && networkState.isInternetReachable !== false
      );
    } catch (error) {
      console.error("Error checking network:", error);
      return false;
    }
  }

  /**
   * Subscribe to sync progress updates
   */
  onProgress(callback: (progress: SyncProgress) => void): () => void {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyProgress(progress: SyncProgress): void {
    this.syncListeners.forEach((cb) => cb(progress));
  }

  /**
   * Main synchronization function
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log("Sync already in progress");
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        failed: 0,
        conflicts: 0,
        errors: ["Sync already in progress"],
      };
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: false,
      uploaded: 0,
      downloaded: 0,
      failed: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      // Check connectivity
      const online = await this.isOnline();
      if (!online) {
        result.errors.push("No internet connection");
        return result;
      }

      console.log("🔄 Starting synchronization...");

      // Phase 1: Upload local changes
      console.log("📤 Phase 1: Uploading local changes...");
      const uploadResult = await this.uploadPendingChanges();
      result.uploaded = uploadResult.success;
      result.failed = uploadResult.failed;
      result.conflicts = uploadResult.conflicts;
      result.errors.push(...uploadResult.errors);

      // Phase 2: Download remote changes
      console.log("📥 Phase 2: Downloading remote changes...");
      const downloadResult = await this.downloadRemoteChanges();
      result.downloaded = downloadResult.count;
      result.errors.push(...downloadResult.errors);

      // Phase 3: Cleanup
      console.log("🧹 Phase 3: Cleaning up...");
      await syncQueue.cleanupSyncedItems(7);

      result.success = result.errors.length === 0;
      console.log("✅ Synchronization completed", result);

      return result;
    } catch (error: any) {
      console.error("❌ Sync error:", error);
      result.errors.push(error.message || "Unknown sync error");
      return result;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Upload pending changes to server
   */
  private async uploadPendingChanges(): Promise<{
    success: number;
    failed: number;
    conflicts: number;
    errors: string[];
  }> {
    const stats = {
      success: 0,
      failed: 0,
      conflicts: 0,
      errors: [] as string[],
    };

    try {
      const pendingItems = await syncQueue.getPendingItems(100);
      if (pendingItems.length === 0) {
        console.log("No pending items to upload");
        return stats;
      }

      console.log(`Found ${pendingItems.length} pending items to upload`);

      for (const item of pendingItems) {
        this.notifyProgress({
          total: pendingItems.length,
          completed: stats.success,
          failed: stats.failed,
          current: `Uploading ${item.entity_type} ${item.operation}`,
        });

        try {
          await syncQueue.updateStatus(item.id, "syncing");

          const payload = JSON.parse(item.payload);
          let serverResponse: any = null;

          // Execute the appropriate API call based on entity type and operation
          switch (item.entity_type) {
            case "vehicle":
              serverResponse = await this.syncVehicle(
                item.operation,
                payload,
                item.entity_id
              );
              break;
            case "test":
              serverResponse = await this.syncTest(
                item.operation,
                payload,
                item.entity_id
              );
              break;
            case "office":
              serverResponse = await this.syncOffice(
                item.operation,
                payload,
                item.entity_id
              );
              break;
          }

          // If server returned a different version, check for conflicts
          if (serverResponse && serverResponse.updated_at) {
            const clientTime = new Date(payload.updated_at).getTime();
            const serverTime = new Date(serverResponse.updated_at).getTime();

            if (serverTime > clientTime) {
              // Potential conflict - server has newer data
              console.warn(
                `Conflict detected for ${item.entity_type}:${item.entity_id}`
              );
              await syncQueue.recordConflict(
                item.entity_type,
                item.entity_id,
                payload,
                serverResponse,
                payload.updated_at,
                serverResponse.updated_at
              );
              stats.conflicts++;
            }
          }

          // Mark as synced and update local record
          await syncQueue.updateStatus(item.id, "synced");
          await this.updateLocalRecordAsSynced(
            item.entity_type,
            item.entity_id
          );
          stats.success++;

          console.log(`✓ Synced ${item.entity_type}:${item.entity_id}`);
        } catch (error: any) {
          console.error(
            `✗ Failed to sync ${item.entity_type}:${item.entity_id}:`,
            error
          );

          const errorMsg =
            error.response?.data?.detail || error.message || "Unknown error";
          const payload = JSON.parse(item.payload);

          await syncQueue.updateStatus(item.id, "failed", errorMsg);
          stats.failed++;
          stats.errors.push(
            `${item.entity_type}:${item.entity_id} - ${errorMsg}`
          );

          // If it's a 409 conflict, record it
          if (error.response?.status === 409) {
            const serverData = error.response.data.current;
            if (serverData) {
              await syncQueue.recordConflict(
                item.entity_type,
                item.entity_id,
                payload,
                serverData,
                payload.updated_at,
                serverData.updated_at
              );
              stats.conflicts++;
            }
          }
        }
      }

      return stats;
    } catch (error: any) {
      console.error("Error in uploadPendingChanges:", error);
      stats.errors.push(error.message || "Upload failed");
      return stats;
    }
  }

  /**
   * Sync a vehicle to server
   */
  private async syncVehicle(
    operation: SyncOperation,
    payload: any,
    entityId: string
  ): Promise<any> {
    switch (operation) {
      case "create":
      case "update":
        const response = await apiClient.post("/emission/vehicles", {
          id: entityId,
          driver_name: payload.driver_name,
          contact_number: payload.contact_number,
          engine_type: payload.engine_type,
          office_id: payload.office_id,
          plate_number: payload.plate_number,
          vehicle_type: payload.vehicle_type,
          wheels: payload.wheels,
        });
        return response.data;

      case "delete":
        await apiClient.delete(`/emission/vehicles/${entityId}`);
        return null;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  /**
   * Sync a test to server
   */
  private async syncTest(
    operation: SyncOperation,
    payload: any,
    entityId: string
  ): Promise<any> {
    switch (operation) {
      case "create":
      case "update":
        const response = await apiClient.post("/emission/tests", {
          id: entityId,
          vehicle_id: payload.vehicle_id,
          test_date: payload.test_date,
          quarter: payload.quarter,
          year: payload.year,
          result: payload.result,
          remarks: payload.remarks,
        });
        return response.data;

      case "delete":
        await apiClient.delete(`/emission/tests/${entityId}`);
        return null;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  /**
   * Sync an office to server
   */
  private async syncOffice(
    operation: SyncOperation,
    payload: any,
    entityId: string
  ): Promise<any> {
    switch (operation) {
      case "create":
      case "update":
        const response = await apiClient.post("/emission/offices", {
          id: entityId,
          name: payload.name,
          address: payload.address,
          contact_number: payload.contact_number,
          email: payload.email,
        });
        return response.data;

      case "delete":
        await apiClient.delete(`/emission/offices/${entityId}`);
        return null;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  /**
   * Download remote changes
   */
  private async downloadRemoteChanges(): Promise<{
    count: number;
    errors: string[];
  }> {
    const result = { count: 0, errors: [] as string[] };

    try {
      // Get last sync cursor
      const lastSyncCursor = await syncQueue.getSyncMetadata(
        "last_sync_cursor"
      );
      const lastSyncTime =
        lastSyncCursor?.timestamp || new Date(0).toISOString();

      console.log(`Fetching changes since: ${lastSyncTime}`);

      // Fetch offices
      try {
        const officesResult = await this.downloadOffices(lastSyncTime);
        result.count += officesResult.count;
        result.errors.push(...officesResult.errors);
      } catch (error: any) {
        result.errors.push(`Offices sync failed: ${error.message}`);
      }

      // Fetch vehicles
      try {
        const vehiclesResult = await this.downloadVehicles(lastSyncTime);
        result.count += vehiclesResult.count;
        result.errors.push(...vehiclesResult.errors);
      } catch (error: any) {
        result.errors.push(`Vehicles sync failed: ${error.message}`);
      }

      // Fetch tests
      try {
        const testsResult = await this.downloadTests(lastSyncTime);
        result.count += testsResult.count;
        result.errors.push(...testsResult.errors);
      } catch (error: any) {
        result.errors.push(`Tests sync failed: ${error.message}`);
      }

      // Update last sync cursor
      await syncQueue.setSyncMetadata("last_sync_cursor", {
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error: any) {
      console.error("Error in downloadRemoteChanges:", error);
      result.errors.push(error.message || "Download failed");
      return result;
    }
  }

  /**
   * Download offices from server
   */
  private async downloadOffices(
    since: string
  ): Promise<{ count: number; errors: string[] }> {
    const result = { count: 0, errors: [] as string[] };

    try {
      const response = await apiClient.get(
        `/emission/offices?updated_since=${since}&limit=1000`
      );
      const offices = response.data.offices || response.data || [];

      for (const office of offices) {
        try {
          await database.saveOffice({
            ...office,
            sync_status: "synced",
          });
          result.count++;
        } catch (error: any) {
          result.errors.push(`Office ${office.id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      result.errors.push(`Offices download: ${error.message}`);
    }

    return result;
  }

  /**
   * Download vehicles from server
   */
  private async downloadVehicles(
    since: string
  ): Promise<{ count: number; errors: string[] }> {
    const result = { count: 0, errors: [] as string[] };

    try {
      const response = await apiClient.get(
        `/emission/vehicles?updated_since=${since}&limit=1000`
      );
      const vehicles = response.data.vehicles || response.data || [];

      for (const vehicle of vehicles) {
        try {
          await database.saveVehicle({
            ...vehicle,
            sync_status: "synced",
          });
          result.count++;
        } catch (error: any) {
          result.errors.push(`Vehicle ${vehicle.id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      result.errors.push(`Vehicles download: ${error.message}`);
    }

    return result;
  }

  /**
   * Download tests from server
   */
  private async downloadTests(
    since: string
  ): Promise<{ count: number; errors: string[] }> {
    const result = { count: 0, errors: [] as string[] };

    try {
      const response = await apiClient.get(
        `/emission/tests?updated_since=${since}&limit=1000`
      );
      const tests = response.data.tests || response.data || [];

      for (const test of tests) {
        try {
          await database.saveEmissionTest({
            ...test,
            sync_status: "synced",
          });
          result.count++;
        } catch (error: any) {
          result.errors.push(`Test ${test.id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      result.errors.push(`Tests download: ${error.message}`);
    }

    return result;
  }

  /**
   * Update local record sync status
   */
  private async updateLocalRecordAsSynced(
    entityType: SyncEntityType,
    entityId: string
  ): Promise<void> {
    const tableMap: Record<SyncEntityType, string> = {
      vehicle: "vehicles",
      test: "emission_tests",
      office: "offices",
    };

    const table = tableMap[entityType];
    if (table) {
      await database.markAsSynced(table, entityId);
    }
  }
}

export const syncEngine = new SyncEngine();
