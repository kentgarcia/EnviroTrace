import { driverSearch, driverById } from "./repository.js";

export const driverResolvers = {
  Query: {
    driverSearch: async (_: any, { input }: any) => driverSearch(input),
    driverById: async (_: any, { id }: { id: number }) => driverById(id),
  },
};
