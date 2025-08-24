import apiClient from "./api-client";

// Types for workflow API
export interface ActionWorkflow {
  id: string;
  action_type: string;
  title: string;
  description?: string;
  scheduled_date?: string;
  estimated_duration?: string;
  assigned_to?: string;
  priority: string;
  resources_needed?: string;
  notes?: string;
  monitoring_request_ids: string[];
  affected_locations?: any[];
  status: string;
  completion_date?: string;
  completion_notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ActionWorkflowCreate {
  action_type: string;
  title: string;
  description?: string;
  scheduled_date?: string;
  estimated_duration?: string;
  assigned_to?: string;
  priority?: string;
  resources_needed?: string;
  notes?: string;
  monitoring_request_ids: string[];
  affected_locations?: any[];
  created_by?: string;
}

export interface EnvironmentalReport {
  id: string;
  report_type: string;
  title: string;
  description?: string;
  date_range_start?: string;
  date_range_end?: string;
  monitoring_request_ids: string[];
  report_data: any;
  file_path?: string;
  file_format: string;
  generation_status: string;
  generated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAnalytics {
  total_monitored_locations: number;
  active_workflows: number;
  workflow_counts_by_type: Record<string, number>;
  status_distribution: Record<string, number>;
  source_type_distribution: Record<string, number>;
  survival_rate: number;
}

// API functions for action workflows
export const createActionWorkflow = async (
  workflowData: ActionWorkflowCreate
): Promise<ActionWorkflow> => {
  const response = await apiClient.post("/workflows/actions", workflowData);
  return response.data;
};

export const fetchActionWorkflows = async (params?: {
  status?: string;
  action_type?: string;
  assigned_to?: string;
  skip?: number;
  limit?: number;
}): Promise<ActionWorkflow[]> => {
  const response = await apiClient.get("/workflows/actions", { params });
  return response.data;
};

export const fetchActionWorkflow = async (
  workflowId: string
): Promise<ActionWorkflow> => {
  const response = await apiClient.get(`/workflows/actions/${workflowId}`);
  return response.data;
};

export const updateActionWorkflow = async (
  workflowId: string,
  updateData: Partial<ActionWorkflowCreate>
): Promise<ActionWorkflow> => {
  const response = await apiClient.put(
    `/workflows/actions/${workflowId}`,
    updateData
  );
  return response.data;
};

export const completeActionWorkflow = async (
  workflowId: string,
  completionNotes?: string
): Promise<{ message: string }> => {
  const response = await apiClient.post(
    `/workflows/actions/${workflowId}/complete`,
    {
      completion_notes: completionNotes,
    }
  );
  return response.data;
};

// API functions for environmental reports
export const generateEnvironmentalReport = async (reportData: {
  report_type: string;
  title: string;
  description?: string;
  date_range_start?: string;
  date_range_end?: string;
  monitoring_request_ids: string[];
  file_format?: string;
  generated_by?: string;
}): Promise<EnvironmentalReport> => {
  const response = await apiClient.post(
    "/workflows/reports/generate",
    reportData
  );
  return response.data;
};

// API function for workflow analytics
export const fetchWorkflowAnalytics = async (): Promise<WorkflowAnalytics> => {
  const response = await apiClient.get("/workflows/analytics");
  return response.data;
};

// Helper function to execute actions from the monitoring interface
export const executeMonitoringAction = async (actionData: {
  action_type: string;
  request_ids: string[];
  scheduled_date?: string;
  assigned_to?: string;
  notes?: string;
  priority?: string;
  estimated_duration?: string;
  resources?: string;
  locations?: any[];
  executed_at: string;
}): Promise<ActionWorkflow> => {
  // Convert the action data to the workflow format
  const workflowData: ActionWorkflowCreate = {
    action_type: actionData.action_type,
    title: getActionTitle(
      actionData.action_type,
      actionData.request_ids.length
    ),
    description: getActionDescription(
      actionData.action_type,
      actionData.request_ids.length
    ),
    scheduled_date: actionData.scheduled_date,
    estimated_duration: actionData.estimated_duration,
    assigned_to: actionData.assigned_to,
    priority: actionData.priority || "medium",
    resources_needed: actionData.resources,
    notes: actionData.notes,
    monitoring_request_ids: actionData.request_ids,
    affected_locations: actionData.locations,
    created_by: "System", // You might want to get this from auth context
  };

  return createActionWorkflow(workflowData);
};

// Helper functions for generating titles and descriptions
const getActionTitle = (actionType: string, count: number): string => {
  switch (actionType) {
    case "bulk_inspect":
      return `Bulk Inspection - ${count} Locations`;
    case "schedule_maintenance":
      return `Maintenance Schedule - ${count} Sites`;
    case "plan_replacement":
      return `Replacement Planning - ${count} Areas`;
    case "generate_report":
      return `Environmental Report - ${count} Monitoring Points`;
    default:
      return `Action Workflow - ${count} Locations`;
  }
};

const getActionDescription = (actionType: string, count: number): string => {
  switch (actionType) {
    case "bulk_inspect":
      return `Scheduled field inspection for ${count} monitoring locations to assess current environmental status and update records.`;
    case "schedule_maintenance":
      return `Planned maintenance activities for ${count} locations with living plants including watering, pruning, and care.`;
    case "plan_replacement":
      return `Replacement planting plan for ${count} locations with dead or removed vegetation to restore green coverage.`;
    case "generate_report":
      return `Comprehensive environmental impact report covering ${count} monitoring points with status analysis and recommendations.`;
    default:
      return `Environmental action workflow for ${count} monitoring locations.`;
  }
};
