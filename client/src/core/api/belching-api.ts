import apiClient from "./api-client";

export interface Driver {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  address: string;
  license_number: string;
  created_at: string;
  updated_at: string;
}

export interface Record {
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
  violations?: Violation[];
}

export interface Violation {
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
  driver?: Driver;
  record?: Record;
}

export interface Fee {
  id: number;
  amount: number;
  category: string;
  level: number;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export interface OrderOfPayment {
  id: string;
  control_number: string;
  plate_number: string;
  operator_name: string;
  driver_name?: string;
  admin_created_by: string;
  status: "draft" | "pending" | "paid" | "cancelled";

  // Request Information
  oop_control_number: string;

  // Testing Information
  testing_officer?: string;
  test_results?: string;
  date_of_testing?: string;

  // Selected violations
  selected_violations: string[]; // violation IDs

  // Payment fees
  apprehension_fee?: number;
  voluntary_fee?: number;
  impound_fee?: number;
  driver_amount?: number;
  operator_fee?: number;

  // Totals
  total_undisclosed_amount: number;
  grand_total_amount: number;
  date_of_payment?: string;

  created_at: string;
  updated_at: string;
}

export interface PaymentChecklist {
  apprehension_fee: { checked: boolean; amount: number };
  voluntary_fee: { checked: boolean; amount: number };
  impound_fee: { checked: boolean; amount: number };
  driver_amount: { checked: boolean; amount: number };
  operator_fee: { checked: boolean; amount: number };
}

export interface BelchingStatistics {
  total_records: number;
  total_violations: number;
  total_drivers: number;
  total_fees_collected: number;
  recent_violations: number;
  pending_payments: number;
  vehicle_type_breakdown: Array<{
    vehicle_type: string;
    count: number;
  }>;
  violation_status_breakdown: Array<{
    status: string;
    count: number;
  }>;
  monthly_violations: Array<{
    month: string;
    count: number;
  }>;
}

export interface BelchingDashboardData {
  violations_monthly: Array<{
    label: string;
    total: number;
  }>;
  vehicle_type_data: Array<{
    id: string;
    label: string;
    value: number;
  }>;
  payment_status_data: Array<{
    id: string;
    label: string;
    value: number;
  }>;
  location_data: Array<{
    id: string;
    label: string;
    value: number;
  }>;
}

// Mock API functions - these would be replaced with actual backend calls
export const fetchBelchingStatistics =
  async (): Promise<BelchingStatistics> => {
    // Mock data for now
    return {
      total_records: 1250,
      total_violations: 890,
      total_drivers: 1100,
      total_fees_collected: 450000,
      recent_violations: 45,
      pending_payments: 120,
      vehicle_type_breakdown: [
        { vehicle_type: "Bus", count: 320 },
        { vehicle_type: "Truck", count: 280 },
        { vehicle_type: "Jeepney", count: 190 },
        { vehicle_type: "Taxi", count: 160 },
        { vehicle_type: "Private", count: 300 },
      ],
      violation_status_breakdown: [
        { status: "Paid Driver", count: 350 },
        { status: "Paid Operator", count: 300 },
        { status: "Pending", count: 240 },
      ],
      monthly_violations: [
        { month: "Jan", count: 78 },
        { month: "Feb", count: 65 },
        { month: "Mar", count: 89 },
        { month: "Apr", count: 72 },
        { month: "May", count: 94 },
        { month: "Jun", count: 81 },
        { month: "Jul", count: 88 },
        { month: "Aug", count: 76 },
      ],
    };
  };

export const fetchBelchingRecords = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<Record[]> => {
  // Mock data for now
  const mockRecords: Record[] = [
    {
      id: 1,
      plate_number: "ABC-123",
      vehicle_type: "Bus",
      transport_group: "Metro Transit",
      operator_company_name: "City Bus Lines",
      operator_address: "123 Main St, City",
      owner_first_name: "John",
      owner_last_name: "Doe",
      motor_no: "ENG123456",
      motor_vehicle_name: "Hyundai County",
      created_at: "2024-01-15T08:30:00Z",
      updated_at: "2024-01-15T08:30:00Z",
    },
    {
      id: 2,
      plate_number: "XYZ-789",
      vehicle_type: "Jeepney",
      operator_company_name: "Local Transport Coop",
      owner_first_name: "Maria",
      owner_last_name: "Santos",
      motor_no: "ENG789012",
      motor_vehicle_name: "Isuzu Elf",
      created_at: "2024-01-16T09:15:00Z",
      updated_at: "2024-01-16T09:15:00Z",
    },
  ];

  return mockRecords.slice(0, params?.limit || 10);
};

export const fetchBelchingViolations = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<Violation[]> => {
  // Mock data for now
  const mockViolations: Violation[] = [
    {
      id: 1,
      record_id: 1,
      ordinance_infraction_report_no: "OIR-2024-001",
      smoke_density_test_result_no: "SDT-2024-001",
      place_of_apprehension: "EDSA Cubao",
      date_of_apprehension: "2024-08-15",
      paid_driver: false,
      paid_operator: true,
      created_at: "2024-08-15T10:30:00Z",
      updated_at: "2024-08-15T10:30:00Z",
    },
    {
      id: 2,
      record_id: 2,
      ordinance_infraction_report_no: "OIR-2024-002",
      place_of_apprehension: "Commonwealth Ave",
      date_of_apprehension: "2024-08-16",
      paid_driver: true,
      paid_operator: false,
      created_at: "2024-08-16T14:20:00Z",
      updated_at: "2024-08-16T14:20:00Z",
    },
  ];

  return mockViolations.slice(0, params?.limit || 10);
};

export const fetchBelchingDashboard =
  async (): Promise<BelchingDashboardData> => {
    return {
      violations_monthly: [
        { label: "January", total: 78 },
        { label: "February", total: 65 },
        { label: "March", total: 89 },
        { label: "April", total: 72 },
        { label: "May", total: 94 },
        { label: "June", total: 81 },
        { label: "July", total: 88 },
        { label: "August", total: 76 },
      ],
      vehicle_type_data: [
        { id: "bus", label: "Bus", value: 320 },
        { id: "truck", label: "Truck", value: 280 },
        { id: "jeepney", label: "Jeepney", value: 190 },
        { id: "taxi", label: "Taxi", value: 160 },
        { id: "private", label: "Private", value: 300 },
      ],
      payment_status_data: [
        { id: "paid_driver", label: "Driver Paid", value: 350 },
        { id: "paid_operator", label: "Operator Paid", value: 300 },
        { id: "pending", label: "Pending Payment", value: 240 },
      ],
      location_data: [
        { id: "edsa", label: "EDSA", value: 180 },
        { id: "commonwealth", label: "Commonwealth", value: 150 },
        { id: "quezon_ave", label: "Quezon Avenue", value: 120 },
        { id: "katipunan", label: "Katipunan", value: 90 },
        { id: "others", label: "Others", value: 350 },
      ],
    };
  };

// Enhanced search function for smoke belcher management
export const searchBelchingRecords = async (params: {
  plateNumber?: string;
  operatorName?: string;
  vehicleType?: string;
  limit?: number;
  offset?: number;
}): Promise<Record[]> => {
  // Enhanced mock search with filtering
  const allMockRecords: Record[] = [
    {
      id: 1,
      plate_number: "ABC-123",
      vehicle_type: "Bus",
      transport_group: "Metro Transit",
      operator_company_name: "City Bus Lines",
      operator_address: "123 Main St, Quezon City",
      owner_first_name: "John",
      owner_middle_name: "Miguel",
      owner_last_name: "Doe",
      motor_no: "ENG123456",
      motor_vehicle_name: "Hyundai County",
      created_at: "2024-01-15T08:30:00Z",
      updated_at: "2024-01-15T08:30:00Z",
    },
    {
      id: 2,
      plate_number: "XYZ-789",
      vehicle_type: "Jeepney",
      transport_group: "Quezon Ave TODA",
      operator_company_name: "Local Transport Coop",
      operator_address: "789 Quezon Ave, Quezon City",
      owner_first_name: "Maria",
      owner_middle_name: "Cruz",
      owner_last_name: "Santos",
      motor_no: "ENG789012",
      motor_vehicle_name: "Isuzu Elf",
      created_at: "2024-01-16T09:15:00Z",
      updated_at: "2024-01-16T09:15:00Z",
    },
    {
      id: 3,
      plate_number: "DEF-456",
      vehicle_type: "Truck",
      transport_group: "Freight Alliance",
      operator_company_name: "Freight Express Inc",
      operator_address: "456 Industrial Ave, Marikina City",
      owner_first_name: "Carlos",
      owner_middle_name: "Antonio",
      owner_last_name: "Reyes",
      motor_no: "ENG456789",
      motor_vehicle_name: "Mitsubishi Fuso",
      created_at: "2024-02-01T10:00:00Z",
      updated_at: "2024-02-01T10:00:00Z",
    },
    {
      id: 4,
      plate_number: "GHI-101",
      vehicle_type: "Taxi",
      transport_group: "Manila Taxi Corp",
      operator_company_name: "Yellow Cab Philippines",
      operator_address: "101 EDSA, Mandaluyong City",
      owner_first_name: "Roberto",
      owner_middle_name: "dela",
      owner_last_name: "Cruz",
      motor_no: "ENG101112",
      motor_vehicle_name: "Toyota Vios",
      created_at: "2024-02-10T11:20:00Z",
      updated_at: "2024-02-10T11:20:00Z",
    },
    {
      id: 5,
      plate_number: "JKL-202",
      vehicle_type: "Private",
      operator_company_name: "Personal Vehicle",
      operator_address: "202 Katipunan Ave, Quezon City",
      owner_first_name: "Ana",
      owner_middle_name: "Rosa",
      owner_last_name: "Garcia",
      motor_no: "ENG202303",
      motor_vehicle_name: "Honda Civic",
      created_at: "2024-02-15T14:30:00Z",
      updated_at: "2024-02-15T14:30:00Z",
    },
    {
      id: 6,
      plate_number: "MNO-333",
      vehicle_type: "UV Express",
      transport_group: "Commonwealth Express",
      operator_company_name: "North Express Transport",
      operator_address: "333 Commonwealth Ave, Quezon City",
      owner_first_name: "Pedro",
      owner_middle_name: "Jose",
      owner_last_name: "Mendoza",
      motor_no: "ENG333444",
      motor_vehicle_name: "Toyota Hiace",
      created_at: "2024-02-20T16:45:00Z",
      updated_at: "2024-02-20T16:45:00Z",
    },
    {
      id: 7,
      plate_number: "PQR-444",
      vehicle_type: "Bus",
      transport_group: "Victory Liner",
      operator_company_name: "Victory Liner Inc",
      operator_address: "444 EDSA, Cubao, Quezon City",
      owner_first_name: "Vicente",
      owner_middle_name: "Lopez",
      owner_last_name: "Rivera",
      motor_no: "ENG444555",
      motor_vehicle_name: "Daewoo BH120F",
      created_at: "2024-03-01T09:00:00Z",
      updated_at: "2024-03-01T09:00:00Z",
    },
    {
      id: 8,
      plate_number: "STU-555",
      vehicle_type: "Tricycle",
      transport_group: "Barangay Tricycle Operators",
      operator_company_name: "Tricycle Operators Association",
      operator_address: "555 Local St, Quezon City",
      owner_first_name: "Miguel",
      owner_middle_name: "Santos",
      owner_last_name: "Villanueva",
      motor_no: "ENG555666",
      motor_vehicle_name: "Honda TMX 155",
      created_at: "2024-03-05T12:15:00Z",
      updated_at: "2024-03-05T12:15:00Z",
    },
    {
      id: 9,
      plate_number: "VWX-666",
      vehicle_type: "Motorcycle",
      operator_company_name: "Delivery Services Corp",
      operator_address: "666 Delivery Hub, Pasig City",
      owner_first_name: "Jose",
      owner_middle_name: "Manuel",
      owner_last_name: "Aquino",
      motor_no: "ENG666777",
      motor_vehicle_name: "Yamaha Mio",
      created_at: "2024-03-10T13:30:00Z",
      updated_at: "2024-03-10T13:30:00Z",
    },
    {
      id: 10,
      plate_number: "YZA-777",
      vehicle_type: "Truck",
      transport_group: "Metro Cargo",
      operator_company_name: "Metro Cargo Express",
      operator_address: "777 Cargo Complex, Valenzuela City",
      owner_first_name: "Antonio",
      owner_middle_name: "Francisco",
      owner_last_name: "Ramos",
      motor_no: "ENG777888",
      motor_vehicle_name: "Isuzu Forward",
      created_at: "2024-03-15T15:45:00Z",
      updated_at: "2024-03-15T15:45:00Z",
    },
  ];

  // Apply filters
  let filteredRecords = allMockRecords;

  // Handle combined search (when both plateNumber and operatorName are the same)
  if (
    params.plateNumber &&
    params.operatorName &&
    params.plateNumber === params.operatorName
  ) {
    const searchTerm = params.plateNumber.toLowerCase();
    filteredRecords = filteredRecords.filter(
      (record) =>
        record.plate_number.toLowerCase().includes(searchTerm) ||
        record.operator_company_name.toLowerCase().includes(searchTerm)
    );
  } else {
    // Handle individual filters
    if (params.plateNumber) {
      filteredRecords = filteredRecords.filter((record) =>
        record.plate_number
          .toLowerCase()
          .includes(params.plateNumber!.toLowerCase())
      );
    }

    if (params.operatorName) {
      filteredRecords = filteredRecords.filter((record) =>
        record.operator_company_name
          .toLowerCase()
          .includes(params.operatorName!.toLowerCase())
      );
    }
  }

  if (params.vehicleType) {
    filteredRecords = filteredRecords.filter(
      (record) => record.vehicle_type === params.vehicleType
    );
  }

  return filteredRecords.slice(0, params.limit || 20);
};

// Get violations by record ID
export const fetchViolationsByRecordId = async (
  recordId: number
): Promise<Violation[]> => {
  // Mock violations for specific record
  const mockViolationsByRecord: { [key: number]: Violation[] } = {
    1: [
      {
        id: 1,
        record_id: 1,
        ordinance_infraction_report_no: "OIR-2024-001",
        smoke_density_test_result_no: "SDT-2024-001",
        place_of_apprehension: "EDSA Cubao",
        date_of_apprehension: "2024-08-15",
        paid_driver: false,
        paid_operator: true,
        created_at: "2024-08-15T10:30:00Z",
        updated_at: "2024-08-15T10:30:00Z",
      },
      {
        id: 2,
        record_id: 1,
        ordinance_infraction_report_no: "OIR-2024-005",
        smoke_density_test_result_no: "SDT-2024-005",
        place_of_apprehension: "Commonwealth Ave",
        date_of_apprehension: "2024-07-20",
        paid_driver: true,
        paid_operator: true,
        created_at: "2024-07-20T14:20:00Z",
        updated_at: "2024-07-20T14:20:00Z",
      },
    ],
    2: [
      {
        id: 3,
        record_id: 2,
        ordinance_infraction_report_no: "OIR-2024-003",
        smoke_density_test_result_no: "SDT-2024-003",
        place_of_apprehension: "Katipunan Ave",
        date_of_apprehension: "2024-08-10",
        paid_driver: false,
        paid_operator: false,
        created_at: "2024-08-10T11:45:00Z",
        updated_at: "2024-08-10T11:45:00Z",
      },
    ],
    3: [
      {
        id: 4,
        record_id: 3,
        ordinance_infraction_report_no: "OIR-2024-010",
        smoke_density_test_result_no: "SDT-2024-010",
        place_of_apprehension: "C5 Road",
        date_of_apprehension: "2024-08-05",
        paid_driver: true,
        paid_operator: false,
        created_at: "2024-08-05T09:30:00Z",
        updated_at: "2024-08-05T09:30:00Z",
      },
      {
        id: 5,
        record_id: 3,
        ordinance_infraction_report_no: "OIR-2024-015",
        place_of_apprehension: "Marikina-Infanta Highway",
        date_of_apprehension: "2024-06-12",
        paid_driver: true,
        paid_operator: true,
        created_at: "2024-06-12T16:00:00Z",
        updated_at: "2024-06-12T16:00:00Z",
      },
    ],
    4: [
      {
        id: 6,
        record_id: 4,
        ordinance_infraction_report_no: "OIR-2024-020",
        smoke_density_test_result_no: "SDT-2024-020",
        place_of_apprehension: "Shaw Boulevard",
        date_of_apprehension: "2024-07-28",
        paid_driver: false,
        paid_operator: false,
        created_at: "2024-07-28T13:15:00Z",
        updated_at: "2024-07-28T13:15:00Z",
      },
    ],
    5: [
      {
        id: 7,
        record_id: 5,
        ordinance_infraction_report_no: "OIR-2024-025",
        place_of_apprehension: "Katipunan Extension",
        date_of_apprehension: "2024-08-02",
        paid_driver: true,
        paid_operator: true,
        created_at: "2024-08-02T11:00:00Z",
        updated_at: "2024-08-02T11:00:00Z",
      },
    ],
    6: [
      {
        id: 8,
        record_id: 6,
        ordinance_infraction_report_no: "OIR-2024-030",
        smoke_density_test_result_no: "SDT-2024-030",
        place_of_apprehension: "Commonwealth Circle",
        date_of_apprehension: "2024-07-15",
        paid_driver: false,
        paid_operator: true,
        created_at: "2024-07-15T08:45:00Z",
        updated_at: "2024-07-15T08:45:00Z",
      },
    ],
    7: [
      {
        id: 9,
        record_id: 7,
        ordinance_infraction_report_no: "OIR-2024-035",
        smoke_density_test_result_no: "SDT-2024-035",
        place_of_apprehension: "EDSA Kamuning",
        date_of_apprehension: "2024-08-18",
        paid_driver: false,
        paid_operator: false,
        created_at: "2024-08-18T07:30:00Z",
        updated_at: "2024-08-18T07:30:00Z",
      },
      {
        id: 10,
        record_id: 7,
        ordinance_infraction_report_no: "OIR-2024-040",
        place_of_apprehension: "Quezon Memorial Circle",
        date_of_apprehension: "2024-05-20",
        paid_driver: true,
        paid_operator: false,
        created_at: "2024-05-20T14:20:00Z",
        updated_at: "2024-05-20T14:20:00Z",
      },
    ],
    8: [
      {
        id: 11,
        record_id: 8,
        ordinance_infraction_report_no: "OIR-2024-045",
        place_of_apprehension: "Local Street Checkpoint",
        date_of_apprehension: "2024-08-12",
        paid_driver: false,
        paid_operator: false,
        created_at: "2024-08-12T10:15:00Z",
        updated_at: "2024-08-12T10:15:00Z",
      },
    ],
    9: [
      {
        id: 12,
        record_id: 9,
        ordinance_infraction_report_no: "OIR-2024-050",
        place_of_apprehension: "Ortigas Center",
        date_of_apprehension: "2024-08-08",
        paid_driver: true,
        paid_operator: true,
        created_at: "2024-08-08T12:00:00Z",
        updated_at: "2024-08-08T12:00:00Z",
      },
    ],
    10: [
      {
        id: 13,
        record_id: 10,
        ordinance_infraction_report_no: "OIR-2024-055",
        smoke_density_test_result_no: "SDT-2024-055",
        place_of_apprehension: "North Luzon Expressway",
        date_of_apprehension: "2024-07-30",
        paid_driver: true,
        paid_operator: false,
        created_at: "2024-07-30T15:30:00Z",
        updated_at: "2024-07-30T15:30:00Z",
      },
    ],
  };

  return mockViolationsByRecord[recordId] || [];
};

// Create new violation
export const createBelchingViolation = async (violationData: {
  record_id: number;
  ordinance_infraction_report_no?: string;
  smoke_density_test_result_no?: string;
  place_of_apprehension: string;
  date_of_apprehension: string;
  driver_id?: string;
}): Promise<Violation> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id: Date.now(),
    ...violationData,
    paid_driver: false,
    paid_operator: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

// Create new record
export const createBelchingRecord = async (recordData: {
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
}): Promise<Record> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    id: Date.now(),
    ...recordData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

// Update violation payment status
export const updateViolationPaymentStatus = async (
  violationId: number,
  paidDriver: boolean,
  paidOperator: boolean
): Promise<{ success: boolean }> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  return { success: true };
};

