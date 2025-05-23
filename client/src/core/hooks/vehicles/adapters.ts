/**
 * This file provides adapter functions to convert between API and UI data formats.
 */
import {
  Vehicle as ApiVehicle,
  VehicleInput as ApiVehicleInput,
  EmissionTest,
  TestSchedule,
  DriverHistoryRecord,
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
    officeName: apiVehicle.office_name,
    plateNumber: apiVehicle.plate_number,
    vehicleType: apiVehicle.vehicle_type,
    wheels: apiVehicle.wheels,
    createdAt: apiVehicle.created_at,
    updatedAt: apiVehicle.updated_at,
    latestTestResult: apiVehicle.latest_test_result,
    latestTestDate: apiVehicle.latest_test_date,
    driverHistory: [], // Will be populated separately if needed
  };
}

export function adaptVehicleToApi(vehicle: UiVehicleInput): ApiVehicleInput {
  return {
    driver_name: vehicle.driverName,
    contact_number: vehicle.contactNumber,
    engine_type: vehicle.engineType,
    office_name: vehicle.officeName,
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
  };
}

// Add any other adapter functions as needed
