import { UrbanRepository } from "./repository.js";
import {
  SeedlingRequest,
  UrbanGreening,
  SeedlingRequestFilters,
  UrbanGreeningFilters,
} from "./types.js";
import { AuthContext } from "../auth/types.js";

/**
 * Resolvers for Urban Greening and Seedling Requests
 */
export const urbanGreeningResolvers = {
  Query: {
    // Seedling request queries
    seedlingRequests: async (
      _: any,
      { filters }: { filters?: SeedlingRequestFilters },
      context: AuthContext
    ) => {
      return await UrbanRepository.findAllSeedlingRequests(filters);
    },

    seedlingRequest: async (
      _: any,
      { id }: { id: string },
      context: AuthContext
    ) => {
      return await UrbanRepository.findSeedlingRequestById(id);
    },

    // Urban greening queries
    urbanGreeningRecords: async (
      _: any,
      { filters }: { filters?: UrbanGreeningFilters },
      context: AuthContext
    ) => {
      return await UrbanRepository.findAllUrbanGreening(filters);
    },

    urbanGreeningRecord: async (
      _: any,
      { id }: { id: string },
      context: AuthContext
    ) => {
      return await UrbanRepository.findUrbanGreeningById(id);
    },

    // Urban overview query
    urbanOverview: async (
      _: any,
      { year }: { year: number },
      context: AuthContext
    ) => {
      return await UrbanRepository.getUrbanOverview(year);
    },
  },

  Mutation: {
    // Seedling request mutations
    createSeedlingRequest: async (
      _: any,
      {
        input,
      }: { input: Omit<SeedlingRequest, "id" | "createdAt" | "updatedAt"> },
      context: AuthContext
    ) => {
      if (!context.user?.id) {
        throw new Error("Authentication required");
      }
      return await UrbanRepository.createSeedlingRequest(
        input,
        context.user.id
      );
    },

    updateSeedlingRequest: async (
      _: any,
      {
        id,
        input,
      }: {
        id: string;
        input: Partial<
          Omit<SeedlingRequest, "id" | "createdAt" | "createdBy" | "updatedAt">
        >;
      },
      context: AuthContext
    ) => {
      if (!context.user?.id) {
        throw new Error("Authentication required");
      }
      return await UrbanRepository.updateSeedlingRequest(
        id,
        input,
        context.user.id
      );
    },

    deleteSeedlingRequest: async (
      _: any,
      { id }: { id: string },
      context: AuthContext
    ) => {
      if (!context.user?.id) {
        throw new Error("Authentication required");
      }
      return await UrbanRepository.deleteSeedlingRequest(id);
    },

    // Urban greening mutations
    createUrbanGreening: async (
      _: any,
      {
        input,
      }: { input: Omit<UrbanGreening, "id" | "createdAt" | "updatedAt"> },
      context: AuthContext
    ) => {
      if (!context.user?.id) {
        throw new Error("Authentication required");
      }
      return await UrbanRepository.createUrbanGreening(input, context.user.id);
    },

    updateUrbanGreening: async (
      _: any,
      {
        id,
        input,
      }: {
        id: string;
        input: Partial<
          Omit<UrbanGreening, "id" | "createdAt" | "createdBy" | "updatedAt">
        >;
      },
      context: AuthContext
    ) => {
      if (!context.user?.id) {
        throw new Error("Authentication required");
      }
      return await UrbanRepository.updateUrbanGreening(
        id,
        input,
        context.user.id
      );
    },

    deleteUrbanGreening: async (
      _: any,
      { id }: { id: string },
      context: AuthContext
    ) => {
      if (!context.user?.id) {
        throw new Error("Authentication required");
      }
      return await UrbanRepository.deleteUrbanGreening(id);
    },
  },

  // Custom field resolvers - handles JSON parsing for items arrays
  SeedlingRequest: {
    items: (parent: any) => {
      if (typeof parent.items === "string") {
        try {
          return JSON.parse(parent.items);
        } catch (e) {
          console.error("Error parsing seedling items JSON:", e);
          return [];
        }
      }
      return parent.items || [];
    },
  },

  UrbanGreening: {
    items: (parent: any) => {
      if (typeof parent.items === "string") {
        try {
          return JSON.parse(parent.items);
        } catch (e) {
          console.error("Error parsing urban greening items JSON:", e);
          return [];
        }
      }
      return parent.items || [];
    },
  },
};
