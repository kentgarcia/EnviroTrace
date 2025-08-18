import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "emission_local.db";

export interface LocalVehicle {
  id: string;
  driver_name: string;
  contact_number?: string;
  engine_type: string;
  office_id: string;
  office_name?: string;
  plate_number: string;
  vehicle_type: string;
  wheels: number;
  created_at: string;
  updated_at: string;
  latest_test_result?: boolean | null;
  latest_test_date?: string;
  sync_status: "synced" | "pending" | "error";
}

export interface LocalEmissionTest {
  id: string;
  vehicle_id: string;
  test_date: string;
  quarter: number;
  year: number;
  result: boolean | null;
  remarks?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  sync_status: "synced" | "pending" | "error";
}

export interface LocalOffice {
  id: string;
  name: string;
  address?: string;
  contact_number?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  sync_status: "synced" | "pending" | "error";
}

class DatabaseManager {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      console.log("Database opened successfully");

      await this.createTables();
      console.log("Tables created successfully");
    } catch (error) {
      console.error("Database initialization error:", error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    try {
      // Offices table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS offices (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          address TEXT,
          contact_number TEXT,
          email TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          sync_status TEXT DEFAULT 'synced'
        );
      `);

      // Vehicles table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS vehicles (
          id TEXT PRIMARY KEY,
          driver_name TEXT NOT NULL,
          contact_number TEXT,
          engine_type TEXT NOT NULL,
          office_id TEXT NOT NULL,
          office_name TEXT,
          plate_number TEXT NOT NULL UNIQUE,
          vehicle_type TEXT NOT NULL,
          wheels INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          latest_test_result INTEGER,
          latest_test_date TEXT,
          sync_status TEXT DEFAULT 'synced',
          FOREIGN KEY (office_id) REFERENCES offices (id)
        );
      `);

      // Emission tests table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS emission_tests (
          id TEXT PRIMARY KEY,
          vehicle_id TEXT NOT NULL,
          test_date TEXT NOT NULL,
          quarter INTEGER NOT NULL,
          year INTEGER NOT NULL,
          result INTEGER,
          remarks TEXT,
          created_by TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          sync_status TEXT DEFAULT 'synced',
          FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
        );
      `);

      // Create indexes for better performance
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_vehicles_office_id ON vehicles (office_id);
        CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles (plate_number);
        CREATE INDEX IF NOT EXISTS idx_tests_vehicle_id ON emission_tests (vehicle_id);
        CREATE INDEX IF NOT EXISTS idx_tests_year_quarter ON emission_tests (year, quarter);
        CREATE INDEX IF NOT EXISTS idx_sync_status_vehicles ON vehicles (sync_status);
        CREATE INDEX IF NOT EXISTS idx_sync_status_tests ON emission_tests (sync_status);
        CREATE INDEX IF NOT EXISTS idx_sync_status_offices ON offices (sync_status);
      `);

      console.log("All tables and indexes created successfully");
    } catch (error) {
      console.error("Error creating tables:", error);
      throw error;
    }
  }

  // Vehicle operations
  async getVehicles(filters?: {
    office_id?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<LocalVehicle[]> {
    if (!this.db) return [];

    try {
      let query = "SELECT * FROM vehicles";
      const params: any[] = [];
      const conditions: string[] = [];

      if (filters?.office_id) {
        conditions.push("office_id = ?");
        params.push(filters.office_id);
      }

      if (filters?.search) {
        conditions.push("(driver_name LIKE ? OR plate_number LIKE ?)");
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      query += " ORDER BY updated_at DESC";

      if (filters?.limit) {
        query += ` LIMIT ${filters.limit}`;
        if (filters?.offset) {
          query += ` OFFSET ${filters.offset}`;
        }
      }

      const result = await this.db.getAllAsync(query, params);
      return result.map(this.mapVehicleFromDb) as LocalVehicle[];
    } catch (error) {
      console.error("Error getting vehicles:", error);
      return [];
    }
  }

  async getVehicleById(id: string): Promise<LocalVehicle | null> {
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync(
        "SELECT * FROM vehicles WHERE id = ?",
        [id]
      );
      return result ? (this.mapVehicleFromDb(result) as LocalVehicle) : null;
    } catch (error) {
      console.error("Error getting vehicle by id:", error);
      return null;
    }
  }

  async saveVehicle(vehicle: LocalVehicle): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO vehicles (
          id, driver_name, contact_number, engine_type, office_id, office_name,
          plate_number, vehicle_type, wheels, created_at, updated_at,
          latest_test_result, latest_test_date, sync_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vehicle.id,
          vehicle.driver_name,
          vehicle.contact_number || null,
          vehicle.engine_type,
          vehicle.office_id,
          vehicle.office_name || null,
          vehicle.plate_number,
          vehicle.vehicle_type,
          vehicle.wheels,
          vehicle.created_at,
          vehicle.updated_at,
          vehicle.latest_test_result === null
            ? null
            : vehicle.latest_test_result
            ? 1
            : 0,
          vehicle.latest_test_date || null,
          vehicle.sync_status,
        ]
      );
    } catch (error) {
      console.error("Error saving vehicle:", error);
      throw error;
    }
  }

  // Test operations
  async getEmissionTests(filters?: {
    vehicle_id?: string;
    year?: number;
    quarter?: number;
    limit?: number;
    offset?: number;
  }): Promise<LocalEmissionTest[]> {
    if (!this.db) return [];

    try {
      let query = "SELECT * FROM emission_tests";
      const params: any[] = [];
      const conditions: string[] = [];

      if (filters?.vehicle_id) {
        conditions.push("vehicle_id = ?");
        params.push(filters.vehicle_id);
      }

      if (filters?.year) {
        conditions.push("year = ?");
        params.push(filters.year);
      }

      if (filters?.quarter) {
        conditions.push("quarter = ?");
        params.push(filters.quarter);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      query += " ORDER BY test_date DESC";

      if (filters?.limit) {
        query += ` LIMIT ${filters.limit}`;
        if (filters?.offset) {
          query += ` OFFSET ${filters.offset}`;
        }
      }

      const result = await this.db.getAllAsync(query, params);
      return result.map(this.mapTestFromDb) as LocalEmissionTest[];
    } catch (error) {
      console.error("Error getting emission tests:", error);
      return [];
    }
  }

  async saveEmissionTest(test: LocalEmissionTest): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO emission_tests (
          id, vehicle_id, test_date, quarter, year, result, remarks,
          created_by, created_at, updated_at, sync_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          test.id,
          test.vehicle_id,
          test.test_date,
          test.quarter,
          test.year,
          test.result === null ? null : test.result ? 1 : 0,
          test.remarks || null,
          test.created_by || "local",
          test.created_at,
          test.updated_at,
          test.sync_status,
        ]
      );
    } catch (error) {
      console.error("Error saving emission test:", error);
      throw error;
    }
  }

  // Office operations
  async getOffices(): Promise<LocalOffice[]> {
    if (!this.db) return [];

    try {
      const result = await this.db.getAllAsync(
        "SELECT * FROM offices ORDER BY name"
      );
      return result as LocalOffice[];
    } catch (error) {
      console.error("Error getting offices:", error);
      return [];
    }
  }

  async saveOffice(office: LocalOffice): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO offices (
          id, name, address, contact_number, email, created_at, updated_at, sync_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          office.id,
          office.name,
          office.address || null,
          office.contact_number || null,
          office.email || null,
          office.created_at,
          office.updated_at,
          office.sync_status,
        ]
      );
    } catch (error) {
      console.error("Error saving office:", error);
      throw error;
    }
  }

  // Sync operations
  async getPendingSync(): Promise<{
    vehicles: LocalVehicle[];
    tests: LocalEmissionTest[];
    offices: LocalOffice[];
  }> {
    if (!this.db) return { vehicles: [], tests: [], offices: [] };

    try {
      const [vehicles, tests, offices] = await Promise.all([
        this.db.getAllAsync(
          'SELECT * FROM vehicles WHERE sync_status = "pending"'
        ),
        this.db.getAllAsync(
          'SELECT * FROM emission_tests WHERE sync_status = "pending"'
        ),
        this.db.getAllAsync(
          'SELECT * FROM offices WHERE sync_status = "pending"'
        ),
      ]);

      return {
        vehicles: vehicles.map(this.mapVehicleFromDb) as LocalVehicle[],
        tests: tests.map(this.mapTestFromDb) as LocalEmissionTest[],
        offices: offices as LocalOffice[],
      };
    } catch (error) {
      console.error("Error getting pending sync data:", error);
      return { vehicles: [], tests: [], offices: [] };
    }
  }

  async markAsSynced(table: string, id: string): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.runAsync(
        `UPDATE ${table} SET sync_status = 'synced' WHERE id = ?`,
        [id]
      );
    } catch (error) {
      console.error("Error marking as synced:", error);
      throw error;
    }
  }

  async markAsPending(table: string, id: string): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.runAsync(
        `UPDATE ${table} SET sync_status = 'pending' WHERE id = ?`,
        [id]
      );
    } catch (error) {
      console.error("Error marking as pending:", error);
      throw error;
    }
  }

  // Lightweight update for latest test info
  async updateVehicleLatestTestInfo(
    vehicleId: string,
    latestResult: boolean | null,
    latestDate?: string
  ): Promise<void> {
    if (!this.db) return;

    try {
      const now = new Date().toISOString();
      await this.db.runAsync(
        `UPDATE vehicles
         SET latest_test_result = ?, latest_test_date = ?, updated_at = ?
         WHERE id = ?`,
        [
          latestResult === null ? null : latestResult ? 1 : 0,
          latestDate || null,
          now,
          vehicleId,
        ]
      );
    } catch (error) {
      console.error("Error updating vehicle latest test info:", error);
      throw error;
    }
  }

  // Stats for dashboard
  async getDashboardStats(): Promise<{
    totalVehicles: number;
    totalTests: number;
    totalOffices: number;
    pendingSync: number;
  }> {
    if (!this.db)
      return {
        totalVehicles: 0,
        totalTests: 0,
        totalOffices: 0,
        pendingSync: 0,
      };

    try {
      const [vehicleCount, testCount, officeCount, pendingCount] =
        await Promise.all([
          this.db.getFirstAsync("SELECT COUNT(*) as count FROM vehicles"),
          this.db.getFirstAsync("SELECT COUNT(*) as count FROM emission_tests"),
          this.db.getFirstAsync("SELECT COUNT(*) as count FROM offices"),
          this.db.getFirstAsync(`
          SELECT 
            (SELECT COUNT(*) FROM vehicles WHERE sync_status = 'pending') +
            (SELECT COUNT(*) FROM emission_tests WHERE sync_status = 'pending') +
            (SELECT COUNT(*) FROM offices WHERE sync_status = 'pending') as count
        `),
        ]);

      return {
        totalVehicles: (vehicleCount as any)?.count || 0,
        totalTests: (testCount as any)?.count || 0,
        totalOffices: (officeCount as any)?.count || 0,
        pendingSync: (pendingCount as any)?.count || 0,
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return {
        totalVehicles: 0,
        totalTests: 0,
        totalOffices: 0,
        pendingSync: 0,
      };
    }
  }

  // Helper methods to map database rows to typed objects
  private mapVehicleFromDb(row: any): LocalVehicle {
    return {
      ...row,
      latest_test_result:
        row.latest_test_result === null
          ? null
          : Boolean(row.latest_test_result),
    };
  }

  private mapTestFromDb(row: any): LocalEmissionTest {
    return {
      ...row,
      result: row.result === null ? null : Boolean(row.result),
    };
  }

  // Clear all data (for development/testing)
  async clearAllData(): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.execAsync(`
        DELETE FROM emission_tests;
        DELETE FROM vehicles;
        DELETE FROM offices;
      `);
      console.log("All data cleared");
    } catch (error) {
      console.error("Error clearing data:", error);
      throw error;
    }
  }
}

export const database = new DatabaseManager();
