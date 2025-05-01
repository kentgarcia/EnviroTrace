export interface Vehicle {
  id: string;
  driverName: string;
  contactNumber?: string;
  engineType: string;
  officeName: string;
  plateNumber: string;
  vehicleType: string;
  wheels: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmissionTest {
  id: string;
  vehicleId: string;
  testDate: Date;
  quarter: number;
  year: number;
  result: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  vehicle?: Vehicle;
}

export interface EmissionTestSchedule {
  id: string;
  assignedPersonnel: string;
  conductedOn: Date;
  location: string;
  quarter: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleSummary extends Vehicle {
  latestTestDate?: Date;
  latestTestQuarter?: number;
  latestTestYear?: number;
  latestTestResult?: boolean;
}

export interface EmissionTestFilters {
  year?: number;
  quarter?: number;
  vehicleId?: string;
  result?: boolean;
}

export interface VehicleFilters {
  plateNumber?: string;
  driverName?: string;
  officeName?: string;
  vehicleType?: string;
}
