import apiClient from "./api-client";

// Types for Vehicle/Emission module
export interface Office {
  id: string;
  name: string;
  address?: string;
  contact_number?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  driver_name: string;
  contact_number?: string;
  engine_type: string;
  office_id: string;
  office?: Office;
  plate_number: string;
  vehicle_type: string;
  wheels: number;
  created_at: string;
  updated_at: string;
  latest_test_result?: boolean | null;
  latest_test_date?: string | null;
}

export interface VehicleFilters {
  plate_number?: string;
  driver_name?: string;
  office_name?: string;
  office_id?: string;
  vehicle_type?: string;
  engine_type?: string;
  wheels?: number;
  search?: string;
}

interface VehiclesResponse {
  vehicles: Vehicle[];
  total: number;
}

interface OfficesResponse {
  offices: Office[];
  total: number;
}

export interface Test {
  id: string;
  vehicle_id: string;
  test_date: string;
  result: boolean;
  tester_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface TestsResponse {
  tests: Test[];
  total: number;
}

class VehicleService {
  private baseUrl = "/emission";

  // Offices API
  async getOffices(
    params: {
      search?: string;
      skip?: number;
      limit?: number;
    } = {}
  ): Promise<OfficesResponse> {
    const response = await apiClient.get(`${this.baseUrl}/offices`, {
      params: {
        skip: params.skip || 0,
        limit: params.limit || 100,
        search: params.search,
      },
    });
    return response.data;
  }

  async getOffice(id: string): Promise<Office> {
    const response = await apiClient.get(`${this.baseUrl}/offices/${id}`);
    return response.data;
  }

  // Vehicles API
  async getVehicles(
    filters?: VehicleFilters,
    skip = 0,
    limit = 100
  ): Promise<VehiclesResponse> {
    const params: any = {
      skip,
      limit,
      ...filters,
    };

    // Remove undefined/null values
    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined ||
          params[key] === null ||
          params[key] === "") &&
        delete params[key]
    );

    const response = await apiClient.get(`${this.baseUrl}/vehicles`, {
      params,
    });
    return response.data;
  }

  async getRecentVehicles(params: { limit?: number } = {}): Promise<Vehicle[]> {
    const response = await this.getVehicles(undefined, 0, params.limit || 10);
    return response.vehicles;
  }

  async getVehicle(id: string): Promise<Vehicle> {
    const response = await apiClient.get(`${this.baseUrl}/vehicles/${id}`);
    return response.data;
  }

  async searchVehicles(searchTerm: string, limit = 20): Promise<Vehicle[]> {
    const response = await this.getVehicles({ search: searchTerm }, 0, limit);
    return response.vehicles;
  }

  // Tests API
  async getTests(
    vehicleId?: string,
    skip = 0,
    limit = 100
  ): Promise<TestsResponse> {
    const params: any = {
      skip,
      limit,
    };

    if (vehicleId) {
      params.vehicle_id = vehicleId;
    }

    const response = await apiClient.get(`${this.baseUrl}/tests`, {
      params,
    });
    return response.data;
  }

  async getRecentTests(params: { limit?: number } = {}): Promise<Test[]> {
    const response = await this.getTests(undefined, 0, params.limit || 10);
    return response.tests;
  }

  async getVehicleTests(vehicleId: string, limit = 10): Promise<Test[]> {
    const response = await this.getTests(vehicleId, 0, limit);
    return response.tests;
  }

  async getTest(id: string): Promise<Test> {
    const response = await apiClient.get(`${this.baseUrl}/tests/${id}`);
    return response.data;
  }

  // Statistics
  async getVehicleStats(): Promise<{
    total_vehicles: number;
    total_offices: number;
    total_tests: number;
    passed_tests: number;
    failed_tests: number;
    pass_rate: number;
  }> {
    // Fetch basic data to calculate stats
    const [vehiclesData, officesData, testsData] = await Promise.all([
      this.getVehicles(undefined, 0, 1),
      this.getOffices({ limit: 1 }),
      this.getTests(undefined, 0, 1000), // Get more tests for accurate stats
    ]);

    const passedTests = testsData.tests.filter((t) => t.result === true).length;
    const failedTests = testsData.tests.filter(
      (t) => t.result === false
    ).length;
    const totalTests = testsData.tests.length;

    return {
      total_vehicles: vehiclesData.total,
      total_offices: officesData.total,
      total_tests: totalTests,
      passed_tests: passedTests,
      failed_tests: failedTests,
      pass_rate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
    };
  }
}

export const vehicleService = new VehicleService();
