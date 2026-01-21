/**
 * Tree Inventory System API Client (Mobile)
 * Unified API for tree lifecycle tracking
 */

import apiClient from "./api-client";

// ==================== Types ====================

export interface TreeMapItem {
    id: string;
    tree_code: string;
    species: string;
    common_name: string;
    latitude: number;
    longitude: number;
    status: "alive" | "cut" | "dead" | "replaced";
    health: "healthy" | "needs_attention" | "diseased" | "dead";
    address?: string;
    barangay?: string;
    height_meters?: number;
    diameter_cm?: number;
    planted_date?: string;
}

export interface TreeInventory extends TreeMapItem {
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

export interface BoundsParams {
    min_lat: number;
    max_lat: number;
    min_lng: number;
    max_lng: number;
    status?: string;
    health?: string;
    limit?: number;
    zoom?: number;
}

export interface TreeCluster {
    latitude: number;
    longitude: number;
    count: number;
    status?: string;
    health?: string;
}

export interface TreeFilters {
    skip?: number;
    limit?: number;
    status?: string;
    health?: string;
    species?: string;
    barangay?: string;
    search?: string;
}

export interface TreeInventoryCreate {
    tree_code?: string;
    species?: string;
    common_name: string;
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
    photos?: string[];
    notes?: string;
}

export interface TreeInventoryUpdate extends Partial<TreeInventoryCreate> {
    cutting_date?: string;
    cutting_reason?: string;
    death_date?: string;
    death_cause?: string;
}

export interface TreeSpecies {
    id: string;
    scientific_name?: string;
    common_name: string;
    local_name?: string;
    family?: string;
    is_native: boolean;
    is_endangered: boolean;
    description?: string;
    created_at: string;
}

export interface TreeSpeciesCreate {
    scientific_name?: string;
    common_name: string;
    local_name?: string;
    family?: string;
    is_native?: boolean;
    is_endangered?: boolean;
    description?: string;
    avg_mature_height_min_m?: number;
    avg_mature_height_max_m?: number;
    avg_mature_height_avg_m?: number;
    avg_trunk_diameter_min_cm?: number;
    avg_trunk_diameter_max_cm?: number;
    wood_density_min?: number;
    wood_density_max?: number;
    wood_density_avg?: number;
    growth_rate_m_per_year?: number;
    co2_absorbed_kg_per_year?: number;
    co2_stored_mature_min_kg?: number;
    co2_stored_mature_max_kg?: number;
    co2_stored_mature_avg_kg?: number;
    decay_years_min?: number;
    decay_years_max?: number;
    carbon_fraction?: number;
    lumber_carbon_retention_pct?: number;
    burned_carbon_release_pct?: number;
    growth_speed_label?: string;
    is_active?: boolean;
    notes?: string;
}

export interface TreeSpeciesUpdate extends Partial<TreeSpeciesCreate> {}

// ==================== API Functions ====================

/**
 * Get all trees with optional filters
 */
export const getTrees = async (filters?: TreeFilters) => {
    const params: any = {};
    if (filters?.skip !== undefined) params.skip = filters.skip;
    if (filters?.limit !== undefined) params.limit = filters.limit;
    if (filters?.status) params.status = filters.status;
    if (filters?.health) params.health = filters.health;
    if (filters?.species) params.species = filters.species;
    if (filters?.barangay) params.barangay = filters.barangay;
    if (filters?.search) params.search = filters.search;

    console.log("getTrees API call - URL:", "/tree-inventory/trees");
    console.log("getTrees API call - params:", params);

    const response = await apiClient.get<TreeInventory[]>("/tree-inventory/trees", {
        params,
    });
    
    console.log("getTrees API response status:", response.status);
    console.log("getTrees API response data length:", response.data?.length || 0);
    
    return { data: response.data };
};

/**
 * Get trees within map bounds
 */
export const getTreesInBounds = async (params: BoundsParams) => {
    const response = await apiClient.get<TreeMapItem[]>("/tree-inventory/trees/bounds", {
        params,
    });
    return { data: response.data };
};

/**
 * Get tree clusters within map bounds (server-side PostGIS clustering)
 * Used for zoom levels < 16 to reduce data transfer
 */
export const getTreeClusters = async (params: BoundsParams) => {
    const response = await apiClient.get<any[]>("/tree-inventory/trees/clusters", {
        params,
    });
    
    // Transform backend response to match TreeCluster interface
    const clusters: TreeCluster[] = response.data.map((cluster: any) => ({
        latitude: cluster.cluster_lat,
        longitude: cluster.cluster_lng,
        count: cluster.tree_count,
        status: cluster.status,
        health: cluster.health,
    }));
    
    return { data: clusters };
};

/**
 * Get tree by ID
 */
export const getTreeById = async (id: string) => {
    const response = await apiClient.get<TreeInventory>(`/tree-inventory/trees/${id}`);
    return { data: response.data };
};

/**
 * Create a new tree
 */
export const createTree = async (data: TreeInventoryCreate) => {
    const response = await apiClient.post<TreeInventory>("/tree-inventory/trees", data);
    return { data: response.data };
};

/**
 * Update an existing tree
 */
export const updateTree = async (id: string, data: TreeInventoryUpdate) => {
    const response = await apiClient.put<TreeInventory>(`/tree-inventory/trees/${id}`, data);
    return { data: response.data };
};

/**
 * Delete a tree
 */
export const deleteTree = async (id: string) => {
    await apiClient.delete(`/tree-inventory/trees/${id}`);
    return { success: true };
};

/**
 * Get all tree species
 */
export const getSpecies = async (search?: string) => {
    const params = search ? { search } : undefined;
    const response = await apiClient.get<TreeSpecies[]>("/tree-inventory/species", { params });
    return { data: response.data };
};

/**
 * Get tree species by ID
 */
export const getSpeciesById = async (id: string) => {
    const response = await apiClient.get<TreeSpecies>(`/tree-inventory/species/${id}`);
    return { data: response.data };
};

/**
 * Create a new tree species
 */
export const createSpecies = async (data: TreeSpeciesCreate) => {
    const response = await apiClient.post<TreeSpecies>("/tree-inventory/species", data);
    return { data: response.data };
};

/**
 * Update a tree species
 */
export const updateSpecies = async (id: string, data: TreeSpeciesUpdate) => {
    const response = await apiClient.put<TreeSpecies>(`/tree-inventory/species/${id}`, data);
    return { data: response.data };
};

/**
 * Delete a tree species
 */
export const deleteSpecies = async (id: string) => {
    const response = await apiClient.delete<{
        message: string;
        trees_using_species: number;
        species_name: string;
    }>(`/tree-inventory/species/${id}`);
    return { data: response.data };
};

/**
 * Upload tree images
 */
export const uploadTreeImages = async (formData: FormData) => {
    const response = await apiClient.post<{ uploaded: { url: string; path: string; filename: string }[] }>(
        "/upload/tree-images",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return { data: response.data };
};

/**
 * Export API object for consistency
 */
export const treeInventoryApi = {
    getTrees,
    getTreesInBounds,
    getTreeClusters,
    getTreeById,
    createTree,
    updateTree,
    deleteTree,
    getSpecies,
    getSpeciesById,
    createSpecies,
    updateSpecies,
    deleteSpecies,
    uploadTreeImages,
};
