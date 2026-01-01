// client/src/core/api/urban-greening-project-api.ts
/**
 * Urban Greening Project API Client
 * For sapling projects - both replacement and new greening initiatives
 */

import apiClient from "./api-client";

// ==================== Types ====================

export type ProjectType = 'replacement' | 'new_greening' | 'reforestation' | 'beautification' | 'other';
export type PlantType = 'tree' | 'ornamental' | 'ornamental_private' | 'seeds' | 'seeds_private' | 'other';
export type ProjectStatus = 'planning' | 'procurement' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
export type PlantStatus = 'seedling' | 'sapling' | 'growing' | 'mature' | 'died' | 'removed' | 'transferred';

export interface UrbanGreeningProject {
  id: string;
  project_code: string;
  project_type: ProjectType;
  status: ProjectStatus;
  
  // Location
  location: string;
  barangay?: string;
  latitude?: number;
  longitude?: number;
  
  // Planting
  planting_date?: string;
  
  // Replacement link (if project_type is 'replacement')
  linked_cutting_request_id?: string;
  linked_cut_tree_ids?: string[];
  
  // Plants
  plants: ProjectPlant[];
  total_plants: number;
  
  // Responsible
  project_lead?: string;
  contact_number?: string;
  organization?: string;
  
  // Notes
  description?: string;
  photos?: string[];
  
  created_at: string;
  updated_at?: string;
}

export interface ProjectPlant {
  plant_type: PlantType;
  species?: string;
  common_name: string;
  quantity: number;
}

export interface PlantingRecord {
  id: string;
  project_id: string;
  plant_id?: string;
  plant_type: PlantType;
  species?: string;
  common_name: string;
  quantity: number;
  planting_date: string;
  planted_by?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status: PlantStatus;
  notes?: string;
  // If this becomes a tree in inventory
  tree_inventory_id?: string;
  created_at: string;
}

export interface UrbanGreeningProjectCreate {
  project_type: ProjectType;
  status?: ProjectStatus;
  location: string;
  barangay?: string;
  latitude?: number;
  longitude?: number;
  planting_date?: string;
  linked_cutting_request_id?: string;
  linked_cut_tree_ids?: string[];
  plants: Omit<ProjectPlant, 'id'>[];
  project_lead?: string;
  contact_number?: string;
  organization?: string;
  description?: string;
}

export interface UrbanGreeningProjectUpdate {
  status?: ProjectStatus;
  location?: string;
  barangay?: string;
  latitude?: number;
  longitude?: number;
  planting_date?: string;
  plants?: ProjectPlant[];
  project_lead?: string;
  contact_number?: string;
  organization?: string;
  description?: string;
  photos?: string[];
}

export interface PlantingRecordCreate {
  project_id: string;
  plant_type: PlantType;
  species?: string;
  common_name: string;
  quantity: number;
  planting_date: string;
  planted_by?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_plants_planned: number;
  total_plants_planted: number;
  survival_rate: number;
  by_type: { type: string; count: number; plants: number }[];
  by_status: { status: string; count: number }[];
  recent_plantings: number;
}

// ==================== API Functions ====================

export const fetchUrbanGreeningProjects = async (params?: {
  status?: ProjectStatus;
  project_type?: ProjectType;
  search?: string;
  year?: number;
}): Promise<UrbanGreeningProject[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.project_type) queryParams.append('project_type', params.project_type);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.year) queryParams.append('year', params.year.toString());
    
    const url = `/urban-greening-projects${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching urban greening projects:", error);
    return [];
  }
};

export const fetchUrbanGreeningProject = async (id: string): Promise<UrbanGreeningProject | null> => {
  try {
    const response = await apiClient.get(`/urban-greening-projects/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching urban greening project:", error);
    return null;
  }
};

export const createUrbanGreeningProject = async (
  data: UrbanGreeningProjectCreate
): Promise<UrbanGreeningProject> => {
  const response = await apiClient.post('/urban-greening-projects', data);
  return response.data;
};

export const updateUrbanGreeningProject = async (
  id: string,
  data: UrbanGreeningProjectUpdate
): Promise<UrbanGreeningProject> => {
  const response = await apiClient.patch(`/urban-greening-projects/${id}`, data);
  return response.data;
};

export const startProject = async (id: string): Promise<UrbanGreeningProject> => {
  const response = await apiClient.post(`/urban-greening-projects/${id}/start`);
  return response.data;
};

export const completeProject = async (
  id: string,
  data?: { notes?: string; survival_rate?: number }
): Promise<UrbanGreeningProject> => {
  const response = await apiClient.post(`/urban-greening-projects/${id}/complete`, data);
  return response.data;
};

export const addPlantingRecord = async (
  projectId: string,
  data: Omit<PlantingRecordCreate, 'project_id'>
): Promise<PlantingRecord> => {
  const response = await apiClient.post(`/urban-greening-projects/${projectId}/plantings`, data);
  return response.data;
};

export const transferToInventory = async (
  projectId: string,
  plantingIds: string[]
): Promise<{ transferred_count: number; tree_ids: string[] }> => {
  const response = await apiClient.post(`/urban-greening-projects/${projectId}/transfer-to-inventory`, {
    planting_ids: plantingIds,
  });
  return response.data;
};

export const fetchProjectStats = async (): Promise<ProjectStats> => {
  try {
    const response = await apiClient.get('/urban-greening-projects/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching project stats:", error);
    return {
      total_projects: 0,
      active_projects: 0,
      completed_projects: 0,
      total_plants_planned: 0,
      total_plants_planted: 0,
      survival_rate: 0,
      by_type: [],
      by_status: [],
      recent_plantings: 0,
    };
  }
};

export const deleteUrbanGreeningProject = async (id: string): Promise<void> => {
  await apiClient.delete(`/urban-greening-projects/${id}`);
};
