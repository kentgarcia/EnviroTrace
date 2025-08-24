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

// Monitoring Request Workflow Status Values
export const MONITORING_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
} as const;

// Monitoring status options in the order they should appear in forms
export const MONITORING_STATUS_OPTIONS = [
  MONITORING_STATUS.PENDING,
  MONITORING_STATUS.IN_PROGRESS,
  MONITORING_STATUS.APPROVED,
  MONITORING_STATUS.REJECTED,
  MONITORING_STATUS.COMPLETED,
] as const;

// Default monitoring status for new requests
export const DEFAULT_MONITORING_STATUS = MONITORING_STATUS.PENDING;

// Monitoring Request Status Options (for filtering and display)
// These represent the actual status of the plants/trees being monitored
export const MONITORING_REQUEST_STATUS_OPTIONS = [
  "untracked",
  "living",
  "dead",
  "replaced",
] as const;

// Default monitoring request status
export const DEFAULT_MONITORING_REQUEST_STATUS = "untracked";

// Source Type Values
export const SOURCE_TYPE = {
  URBAN_GREENING: "urban_greening",
  TREE_MANAGEMENT: "tree_management",
} as const;

// Source type options for dropdowns
export const SOURCE_TYPE_OPTIONS = [
  SOURCE_TYPE.URBAN_GREENING,
  SOURCE_TYPE.TREE_MANAGEMENT,
] as const;

// Source type labels for display
export const SOURCE_TYPE_LABELS = {
  [SOURCE_TYPE.URBAN_GREENING]: "Urban Greening",
  [SOURCE_TYPE.TREE_MANAGEMENT]: "Tree Management",
} as const;

// Status color mappings for UI consistency
export const PLANT_STATUS_COLORS = {
  [PLANT_STATUS.UNTRACKED]: "bg-gray-100 text-gray-800",
  [PLANT_STATUS.LIVING]: "bg-green-100 text-green-800",
  [PLANT_STATUS.DEAD]: "bg-red-100 text-red-800",
  [PLANT_STATUS.REPLACED]: "bg-blue-100 text-blue-800",
} as const;

export const MONITORING_STATUS_COLORS = {
  [MONITORING_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [MONITORING_STATUS.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [MONITORING_STATUS.APPROVED]: "bg-green-100 text-green-800",
  [MONITORING_STATUS.REJECTED]: "bg-red-100 text-red-800",
  [MONITORING_STATUS.COMPLETED]: "bg-purple-100 text-purple-800",
} as const;

// Type definitions
export type PlantStatus = (typeof PLANT_STATUS)[keyof typeof PLANT_STATUS];
export type MonitoringStatus =
  (typeof MONITORING_STATUS)[keyof typeof MONITORING_STATUS];
export type SourceType = (typeof SOURCE_TYPE)[keyof typeof SOURCE_TYPE];
