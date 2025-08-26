import apiClient from "./api-client";

// Types for Air Quality module
export interface AirQualityDriver {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  address: string;
  license_number: string;
  created_at: string;
  updated_at: string;
}

export interface AirQualityRecord {
  id: number;
  plate_number: string;
  vehicle_type: string;
  transport_group?: string;
  operator_company_name: string;
  operator_address?: string;
  owner_first_name?: string;
  owner_middle_name?: string;
  owner_last_name?: string;
  motor_no?: string;
  motor_vehicle_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AirQualityViolation {
  id: number;
  record_id: number;
  ordinance_infraction_report_no?: string;
  smoke_density_test_result_no?: string;
  place_of_apprehension: string;
  date_of_apprehension: string;
  paid_driver: boolean;
  paid_operator: boolean;
  driver_id?: string;
  created_at: string;
  updated_at: string;
  // Joined fields from related tables
  plate_number?: string;
  vehicle_type?: string;
  operator_company_name?: string;
}

export interface AirQualityFee {
  id: number;
  amount: number;
  category: string;
  level: number;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export interface AirQualityOrderOfPayment {
  id: string;
  oop_control_number: string;
  plate_number: string;
  operator_name: string;
  driver_name?: string;
  selected_violations: string;
  testing_officer?: string;
  test_results?: string;
  date_of_testing?: string;
  apprehension_fee: number;
  voluntary_fee: number;
  impound_fee: number;
  driver_amount: number;
  operator_fee: number;
  total_undisclosed_amount: number;
  grand_total_amount: number;
  payment_or_number?: string;
  date_of_payment: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AirQualityDashboard {
  total_records: number;
  total_violations: number;
  total_drivers: number;
  pending_payments: number;
  total_fees: number;
  total_fees_configured: number;
  payment_status_distribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  vehicle_types: Array<{
    vehicle_type: string;
    count: number;
  }>;
  monthly_violations: Array<{
    month: string;
    count: number;
  }>;
  top_violation_locations: Array<{
    location: string;
    count: number;
  }>;
}

class AirQualityService {
  private baseUrl = "/air-quality";

  // Dashboard API
  async fetchDashboard(): Promise<AirQualityDashboard> {
    const response = await apiClient.get(`${this.baseUrl}/dashboard`);
    return response.data;
  }

  // Records API
  async searchRecords(params: {
    q?: string;
    plateNumber?: string;
    operatorName?: string;
    vehicleType?: string;
    limit?: number;
    offset?: number;
  }): Promise<AirQualityRecord[]> {
    const response = await apiClient.get(`${this.baseUrl}/records/search`, {
      params,
    });
    return response.data;
  }

  async fetchRecentRecords(
    params: { limit?: number } = {}
  ): Promise<AirQualityRecord[]> {
    const response = await apiClient.get(`${this.baseUrl}/records`, {
      params: {
        skip: 0,
        limit: params.limit || 10,
      },
    });
    // Return the records array from the response
    return response.data.records || [];
  }

  async getRecord(id: number): Promise<AirQualityRecord> {
    const response = await apiClient.get(`${this.baseUrl}/records/${id}`);
    return response.data;
  }

  async createRecord(
    record: Partial<AirQualityRecord>
  ): Promise<AirQualityRecord> {
    const response = await apiClient.post(`${this.baseUrl}/records`, record);
    return response.data;
  }

  async updateRecord(
    id: number,
    record: Partial<AirQualityRecord>
  ): Promise<AirQualityRecord> {
    const response = await apiClient.put(
      `${this.baseUrl}/records/${id}`,
      record
    );
    return response.data;
  }

  async deleteRecord(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/records/${id}`);
  }

  // Violations API
  async fetchViolations(
    params: {
      recordId?: number;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<AirQualityViolation[]> {
    const response = await apiClient.get(`${this.baseUrl}/violations`, {
      params,
    });
    return response.data;
  }

  async fetchRecentViolations(
    params: { limit?: number } = {}
  ): Promise<AirQualityViolation[]> {
    const response = await apiClient.get(`${this.baseUrl}/violations`, {
      params: {
        skip: 0,
        limit: params.limit || 10,
      },
    });
    // Return the violations array from the response
    return response.data.violations || [];
  }

  async getViolation(id: number): Promise<AirQualityViolation> {
    const response = await apiClient.get(`${this.baseUrl}/violations/${id}`);
    return response.data;
  }

  async createViolation(
    violation: Partial<AirQualityViolation>
  ): Promise<AirQualityViolation> {
    const response = await apiClient.post(
      `${this.baseUrl}/violations`,
      violation
    );
    return response.data;
  }

  async updateViolation(
    id: number,
    violation: Partial<AirQualityViolation>
  ): Promise<AirQualityViolation> {
    const response = await apiClient.put(
      `${this.baseUrl}/violations/${id}`,
      violation
    );
    return response.data;
  }

  async deleteViolation(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/violations/${id}`);
  }

  // Drivers API
  async searchDrivers(params: {
    q?: string;
    firstName?: string;
    lastName?: string;
    licenseNumber?: string;
    limit?: number;
    offset?: number;
  }): Promise<AirQualityDriver[]> {
    const response = await apiClient.get(`${this.baseUrl}/drivers/search`, {
      params,
    });
    return response.data;
  }

  async getDriver(id: string): Promise<AirQualityDriver> {
    const response = await apiClient.get(`${this.baseUrl}/drivers/${id}`);
    return response.data;
  }

  async createDriver(
    driver: Partial<AirQualityDriver>
  ): Promise<AirQualityDriver> {
    const response = await apiClient.post(`${this.baseUrl}/drivers`, driver);
    return response.data;
  }

  async updateDriver(
    id: string,
    driver: Partial<AirQualityDriver>
  ): Promise<AirQualityDriver> {
    const response = await apiClient.put(
      `${this.baseUrl}/drivers/${id}`,
      driver
    );
    return response.data;
  }

  async deleteDriver(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/drivers/${id}`);
  }

  // Fees API
  async fetchFees(): Promise<AirQualityFee[]> {
    const response = await apiClient.get(`${this.baseUrl}/fees`);
    return response.data;
  }

  async getFee(id: number): Promise<AirQualityFee> {
    const response = await apiClient.get(`${this.baseUrl}/fees/${id}`);
    return response.data;
  }

  async createFee(fee: Partial<AirQualityFee>): Promise<AirQualityFee> {
    const response = await apiClient.post(`${this.baseUrl}/fees`, fee);
    return response.data;
  }

  async updateFee(
    id: number,
    fee: Partial<AirQualityFee>
  ): Promise<AirQualityFee> {
    const response = await apiClient.put(`${this.baseUrl}/fees/${id}`, fee);
    return response.data;
  }

  async deleteFee(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/fees/${id}`);
  }