// Update existing record
export const updateBelchingRecord = async (
  recordId: number,
  recordData: Partial<{
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
  }>
): Promise<Record> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In a real API, this would update the record in the database
  return {
    id: recordId,
    plate_number: recordData.plate_number || "UPD-123",
    vehicle_type: recordData.vehicle_type || "Bus",
    transport_group: recordData.transport_group,
    operator_company_name:
      recordData.operator_company_name || "Updated Company",
    operator_address: recordData.operator_address,
    owner_first_name: recordData.owner_first_name,
    owner_middle_name: recordData.owner_middle_name,
    owner_last_name: recordData.owner_last_name,
    motor_no: recordData.motor_no,
    motor_vehicle_name: recordData.motor_vehicle_name,
    created_at: "2024-01-15T08:30:00Z",
    updated_at: new Date().toISOString(),
  };
};

// Delete record
export const deleteBelchingRecord = async (
  recordId: number
): Promise<{ success: boolean }> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 800));

  return { success: true };
};

// Get record by ID
export const fetchBelchingRecordById = async (
  recordId: number
): Promise<Record | null> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 300));

  // For testing, return mock data based on the recordId
  const mockRecord: Record = {
    id: recordId,
    plate_number: `TST-${recordId.toString().padStart(3, "0")}`,
    vehicle_type: "Bus",
    transport_group: "Test Transport Group",
    operator_company_name: `Test Company ${recordId}`,
    operator_address: `${recordId} Test Street, Test City`,
    owner_first_name: "Test",
    owner_middle_name: "Middle",
    owner_last_name: "Owner",
    motor_no: `ENG${recordId}0000`,
    motor_vehicle_name: "Test Vehicle Model",
    created_at: "2024-01-15T08:30:00Z",
    updated_at: new Date().toISOString(),
  };

  return mockRecord;
};

