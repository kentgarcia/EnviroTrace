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

export interface AirQualityRecordHistory {
  id: number;
  record_id: number;
  type: string;
  date: string;
  details?: string;
  or_number?: string;
  status: string;
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

// Air Quality Record API functions
export const searchAirQualityRecords = async (params: {
  q?: string; // General search term (searches plate number and operator name)
  plateNumber?: string; // Specific plate number search
  operatorName?: string; // Specific operator name search
  vehicleType?: string;
  limit?: number;
  offset?: number;
}): Promise<AirQualityRecord[]> => {
  try {
    const response = await apiClient.get("/air-quality/records/search", {
      params,
    });
    return response.data.records;
  } catch (error) {
    console.error("Error searching air quality records:", error);
    throw error;
  }
};

export const fetchAirQualityRecordById = async (
  recordId: number
): Promise<AirQualityRecord | null> => {
  try {
    const response = await apiClient.get(`/air-quality/records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching air quality record:", error);
    throw error;
  }
};

export const createAirQualityRecord = async (recordData: {
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
}): Promise<AirQualityRecord> => {
  try {
    const response = await apiClient.post("/air-quality/records", recordData);
    return response.data;
  } catch (error) {
    console.error("Error creating air quality record:", error);
    throw error;
  }
};

export const updateAirQualityRecord = async (
  recordId: number,
  recordData: Partial<{
    plate_number: string;
    vehicle_type: string;
    transport_group: string;
    operator_company_name: string;
    operator_address: string;
    owner_first_name: string;
    owner_middle_name: string;
    owner_last_name: string;
    motor_no: string;
    motor_vehicle_name: string;
  }>
): Promise<AirQualityRecord> => {
  try {
    const response = await apiClient.put(
      `/air-quality/records/${recordId}`,
      recordData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating air quality record:", error);
    throw error;
  }
};

export const deleteAirQualityRecord = async (
  recordId: number
): Promise<void> => {
  try {
    await apiClient.delete(`/air-quality/records/${recordId}`);
  } catch (error) {
    console.error("Error deleting air quality record:", error);
    throw error;
  }
};

// Air Quality Violation API functions
export const fetchAirQualityViolationsByRecordId = async (
  recordId: number
): Promise<AirQualityViolation[]> => {
  try {
    const response = await apiClient.get(
      `/air-quality/records/${recordId}/violations`
    );
    return response.data.violations;
  } catch (error) {
    console.error("Error fetching air quality violations:", error);
    throw error;
  }
};

export const createAirQualityViolation = async (violationData: {
  record_id: number;
  ordinance_infraction_report_no?: string;
  smoke_density_test_result_no?: string;
  place_of_apprehension: string;
  date_of_apprehension: string;
  driver_id?: string;
}): Promise<AirQualityViolation> => {
  try {
    const response = await apiClient.post(
      "/air-quality/violations",
      violationData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating air quality violation:", error);
    throw error;
  }
};

export const updateAirQualityViolation = async (
  violationId: number,
  violationData: {
    ordinance_infraction_report_no?: string;
    smoke_density_test_result_no?: string;
    place_of_apprehension?: string;
    date_of_apprehension?: string;
    driver_id?: string;
  }
): Promise<AirQualityViolation> => {
  try {
    const response = await apiClient.put(
      `/air-quality/violations/${violationId}`,
      violationData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating air quality violation:", error);
    throw error;
  }
};

export const updateAirQualityViolationPaymentStatus = async (
  violationId: number,
  paidDriver: boolean,
  paidOperator: boolean
): Promise<AirQualityViolation> => {
  try {
    const response = await apiClient.put(
      `/air-quality/violations/${violationId}/payment`,
      {
        paid_driver: paidDriver,
        paid_operator: paidOperator,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating violation payment status:", error);
    throw error;
  }
};

export const deleteAirQualityViolation = async (
  violationId: number
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete(
      `/air-quality/violations/${violationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting air quality violation:", error);
    throw error;
  }
};

// Air Quality Driver API functions
export const searchAirQualityDrivers = async (params?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<AirQualityDriver[]> => {
  try {
    const response = await apiClient.get("/air-quality/drivers/search", {
      params,
    });
    return response.data.drivers;
  } catch (error) {
    console.error("Error searching air quality drivers:", error);
    throw error;
  }
};

export const fetchAllAirQualityDrivers = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<AirQualityDriver[]> => {
  try {
    const response = await apiClient.get("/air-quality/drivers", {
      params,
    });
    return response.data.drivers;
  } catch (error) {
    console.error("Error fetching air quality drivers:", error);
    throw error;
  }
};

export const createAirQualityDriver = async (driverData: {
  first_name: string;
  middle_name?: string;
  last_name: string;
  address: string;
  license_number: string;
}): Promise<AirQualityDriver> => {
  try {
    const response = await apiClient.post("/air-quality/drivers", driverData);
    return response.data;
  } catch (error) {
    console.error("Error creating air quality driver:", error);
    throw error;
  }
};

export const updateAirQualityDriver = async (
  driverId: string,
  driverData: Partial<{
    first_name: string;
    middle_name: string;
    last_name: string;
    address: string;
    license_number: string;
  }>
): Promise<AirQualityDriver> => {
  try {
    const response = await apiClient.put(
      `/air-quality/drivers/${driverId}`,
      driverData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating air quality driver:", error);
    throw error;
  }
};

export const deleteAirQualityDriver = async (
  driverId: string
): Promise<void> => {
  try {
    await apiClient.delete(`/air-quality/drivers/${driverId}`);
  } catch (error) {
    console.error("Error deleting air quality driver:", error);
    throw error;
  }
};

export const fetchAirQualityDriverById = async (
  driverId: string
): Promise<AirQualityDriver | null> => {
  try {
    const response = await apiClient.get(`/air-quality/drivers/${driverId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching air quality driver by ID:", error);
    throw error;
  }
};

// Air Quality Fee API functions
export const fetchAirQualityFees = async (): Promise<AirQualityFee[]> => {
  try {
    const response = await apiClient.get("/air-quality/fees");
    return response.data;
  } catch (error) {
    console.error("Error fetching air quality fees:", error);
    throw error;
  }
};

export const createAirQualityFee = async (feeData: {
  amount: number;
  category: string;
  level: number;
  effective_date: string;
}): Promise<AirQualityFee> => {
  try {
    const response = await apiClient.post("/air-quality/fees", feeData);
    return response.data;
  } catch (error) {
    console.error("Error creating air quality fee:", error);
    throw error;
  }
};

// Air Quality Record History API functions
export const fetchAirQualityRecordHistory = async (
  recordId: number
): Promise<AirQualityRecordHistory[]> => {
  try {
    const response = await apiClient.get(
      `/air-quality/records/${recordId}/history`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching air quality record history:", error);
    throw error;
  }
};

// Utility functions for common places of apprehension
export const getCommonPlacesOfApprehension = async (): Promise<string[]> => {
  // This could be made dynamic later by creating an endpoint
  return [
    "EDSA Cubao",
    "Commonwealth Avenue",
    "Katipunan Avenue",
    "Shaw Boulevard",
    "C5 Road",
    "Ortigas Center",
    "Quezon Memorial Circle",
    "Marikina-Infanta Highway",
    "North Luzon Expressway (NLEX)",
    "South Luzon Expressway (SLEX)",
    "Roxas Boulevard",
    "Taft Avenue",
    "España Boulevard",
    "EDSA Kamuning",
    "Ayala Avenue",
  ];
};

// Air Quality Order of Payment API functions
export const searchAirQualityOrdersOfPayment = async (params: {
  search?: string;
  control_number?: string;
  plate_number?: string;
  status?: string;
  created_date?: string;
  limit?: number;
  offset?: number;
}): Promise<AirQualityOrderOfPayment[]> => {
  try {
    const response = await apiClient.get(
      "/air-quality/orders-of-payment/search",
      {
        params,
      }
    );
    return response.data.orders;
  } catch (error) {
    console.error("Error searching air quality orders of payment:", error);
    throw error;
  }
};

export const fetchAirQualityOrderOfPaymentById = async (
  orderId: string
): Promise<AirQualityOrderOfPayment | null> => {
  try {
    const response = await apiClient.get(
      `/air-quality/orders-of-payment/${orderId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching air quality order of payment:", error);
    throw error;
  }
};

export const createAirQualityOrderOfPayment = async (orderData: {
  plate_number: string;
  operator_name: string;
  driver_name?: string;
  selected_violations: string;
  testing_officer?: string;
  test_results?: string;
  date_of_testing?: string;
  apprehension_fee?: number;
  voluntary_fee?: number;
  impound_fee?: number;
  driver_amount?: number;
  operator_fee?: number;
  total_undisclosed_amount: number;
  grand_total_amount: number;
  payment_or_number?: string;
  date_of_payment: string;
  status?: string;
}): Promise<AirQualityOrderOfPayment> => {
  try {
    const response = await apiClient.post(
      "/air-quality/orders-of-payment",
      orderData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating air quality order of payment:", error);
    throw error;
  }
};

export const updateAirQualityOrderOfPayment = async (
  orderId: string,
  orderData: Partial<AirQualityOrderOfPayment>
): Promise<AirQualityOrderOfPayment> => {
  try {
    const response = await apiClient.put(
      `/air-quality/orders-of-payment/${orderId}`,
      orderData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating air quality order of payment:", error);
    throw error;
  }
};

export const deleteAirQualityOrderOfPayment = async (
  orderId: string
): Promise<void> => {
  try {
    await apiClient.delete(`/air-quality/orders-of-payment/${orderId}`);
  } catch (error) {
    console.error("Error deleting air quality order of payment:", error);
    throw error;
  }
};

// Dashboard Types
export interface VehicleTypeStatistic {
  vehicle_type: string;
  count: number;
}

export interface ViolationTrend {
  month: string;
  year: number;
  violation_count: number;
  paid_driver_count: number;
  paid_operator_count: number;
}

export interface LocationStatistic {
  location: string;
  count: number;
}

export interface PaymentStatusStatistic {
  status: string;
  count: number;
  percentage: number;
}

export interface AirQualityDashboard {
  // Summary Statistics
  total_records: number;
  total_violations: number;
  total_drivers: number;
  total_fees_configured: number;

  // Payment Statistics
  paid_violations_driver: number;
  paid_violations_operator: number;
  paid_driver_percentage: number;
  paid_operator_percentage: number;

  // Vehicle Type Breakdown
  vehicle_types: VehicleTypeStatistic[];

  // Violation Trends
  monthly_violations: ViolationTrend[];

  // Location Statistics
  top_violation_locations: LocationStatistic[];

  // Payment Status Distribution
  payment_status_distribution: PaymentStatusStatistic[];

  // Recent Activity (last 30 days)
  recent_violations_count: number;
  recent_records_count: number;
}

// General fetch functions for dashboard
export const fetchAirQualityRecords = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<AirQualityRecord[]> => {
  try {
    const response = await apiClient.get("/air-quality/records", {
      params,
    });
    return response.data.records || response.data;
  } catch (error) {
    console.error("Error fetching air quality records:", error);
    throw error;
  }
};

export const fetchAirQualityViolations = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<AirQualityViolation[]> => {
  try {
    const response = await apiClient.get("/air-quality/violations", {
      params,
    });
    return response.data.violations || response.data;
  } catch (error) {
    console.error("Error fetching air quality violations:", error);
    throw error;
  }
};

// Dashboard API Functions
export const fetchAirQualityDashboard =
  async (): Promise<AirQualityDashboard> => {
    try {
      const response = await apiClient.get("/air-quality/dashboard");
      return response.data;
    } catch (error) {
      console.error("Error fetching air quality dashboard:", error);
      throw error;
    }
  };