  // Order of Payment API
  async fetchOrdersOfPayment(
    params: {
      plateNumber?: string;
      operatorName?: string;
      status?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<AirQualityOrderOfPayment[]> {
    const response = await apiClient.get(`${this.baseUrl}/orders-of-payment`, {
      params,
    });
    return response.data;
  }

  async getOrderOfPayment(id: string): Promise<AirQualityOrderOfPayment> {
    const response = await apiClient.get(
      `${this.baseUrl}/orders-of-payment/${id}`
    );
    return response.data;
  }

  async createOrderOfPayment(
    order: Partial<AirQualityOrderOfPayment>
  ): Promise<AirQualityOrderOfPayment> {
    const response = await apiClient.post(
      `${this.baseUrl}/orders-of-payment`,
      order
    );
    return response.data;
  }

  async updateOrderOfPayment(
    id: string,
    order: Partial<AirQualityOrderOfPayment>
  ): Promise<AirQualityOrderOfPayment> {
    const response = await apiClient.put(
      `${this.baseUrl}/orders-of-payment/${id}`,
      order
    );
    return response.data;
  }

  async deleteOrderOfPayment(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/orders-of-payment/${id}`);
  }

  // Report APIs
  async generateOffendersReport(
    params: {
      startDate?: string;
      endDate?: string;
      location?: string;
      vehicleType?: string;
    } = {}
  ): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/reports/offenders`, {
      params,
    });
    return response.data;
  }

  async exportReport(reportType: string, params: any = {}): Promise<Blob> {
    const response = await apiClient.get(
      `${this.baseUrl}/reports/export/${reportType}`,
      {
        params,
        responseType: "blob",
      }
    );
    return response.data;
  }
}

export const airQualityService = new AirQualityService();
