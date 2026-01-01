// client/src/core/api/upload-api.ts
/**
 * File Upload API Client
 * Handles image uploads to backend which stores in Supabase Storage
 */

import apiClient from "./api-client";

// ==================== Types ====================

export interface ImageUploadMetadata {
  url: string;
  path: string;
  filename: string;
  content_type: string;
  size: number;
  uploaded_at: string;
  uploaded_by_id: string;
  uploaded_by_email: string;
}

export interface ImageUploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  filename: string;
  content_type?: string;
  size?: number;
  uploaded_at?: string;
  uploaded_by_id?: string;
  uploaded_by_email?: string;
  error?: string;
}

export interface MultiImageUploadResponse {
  uploaded: ImageUploadResponse[];
  failed: ImageUploadResponse[];
  total_uploaded: number;
  total_failed: number;
}

// ==================== API Functions ====================

/**
 * Upload a single image for a tree
 */
export const uploadTreeImage = async (
  file: File,
  treeId?: string
): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  if (treeId) {
    formData.append("tree_id", treeId);
  }

  const response = await apiClient.post<ImageUploadResponse>(
    "/upload/tree-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

/**
 * Upload multiple images for a tree
 */
export const uploadTreeImages = async (
  files: File[],
  treeId?: string
): Promise<MultiImageUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  if (treeId) {
    formData.append("tree_id", treeId);
  }

  const response = await apiClient.post<MultiImageUploadResponse>(
    "/upload/tree-images",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

/**
 * Delete a tree image
 */
export const deleteTreeImage = async (path: string): Promise<void> => {
  await apiClient.delete("/upload/tree-image", {
    params: { path },
  });
};