// Get vehicle types for dropdown
export const fetchVehicleTypes = async (): Promise<string[]> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 200));

  return [
    "Bus",
    "Jeepney",
    "Truck",
    "Taxi",
    "Private",
    "UV Express",
    "Tricycle",
    "Motorcycle",
    "Van",
    "SUV",
  ];
};

// Add to CEC queue
export const addToCecQueue = async (
  recordId: number
): Promise<{ success: boolean; message: string }> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    message: `Record ${recordId} successfully added to CEC queue`,
  };
};

// Generate print clearance
export const generatePrintClearance = async (
  recordId: number
): Promise<{ success: boolean; clearanceUrl: string }> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    success: true,
    clearanceUrl: `/api/clearance/print/${recordId}.pdf`,
  };
};

// Search drivers for violation assignment
export const searchDrivers = async (params?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Driver[]> => {
  try {
    const response = await apiClient.get("/belching/drivers/search", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error searching drivers:", error);
    throw error;
  }
};

// Get common places of apprehension for dropdown
export const getCommonPlacesOfApprehension = async (): Promise<string[]> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 200));

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

// Driver CRUD operations
export const fetchAllDrivers = async (params?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Driver[]> => {
  try {
    const response = await apiClient.get("/belching/drivers", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching drivers:", error);
    throw error;
  }
};

export const createDriver = async (driverData: {
  first_name: string;
  middle_name?: string;
  last_name: string;
  address: string;
  license_number: string;
}): Promise<Driver> => {
  try {
    const response = await apiClient.post("/belching/drivers", driverData);
    return response.data;
  } catch (error) {
    console.error("Error creating driver:", error);
    throw error;
  }
};

export const updateDriver = async (
  driverId: string,
  driverData: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    address?: string;
    license_number?: string;
  }
): Promise<Driver> => {
  try {
    const response = await apiClient.put(
      `/belching/drivers/${driverId}`,
      driverData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating driver:", error);
    throw error;
  }
};

export const deleteDriver = async (
  driverId: string
): Promise<{ success: boolean }> => {
  try {
    await apiClient.delete(`/belching/drivers/${driverId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting driver:", error);
    throw error;
  }
};

export const fetchDriverById = async (
  driverId: string
): Promise<Driver | null> => {
  try {
    const response = await apiClient.get(`/belching/drivers/${driverId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching driver by ID:", error);
    throw error;
  }
};

// Order of Payment API functions
export const searchOrdersOfPayment = async (params?: {
  search?: string;
  control_number?: string;
  plate_number?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<OrderOfPayment[]> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockOrders: OrderOfPayment[] = [
    {
      id: "1",
      control_number: "OOP-2024-001",
      plate_number: "ABC-123",
      operator_name: "City Bus Lines",
      driver_name: "Juan Dela Cruz",
      admin_created_by: "admin@example.com",
      status: "pending",
      oop_control_number: "OOP-2024-001",
      testing_officer: "Officer Rodriguez",
      test_results: "Failed - Excess Smoke Emission",
      date_of_testing: "2024-08-15",
      selected_violations: ["1", "2"],
      apprehension_fee: 2500,
      voluntary_fee: 0,
      impound_fee: 1000,
      driver_amount: 3000,
      operator_fee: 5000,
      total_undisclosed_amount: 11500,
      grand_total_amount: 11500,
      created_at: "2024-08-15T10:30:00Z",
      updated_at: "2024-08-15T10:30:00Z",
    },
    {
      id: "2",
      control_number: "OOP-2024-002",
      plate_number: "XYZ-789",
      operator_name: "Local Transport Coop",
      driver_name: "Maria Santos Garcia",
      admin_created_by: "admin@example.com",
      status: "draft",
      oop_control_number: "OOP-2024-002",
      testing_officer: "Officer Martinez",
      test_results: "Failed - Smoke Density Above Limit",
      date_of_testing: "2024-08-16",
      selected_violations: ["3"],
      apprehension_fee: 2500,
      voluntary_fee: 1500,
      impound_fee: 0,
      driver_amount: 2000,
      operator_fee: 3000,
      total_undisclosed_amount: 9000,
      grand_total_amount: 9000,
      created_at: "2024-08-16T14:20:00Z",
      updated_at: "2024-08-16T14:20:00Z",
    },
    {
      id: "3",
      control_number: "OOP-2024-003",
      plate_number: "DEF-456",
      operator_name: "Freight Express Inc",
      driver_name: "Carlos Antonio Reyes",
      admin_created_by: "admin@example.com",
      status: "paid",
      oop_control_number: "OOP-2024-003",
      testing_officer: "Officer Santos",
      test_results: "Failed - Black Smoke Emission",
      date_of_testing: "2024-08-10",
      date_of_payment: "2024-08-12",
      selected_violations: ["4", "5"],
      apprehension_fee: 2500,
      voluntary_fee: 0,
      impound_fee: 2000,
      driver_amount: 4000,
      operator_fee: 6000,
      total_undisclosed_amount: 14500,
      grand_total_amount: 14500,
      created_at: "2024-08-10T11:45:00Z",
      updated_at: "2024-08-12T16:30:00Z",
    },
  ];

  let filteredOrders = mockOrders;

  if (params?.search) {
    const searchTerm = params.search.toLowerCase();
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.control_number.toLowerCase().includes(searchTerm) ||
        order.plate_number.toLowerCase().includes(searchTerm) ||
        order.operator_name.toLowerCase().includes(searchTerm) ||
        (order.driver_name &&
          order.driver_name.toLowerCase().includes(searchTerm))
    );
  }

  if (params?.control_number) {
    filteredOrders = filteredOrders.filter((order) =>
      order.control_number
        .toLowerCase()
        .includes(params.control_number!.toLowerCase())
    );
  }

  if (params?.plate_number) {
    filteredOrders = filteredOrders.filter((order) =>
      order.plate_number
        .toLowerCase()
        .includes(params.plate_number!.toLowerCase())
    );
  }

  if (params?.status) {
    filteredOrders = filteredOrders.filter(
      (order) => order.status === params.status
    );
  }

  return filteredOrders.slice(0, params?.limit || 20);
};

export const fetchOrderOfPaymentById = async (
  id: string
): Promise<OrderOfPayment | null> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 300));

  const mockOrder: OrderOfPayment = {
    id,
    control_number: `OOP-2024-${id.padStart(3, "0")}`,
    plate_number: "ABC-123",
    operator_name: "Test Company",
    driver_name: "Test Driver",
    admin_created_by: "admin@example.com",
    status: "draft",
    oop_control_number: `OOP-2024-${id.padStart(3, "0")}`,
    testing_officer: "Test Officer",
    test_results: "Failed - Test Results",
    date_of_testing: "2024-08-15",
    selected_violations: ["1"],
    apprehension_fee: 2500,
    voluntary_fee: 0,
    impound_fee: 0,
    driver_amount: 3000,
    operator_fee: 5000,
    total_undisclosed_amount: 10500,
    grand_total_amount: 10500,
    created_at: "2024-08-15T10:30:00Z",
    updated_at: "2024-08-15T10:30:00Z",
  };

  return mockOrder;
};

export const createOrderOfPayment = async (orderData: {
  plate_number: string;
  operator_name: string;
  driver_name?: string;
  selected_violations: string[];
}): Promise<OrderOfPayment> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const newId = Date.now().toString();
  return {
    id: newId,
    control_number: `OOP-2024-${newId.slice(-3)}`,
    ...orderData,
    admin_created_by: "admin@example.com",
    status: "draft",
    oop_control_number: `OOP-2024-${newId.slice(-3)}`,
    apprehension_fee: 0,
    voluntary_fee: 0,
    impound_fee: 0,
    driver_amount: 0,
    operator_fee: 0,
    total_undisclosed_amount: 0,
    grand_total_amount: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const updateOrderOfPayment = async (
  id: string,
  orderData: Partial<OrderOfPayment>
): Promise<OrderOfPayment> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    id,
    control_number: `OOP-2024-${id.padStart(3, "0")}`,
    plate_number: orderData.plate_number || "ABC-123",
    operator_name: orderData.operator_name || "Test Company",
    driver_name: orderData.driver_name,
    admin_created_by: "admin@example.com",
    status: orderData.status || "draft",
    oop_control_number:
      orderData.oop_control_number || `OOP-2024-${id.padStart(3, "0")}`,
    testing_officer: orderData.testing_officer,
    test_results: orderData.test_results,
    date_of_testing: orderData.date_of_testing,
    selected_violations: orderData.selected_violations || [],
    apprehension_fee: orderData.apprehension_fee || 0,
    voluntary_fee: orderData.voluntary_fee || 0,
    impound_fee: orderData.impound_fee || 0,
    driver_amount: orderData.driver_amount || 0,
    operator_fee: orderData.operator_fee || 0,
    total_undisclosed_amount: orderData.total_undisclosed_amount || 0,
    grand_total_amount: orderData.grand_total_amount || 0,
    date_of_payment: orderData.date_of_payment,
    created_at: "2024-08-15T10:30:00Z",
    updated_at: new Date().toISOString(),
  };
};

export const deleteOrderOfPayment = async (
  id: string
): Promise<{ success: boolean }> => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 600));

  return { success: true };
};
