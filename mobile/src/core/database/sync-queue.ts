/**
 * Sync Queue System
 * Manages offline operations and queues them for synchronization
 */

import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DATABASE_NAME = "emission_local.db";

export type SyncOperation = "create" | "update" | "delete";
export type SyncEntityType = "vehicle" | "test" | "office";
export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export interface SyncQueueItem {
  id: string;
  entity_type: SyncEntityType;
  entity_id: string;
  operation: SyncOperation;
  payload: string; // JSON-serialized data
  status: SyncStatus;
  retry_count: number;
  last_error?: string;
  created_at: string;
  updated_at: string;
  synced_at?: string;
}

export interface ConflictResolution {
  strategy: "client-wins" | "server-wins" | "merge" | "manual";
  resolved: boolean;
  merged_data?: any;
}

class SyncQueue {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await this.createSyncTables();
      console.log("Sync queue initialized successfully");
    } catch (error) {
      console.error("Sync queue initialization error:", error);
      throw error;
    }
  }

  private async createSyncTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      // Sync queue table for tracking pending operations
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          operation TEXT NOT NULL,
          payload TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          retry_count INTEGER DEFAULT 0,
          last_error TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          synced_at TEXT
        );
      `);

      // Create indexes for performance
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue (status);
        CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue (entity_type, entity_id);
        CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue (created_at);
      `);

      // Conflict resolution table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_conflicts (
          id TEXT PRIMARY KEY,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          client_version TEXT NOT NULL,
          server_version TEXT NOT NULL,
          client_data TEXT NOT NULL,
          server_data TEXT NOT NULL,
          resolution_strategy TEXT,
          resolved INTEGER DEFAULT 0,
          resolved_at TEXT,
          created_at TEXT NOT NULL
        );
      `);

      // Sync metadata table for tracking last successful syncs
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_metadata (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      console.log("Sync tables created successfully");
    } catch (error) {
      console.error("Error creating sync tables:", error);
      throw error;
    }
  }

  /**
   * Enqueue a sync operation
   */
  async enqueue(
    entityType: SyncEntityType,
    entityId: string,
    operation: SyncOperation,
    payload: any
  ): Promise<string> {
    if (!this.db) throw new Error("Database not initialized");

    const id = this.generateId();
    const now = new Date().toISOString();

    try {
      await this.db.runAsync(
        `INSERT INTO sync_queue (
          id, entity_type, entity_id, operation, payload,
          status, retry_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
        [id, entityType, entityId, operation, JSON.stringify(payload), now, now]
      );

      console.log(`Enqueued ${operation} for ${entityType}:${entityId}`);
      return id;
    } catch (error) {
      console.error("Error enqueuing sync operation:", error);
      throw error;
    }
  }

  /**
   * Get pending sync items
   */
  async getPendingItems(limit = 50): Promise<SyncQueueItem[]> {
    if (!this.db) return [];

    try {
      const result = await this.db.getAllAsync(
        `SELECT * FROM sync_queue 
         WHERE status IN ('pending', 'failed') 
         AND retry_count < 5
         ORDER BY created_at ASC
         LIMIT ?`,
        [limit]
      );

      return result as SyncQueueItem[];
    } catch (error) {
      console.error("Error getting pending sync items:", error);
      return [];
    }
  }

  /**
   * Update sync item status
   */
  async updateStatus(
    id: string,
    status: SyncStatus,
    error?: string
  ): Promise<void> {
    if (!this.db) return;

    const now = new Date().toISOString();

    try {
      if (status === "synced") {
        await this.db.runAsync(
          `UPDATE sync_queue 
           SET status = ?, synced_at = ?, updated_at = ?
           WHERE id = ?`,
          [status, now, now, id]
        );
      } else if (status === "failed") {
        await this.db.runAsync(
          `UPDATE sync_queue 
           SET status = ?, retry_count = retry_count + 1, 
               last_error = ?, updated_at = ?
           WHERE id = ?`,
          [status, error || "Unknown error", now, id]
        );
      } else {
        await this.db.runAsync(
          `UPDATE sync_queue 
           SET status = ?, updated_at = ?
           WHERE id = ?`,
          [status, now, id]
        );
      }
    } catch (err) {
      console.error("Error updating sync status:", err);
      throw err;
    }
  }

  /**
   * Remove synced items older than specified days
   */
  async cleanupSyncedItems(daysOld = 7): Promise<number> {
    if (!this.db) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoff = cutoffDate.toISOString();

    try {
      const result = await this.db.runAsync(
        `DELETE FROM sync_queue 
         WHERE status = 'synced' AND synced_at < ?`,
        [cutoff]
      );

      console.log(`Cleaned up ${result.changes} synced items`);
      return result.changes || 0;
    } catch (error) {
      console.error("Error cleaning up synced items:", error);
      return 0;
    }
  }

  /**
   * Get sync statistics
   */
  async getStats(): Promise<{
    pending: number;
    failed: number;
    synced: number;
    total: number;
  }> {
    if (!this.db) return { pending: 0, failed: 0, synced: 0, total: 0 };

    try {
      const result = (await this.db.getFirstAsync(`
        SELECT 
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(CASE WHEN status = 'synced' THEN 1 END) as synced,
          COUNT(*) as total
        FROM sync_queue
      `)) as any;

      return {
        pending: result?.pending || 0,
        failed: result?.failed || 0,
        synced: result?.synced || 0,
        total: result?.total || 0,
      };
    } catch (error) {
      console.error("Error getting sync stats:", error);
      return { pending: 0, failed: 0, synced: 0, total: 0 };
    }
  }

  /**
   * Record a sync conflict for manual resolution
   */
  async recordConflict(
    entityType: SyncEntityType,
    entityId: string,
    clientData: any,
    serverData: any,
    clientVersion: string,
    serverVersion: string
  ): Promise<string> {
    if (!this.db) throw new Error("Database not initialized");

    const id = this.generateId();
    const now = new Date().toISOString();

    try {
      await this.db.runAsync(
        `INSERT INTO sync_conflicts (
          id, entity_type, entity_id,
          client_version, server_version,
          client_data, server_data,
          resolved, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [
          id,
          entityType,
          entityId,
          clientVersion,
          serverVersion,
          JSON.stringify(clientData),
          JSON.stringify(serverData),
          now,
        ]
      );

      console.log(`Recorded conflict for ${entityType}:${entityId}`);
      return id;
    } catch (error) {
      console.error("Error recording conflict:", error);
      throw error;
    }
  }

  /**
   * Get unresolved conflicts
   */
  async getUnresolvedConflicts(): Promise<any[]> {
    if (!this.db) return [];

    try {
      const result = await this.db.getAllAsync(
        `SELECT * FROM sync_conflicts 
         WHERE resolved = 0 
         ORDER BY created_at DESC`
      );

      return result.map((row: any) => ({
        ...row,
        client_data: JSON.parse(row.client_data),
        server_data: JSON.parse(row.server_data),
      }));
    } catch (error) {
      console.error("Error getting unresolved conflicts:", error);
      return [];
    }
  }

  /**
   * Mark conflict as resolved
   */
  async resolveConflict(
    id: string,
    strategy: string,
    resolvedData?: any
  ): Promise<void> {
    if (!this.db) return;

    const now = new Date().toISOString();

    try {
      await this.db.runAsync(
        `UPDATE sync_conflicts 
         SET resolved = 1, resolution_strategy = ?, resolved_at = ?
         WHERE id = ?`,
        [strategy, now, id]
      );

      console.log(`Resolved conflict ${id} with strategy: ${strategy}`);
    } catch (error) {
      console.error("Error resolving conflict:", error);
      throw error;
    }
  }

  /**
   * Store sync metadata (e.g., last sync time, cursors)
   */
  async setSyncMetadata(key: string, value: any): Promise<void> {
    if (!this.db) return;

    const now = new Date().toISOString();

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
         VALUES (?, ?, ?)`,
        [key, JSON.stringify(value), now]
      );
    } catch (error) {
      console.error("Error setting sync metadata:", error);
      throw error;
    }
  }

  /**
   * Get sync metadata
   */
  async getSyncMetadata(key: string): Promise<any | null> {
    if (!this.db) return null;

    try {
      const result = (await this.db.getFirstAsync(
        `SELECT value FROM sync_metadata WHERE key = ?`,
        [key]
      )) as any;

      return result ? JSON.parse(result.value) : null;
    } catch (error) {
      console.error("Error getting sync metadata:", error);
      return null;
    }
  }

  /**
   * Clear all failed items (for manual cleanup)
   */
  async clearFailedItems(): Promise<number> {
    if (!this.db) return 0;

    try {
      const result = await this.db.runAsync(
        `DELETE FROM sync_queue WHERE status = 'failed'`
      );

      console.log(`Cleared ${result.changes} failed items`);
      return result.changes || 0;
    } catch (error) {
      console.error("Error clearing failed items:", error);
      return 0;
    }
  }

  private generateId(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export const syncQueue = new SyncQueue();
