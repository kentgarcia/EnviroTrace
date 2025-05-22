import { PrismaClient } from "@prisma/client";
import { Request } from "express"; // Import Request from express
// import { DataLoaders, createDataLoaders } from './dataloaders'; // If using dataloaders

export interface AuthenticatedUser {
  // Define this based on your JWT payload
  id: string;
  // email?: string;
  // roles?: string[];
}

export interface Context {
  prisma: PrismaClient;
  req: Request; // Include the Express request object
  user?: AuthenticatedUser; // User will be populated by auth middleware
  // dataLoaders: DataLoaders;
}
