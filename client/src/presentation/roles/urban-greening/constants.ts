// Urban Greening Constants

// Plant/Tree Health Status Values
export const PLANT_STATUS = {
  UNTRACKED: "Untracked",
  LIVING: "Living",
  DEAD: "Dead",
  REPLACED: "Replaced",
} as const;

// Plant status options in the order they should appear in forms
export const PLANT_STATUS_OPTIONS = [
  PLANT_STATUS.UNTRACKED,
  PLANT_STATUS.LIVING,
  PLANT_STATUS.DEAD,
  PLANT_STATUS.REPLACED,
] as const;

// Default plant status for new records
export const DEFAULT_PLANT_STATUS = PLANT_STATUS.UNTRACKED;

// Status color mappings for UI consistency
export const PLANT_STATUS_COLORS = {
  [PLANT_STATUS.UNTRACKED]: "bg-gray-100 text-gray-800",
  [PLANT_STATUS.LIVING]: "bg-green-100 text-green-800",
  [PLANT_STATUS.DEAD]: "bg-red-100 text-red-800",
  [PLANT_STATUS.REPLACED]: "bg-blue-100 text-blue-800",
} as const;

// Type definitions
export type PlantStatus = (typeof PLANT_STATUS)[keyof typeof PLANT_STATUS];
