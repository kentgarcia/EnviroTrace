// client/src/core/api/tree-inventory-api.ts
/**
 * Tree Inventory System API Client
 * Unified API for tree lifecycle tracking
 */

import apiClient from "./api-client";

// ==================== Types ====================

export interface TreeSpecies {
  id: string;
  scientific_name?: string;
  common_name: string;  // Required - primary identifier
  local_name?: string;
  family?: string;
  is_native: boolean;
  is_endangered: boolean;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface TreeSpeciesCreate {
  scientific_name?: string;
  common_name: string;  // Required - primary identifier
  local_name?: string;
  family?: string;
  is_native?: boolean;
  is_endangered?: boolean;
  description?: string;
}

export interface TreeInventory {
  id: string;
  tree_code: string;
  species?: string;  // Scientific name (optional)
  common_name: string;  // Required - primary identifier
  latitude?: number;
  longitude?: number;
  address?: string;
  barangay?: string;
  status: 'alive' | 'cut' | 'dead' | 'replaced' | 'unknown';
  health: 'healthy' | 'needs_attention' | 'diseased' | 'dead' | 'unknown';
  height_meters?: number;
  diameter_cm?: number;
  age_years?: number;
  planted_date?: string;
  cutting_date?: string;
  cutting_reason?: string;
  death_date?: string;
  death_cause?: string;
  managed_by?: string;
  contact_person?: string;
  contact_number?: string;
  cutting_request_id?: string;
  planting_project_id?: string;
  replacement_tree_id?: string;
  photos?: string[];
  notes?: string;
  created_at: string;
  updated_at?: string;
  monitoring_logs_count?: number;
  last_inspection_date?: string;
}

export interface TreeInventoryCreate {
  tree_code?: string;
  species?: string;  // Scientific name (optional)
  common_name: string;  // Required - primary identifier
  latitude?: number;
  longitude?: number;
  address?: string;
  barangay?: string;
  status?: string;
  health?: string;
  height_meters?: number;
  diameter_cm?: number;
  age_years?: number;
  planted_date?: string;
  managed_by?: string;
  contact_person?: string;
  contact_number?: string;
  planting_project_id?: string;
  photos?: string[];
  notes?: string;
}

export interface TreeInventoryUpdate extends Partial<TreeInventoryCreate> {
  cutting_date?: string;
  cutting_reason?: string;
  death_date?: string;
  death_cause?: string;
  cutting_request_id?: string;
  replacement_tree_id?: string;
}

export interface TreeMonitoringLog {
  id: string;
  tree_id: string;
  inspection_date: string;
  health_status: string;
  height_meters?: number;
  diameter_cm?: number;
  notes?: string;
  recommendations?: string;
  inspector_name?: string;
  photos?: string[];
  created_at: string;
}

export interface TreeMonitoringLogCreate {
  tree_id: string;
  inspection_date?: string;
  health_status: string;
  height_meters?: number;
  diameter_cm?: number;
  notes?: string;
  inspector_name?: string;
  recommendations?: string;
  photos?: string[];
}

// Alias for better clarity
export type MonitoringLogCreate = TreeMonitoringLogCreate;

export interface PlantingProject {
  id: string;
  project_code: string;
  project_name: string;
  project_type: 'replacement' | 'urban_greening' | 'reforestation';
  latitude?: number;
  longitude?: number;
  address?: string;
  barangay?: string;
  planting_date?: string;
  target_trees?: number;
  trees_planted: number;
  responsible_person?: string;
  organization?: string;
  contact_number?: string;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  photos?: string[];
  created_at: string;
  updated_at?: string;
}

export interface PlantingProjectCreate {
  project_code?: string;
  project_name: string;
  project_type: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  barangay?: string;
  planting_date?: string;
  target_trees?: number;
  responsible_person?: string;
  organization?: string;
  contact_number?: string;
  status?: string;
  notes?: string;
  photos?: string[];
}

export interface PlantingProjectUpdate extends Partial<PlantingProjectCreate> {
  trees_planted?: number;
}

export interface TreeInventoryStats {
  total_trees: number;
  alive_trees: number;
  cut_trees: number;
  dead_trees: number;
  healthy_trees: number;
  needs_attention_trees: number;
  diseased_trees: number;
  trees_planted_this_year: number;
  trees_cut_this_year: number;
  replacement_ratio?: number;
  top_species: { species: string; count: number }[];
  by_barangay: { barangay: string; count: number }[];
}

export interface PlantingProjectStats {
  total_projects: number;
  planned_projects: number;
  ongoing_projects: number;
  completed_projects: number;
  total_trees_planted: number;
  by_type: { type: string; count: number; trees: number }[];
}

// Lightweight type for map display
export interface TreeMapItem {
  id: string;
  tree_code: string;
  species: string;
  common_name?: string;
  latitude: number;
  longitude: number;
  address?: string;
  barangay?: string;
  status: 'alive' | 'cut' | 'dead' | 'replaced';
  health: 'healthy' | 'needs_attention' | 'diseased' | 'dead';
}

// Cluster data for map clustering
export interface TreeCluster {
  cluster_lat: number;
  cluster_lng: number;
  tree_count: number;
  sample_id: string;
  sample_code: string;
  sample_species: string;
}

// Bounding box params
export interface BoundsParams {
  min_lat: number;
  min_lng: number;
  max_lat: number;
  max_lng: number;
  status?: string;
  health?: string;
}

// ==================== Tree Inventory API ====================

export const fetchTrees = async (params?: {
  skip?: number;
  limit?: number;
  status?: string;
  health?: string;
  species?: string;
  barangay?: string;
  search?: string;
}): Promise<TreeInventory[]> => {
  const searchParams = new URLSearchParams();
  if (params?.skip) searchParams.append('skip', String(params.skip));
  if (params?.limit) searchParams.append('limit', String(params.limit));
  if (params?.status) searchParams.append('status', params.status);
  if (params?.health) searchParams.append('health', params.health);
  if (params?.species) searchParams.append('species', params.species);
  if (params?.barangay) searchParams.append('barangay', params.barangay);
  if (params?.search) searchParams.append('search', params.search);
  
  const queryString = searchParams.toString();
  const url = `/tree-inventory/trees${queryString ? `?${queryString}` : ''}`;
  const res = await apiClient.get(url);
  return res.data;
};

export const fetchTreesForMap = async (params?: {
  status?: string;
  health?: string;
}): Promise<TreeMapItem[]> => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.health) searchParams.append('health', params.health);
  
  const queryString = searchParams.toString();
  const url = `/tree-inventory/trees/map${queryString ? `?${queryString}` : ''}`;
  const res = await apiClient.get(url);
  return res.data;
};

