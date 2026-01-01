/**
 * Tree Inventory System API Client (Mobile)
 * Unified API for tree lifecycle tracking
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add auth interceptor
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
}

// ==================== API Functions ====================

/**
 * Get trees within map bounds
 */
export const getTreesInBounds = async (params: BoundsParams) => {
    const response = await api.get<TreeMapItem[]>("/api/v1/tree-inventory/map/bounds", {
        params,
    });
    return { data: response.data };
};

/**
 * Get tree by ID
 */
export const getTreeById = async (id: string) => {
    const response = await api.get<TreeInventory>(`/api/v1/tree-inventory/${id}`);
    return { data: response.data };
};

/**
 * Export API object for consistency
 */
export const treeInventoryApi = {
    getTreesInBounds,
    getTreeById,
};
