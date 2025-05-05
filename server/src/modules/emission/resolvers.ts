import { EmissionRepository } from "./repository.js";
import { AuthContext } from "../auth/types.js";
import { ErrorType, AppError } from "../../middlewares/errorMiddleware.js";

/**
 * Resolvers for emission management
 */
export const emissionResolvers = {
  Query: {
    // Vehicle queries
    vehicles: async (_, { filters }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }
      return await EmissionRepository.findAllVehicles(filters);
    },

    vehicle: async (_, { id }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }
      const vehicle = await EmissionRepository.findVehicleById(id);
      if (!vehicle) {
        throw new AppError("Vehicle not found", ErrorType.NOT_FOUND_ERROR);
      }
      return vehicle;
    },

    vehicleSummaries: async (_, { filters }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }
      return await EmissionRepository.findVehicleSummaries(filters);
    },

    vehicleSummary: async (_, { id }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }
      const vehicleSummary = await EmissionRepository.findVehicleSummaryById(
        id
      );
      if (!vehicleSummary) {
        throw new AppError("Vehicle not found", ErrorType.NOT_FOUND_ERROR);
      }
      return vehicleSummary;
    },

    // EmissionTest queries
    emissionTests: async (_, { filters }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }
      return await EmissionRepository.findAllEmissionTests(filters);
    },

    emissionTest: async (_, { id }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }
      const emissionTest = await EmissionRepository.findEmissionTestById(id);
      if (!emissionTest) {
        throw new AppError(
          "Emission test not found",
          ErrorType.NOT_FOUND_ERROR
        );
      }
      return emissionTest;
    },

    // EmissionTestSchedule queries
    emissionTestSchedules: async (
      _,
      { year, quarter },
      { user }: AuthContext
    ) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }
      return await EmissionRepository.findAllEmissionTestSchedules(
        year,
        quarter
      );
    },

    emissionTestSchedule: async (_, { id }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }
      const schedule = await EmissionRepository.findEmissionTestScheduleById(
        id
      );
      if (!schedule) {
        throw new AppError(
          "Emission test schedule not found",
          ErrorType.NOT_FOUND_ERROR
        );
      }
      return schedule;
    },

    // Office compliance queries
    officeCompliance: async (_, { year, quarter, searchTerm }) => {
      return EmissionRepository.findOfficeCompliance(year, quarter, searchTerm);
    },
  },

  Mutation: {
    // Vehicle mutations
    createVehicle: async (_, { input }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }
      return await EmissionRepository.createVehicle(input);
    },

    updateVehicle: async (_, { id, input }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }

      // Check if vehicle exists
      const existingVehicle = await EmissionRepository.findVehicleById(id);
      if (!existingVehicle) {
        throw new AppError("Vehicle not found", ErrorType.NOT_FOUND_ERROR);
      }

      return await EmissionRepository.updateVehicle(id, input);
    },

    deleteVehicle: async (_, { id }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }

      // Check if vehicle exists
      const existingVehicle = await EmissionRepository.findVehicleById(id);
      if (!existingVehicle) {
        throw new AppError("Vehicle not found", ErrorType.NOT_FOUND_ERROR);
      }

      return await EmissionRepository.deleteVehicle(id);
    },

    // EmissionTest mutations
    createEmissionTest: async (_, { input }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }

      // Check if vehicle exists
      const existingVehicle = await EmissionRepository.findVehicleById(
        input.vehicleId
      );
      if (!existingVehicle) {
        throw new AppError("Vehicle not found", ErrorType.NOT_FOUND_ERROR);
      }

      return await EmissionRepository.createEmissionTest(input, user.id);
    },

    updateEmissionTest: async (_, { id, input }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }

      // Check if emission test exists
      const existingTest = await EmissionRepository.findEmissionTestById(id);
      if (!existingTest) {
        throw new AppError(
          "Emission test not found",
          ErrorType.NOT_FOUND_ERROR
        );
      }

      // Check if vehicle exists (if changing vehicle)
      if (input.vehicleId && input.vehicleId !== existingTest.vehicleId) {
        const existingVehicle = await EmissionRepository.findVehicleById(
          input.vehicleId
        );
        if (!existingVehicle) {
          throw new AppError("Vehicle not found", ErrorType.NOT_FOUND_ERROR);
        }
      }

      return await EmissionRepository.updateEmissionTest(id, input);
    },

    deleteEmissionTest: async (_, { id }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }

      // Check if emission test exists
      const existingTest = await EmissionRepository.findEmissionTestById(id);
      if (!existingTest) {
        throw new AppError(
          "Emission test not found",
          ErrorType.NOT_FOUND_ERROR
        );
      }

      return await EmissionRepository.deleteEmissionTest(id);
    },

    // EmissionTestSchedule mutations
    createEmissionTestSchedule: async (_, { input }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }

      return await EmissionRepository.createEmissionTestSchedule(input);
    },

    updateEmissionTestSchedule: async (
      _,
      { id, input },
      { user }: AuthContext
    ) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }

      // Check if schedule exists
      const existingSchedule =
        await EmissionRepository.findEmissionTestScheduleById(id);
      if (!existingSchedule) {
        throw new AppError(
          "Emission test schedule not found",
          ErrorType.NOT_FOUND_ERROR
        );
      }

      return await EmissionRepository.updateEmissionTestSchedule(id, input);
    },

    deleteEmissionTestSchedule: async (_, { id }, { user }: AuthContext) => {
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }

      // Check if schedule exists
      const existingSchedule =
        await EmissionRepository.findEmissionTestScheduleById(id);
      if (!existingSchedule) {
        throw new AppError(
          "Emission test schedule not found",
          ErrorType.NOT_FOUND_ERROR
        );
      }

      return await EmissionRepository.deleteEmissionTestSchedule(id);
    },
  },

  // Object type resolvers
  EmissionTest: {
    vehicle: async (parent) => {
      if (!parent.vehicleId) return null;
      return await EmissionRepository.findVehicleById(parent.vehicleId);
    },
  },

  Vehicle: {
    latestTest: async (parent) => {
      const tests = await EmissionRepository.findAllEmissionTests({
        vehicleId: parent.id,
      });
      return tests.length > 0 ? tests[0] : null;
    },
  },
};
