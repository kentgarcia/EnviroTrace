/**
 * This file provides adapter functions to convert between API and UI data formats.
 */
import {
  Vehicle as ApiVehicle,
  VehicleInput as ApiVehicleInput,
  EmissionTest,
  TestSchedule,
  DriverHistoryRecord,
  Office,
} from "@/core/api/emission-service";

import {
  Vehicle as UiVehicle,
  VehicleInput as UiVehicleInput,
  DriverHistory as UiDriverHistory,
} from "@/core/hooks/vehicles/useVehicles";

// Adapters for Vehicle type
export function adaptVehicleFromApi(apiVehicle: ApiVehicle): UiVehicle {
  return {
    id: apiVehicle.id,
    driverName: apiVehicle.driver_name,
    contactNumber: apiVehicle.contact_number,
    engineType: apiVehicle.engine_type,
    officeName: apiVehicle.office?.name || "Unknown Office",
    plateNumber: apiVehicle.plate_number,
    vehicleType: apiVehicle.vehicle_type,
    wheels: apiVehicle.wheels,
    createdAt: apiVehicle.created_at,
    updatedAt: apiVehicle.updated_at,
    latestTestResult: apiVehicle.latest_test_result ?? undefined,
    latestTestDate: apiVehicle.latest_test_date ?? undefined,
    driverHistory: [], // Will be populated separately if needed
  };
}

export function adaptVehicleToApi(
  vehicle: UiVehicleInput,
  officeId?: string
): ApiVehicleInput {
  return {
    driver_name: vehicle.driverName,
    contact_number: vehicle.contactNumber,
    engine_type: vehicle.engineType,
    office_id: officeId || "", // This needs to be provided by the caller
    plate_number: vehicle.plateNumber,
    vehicle_type: vehicle.vehicleType,
    wheels: vehicle.wheels,
  };
}

// Helper function to find office ID by name
export function getOfficeIdByName(
  offices: Office[],
  officeName: string
): string | undefined {
  const office = offices.find((office) => office.name === officeName);
  return office?.id;
}

// Updated adapter function that requires offices list
export function adaptVehicleToApiWithOffices(
  vehicle: UiVehicleInput,
  offices: Office[]
): ApiVehicleInput {
  const officeId = getOfficeIdByName(offices, vehicle.officeName);
  if (!officeId) {
    throw new Error(`Office "${vehicle.officeName}" not found`);
  }

  return {
    driver_name: vehicle.driverName,
    contact_number: vehicle.contactNumber,
    engine_type: vehicle.engineType,
    office_id: officeId,
    plate_number: vehicle.plateNumber,
    vehicle_type: vehicle.vehicleType,
    wheels: vehicle.wheels,
  };
}

// Adapters for DriverHistory
export function adaptDriverHistoryFromApi(
  record: DriverHistoryRecord
): UiDriverHistory {
  return {
    id: record.id,
    driverName: record.driver_name,
    contactNumber: record.contact_number,
    startDate: record.start_date,
    endDate: record.end_date || null,
    changedAt: record.created_at || record.start_date, // Fallback if no changedAt
    changedBy: null, // DriverHistoryRecord doesn't have this field
  };
}

// Adapter for VehicleDriverHistory (actual API response)
export function adaptVehicleDriverHistoryFromApi(
  record: any // VehicleDriverHistory from API
): UiDriverHistory {
  return {
    id: record.id,
    driverName: record.driver_name,
    contactNumber: undefined, // VehicleDriverHistory doesn't have contact_number
    startDate: record.changed_at, // Use changed_at as startDate for compatibility
    endDate: null, // VehicleDriverHistory doesn't track end dates
    changedAt: record.changed_at,
    changedBy: record.changed_by || null,
  };
}

// Add any other adapter functions as needed