export const fetchTreesInBounds = async (params: BoundsParams & { limit?: number }): Promise<TreeMapItem[]> => {
  const searchParams = new URLSearchParams();
  searchParams.append('min_lat', String(params.min_lat));
  searchParams.append('min_lng', String(params.min_lng));
  searchParams.append('max_lat', String(params.max_lat));
  searchParams.append('max_lng', String(params.max_lng));
  if (params.status) searchParams.append('status', params.status);
  if (params.health) searchParams.append('health', params.health);
  if (params.limit) searchParams.append('limit', String(params.limit));
  
  const res = await apiClient.get(`/tree-inventory/trees/bounds?${searchParams.toString()}`);
  return res.data;
};

export const fetchTreeClusters = async (params: BoundsParams & { zoom: number }): Promise<TreeCluster[]> => {
  const searchParams = new URLSearchParams();
  searchParams.append('min_lat', String(params.min_lat));
  searchParams.append('min_lng', String(params.min_lng));
  searchParams.append('max_lat', String(params.max_lat));
  searchParams.append('max_lng', String(params.max_lng));
  searchParams.append('zoom', String(params.zoom));
  if (params.status) searchParams.append('status', params.status);
  if (params.health) searchParams.append('health', params.health);
  
  const res = await apiClient.get(`/tree-inventory/trees/clusters?${searchParams.toString()}`);
  return res.data;
};

export const fetchTreeStats = async (): Promise<TreeInventoryStats> => {
  const res = await apiClient.get('/tree-inventory/trees/stats');
  return res.data;
};

export const fetchTreeById = async (id: string): Promise<TreeInventory> => {
  const res = await apiClient.get(`/tree-inventory/trees/${id}`);
  return res.data;
};

export const fetchTreeByCode = async (code: string): Promise<TreeInventory> => {
  const res = await apiClient.get(`/tree-inventory/trees/code/${code}`);
  return res.data;
};

export const createTree = async (data: TreeInventoryCreate): Promise<TreeInventory> => {
  const res = await apiClient.post('/tree-inventory/trees', data);
  return res.data;
};

export const updateTree = async (id: string, data: TreeInventoryUpdate): Promise<TreeInventory> => {
  const res = await apiClient.put(`/tree-inventory/trees/${id}`, data);
  return res.data;
};

export const deleteTree = async (id: string): Promise<void> => {
  await apiClient.delete(`/tree-inventory/trees/${id}`);
};

export const createTreesBatch = async (trees: TreeInventoryCreate[]): Promise<TreeInventory[]> => {
  const res = await apiClient.post('/tree-inventory/trees/batch', trees);
  return res.data;
};

// ==================== Monitoring Log API ====================

export const fetchMonitoringLogs = async (treeId: string): Promise<TreeMonitoringLog[]> => {
  const res = await apiClient.get(`/tree-inventory/trees/${treeId}/monitoring`);
  return res.data;
};

export const createMonitoringLog = async (data: TreeMonitoringLogCreate): Promise<TreeMonitoringLog> => {
  const res = await apiClient.post('/tree-inventory/monitoring', data);
  return res.data;
};

// ==================== Planting Project API ====================

export const fetchProjects = async (params?: {
  skip?: number;
  limit?: number;
  project_type?: string;
  status?: string;
  search?: string;
}): Promise<PlantingProject[]> => {
  const searchParams = new URLSearchParams();
  if (params?.skip) searchParams.append('skip', String(params.skip));
  if (params?.limit) searchParams.append('limit', String(params.limit));
  if (params?.project_type) searchParams.append('project_type', params.project_type);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.search) searchParams.append('search', params.search);
  
  const queryString = searchParams.toString();
  const url = `/tree-inventory/projects${queryString ? `?${queryString}` : ''}`;
  const res = await apiClient.get(url);
  return res.data;
};

export const fetchProjectStats = async (): Promise<PlantingProjectStats> => {
  const res = await apiClient.get('/tree-inventory/projects/stats');
  return res.data;
};

export const fetchProjectById = async (id: string): Promise<PlantingProject> => {
  const res = await apiClient.get(`/tree-inventory/projects/${id}`);
  return res.data;
};

export const createProject = async (data: PlantingProjectCreate): Promise<PlantingProject> => {
  const res = await apiClient.post('/tree-inventory/projects', data);
  return res.data;
};

export const updateProject = async (id: string, data: PlantingProjectUpdate): Promise<PlantingProject> => {
  const res = await apiClient.put(`/tree-inventory/projects/${id}`, data);
  return res.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await apiClient.delete(`/tree-inventory/projects/${id}`);
};

export const addTreesToProject = async (projectId: string, trees: TreeInventoryCreate[]): Promise<TreeInventory[]> => {
  const res = await apiClient.post(`/tree-inventory/projects/${projectId}/add-trees`, trees);
  return res.data;
};
// ==================== Tree Species API ====================

export const fetchTreeSpecies = async (search?: string): Promise<TreeSpecies[]> => {
  const url = search 
    ? `/tree-inventory/species?search=${encodeURIComponent(search)}`
    : '/tree-inventory/species';
  const res = await apiClient.get(url);
  return res.data;
};

export const createTreeSpecies = async (data: TreeSpeciesCreate): Promise<TreeSpecies> => {
  const res = await apiClient.post('/tree-inventory/species', data);
  return res.data;
};

export const updateTreeSpecies = async (id: string, data: Partial<TreeSpeciesCreate>): Promise<TreeSpecies> => {
  const res = await apiClient.put(`/tree-inventory/species/${id}`, data);
  return res.data;
};

export const deleteTreeSpecies = async (id: string): Promise<{ message: string; trees_using_species: number; species_name: string }> => {
  const res = await apiClient.delete(`/tree-inventory/species/${id}`);
  return res.data;
};