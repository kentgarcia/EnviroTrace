// client/src/presentation/roles/urban-greening/pages/greening-projects/logic/useUrbanGreeningProjects.ts
/**
 * React Query hooks for Urban Greening Projects
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UrbanGreeningProject,
  UrbanGreeningProjectCreate,
  UrbanGreeningProjectUpdate,
  PlantingRecordCreate,
  ProjectStats,
  ProjectType,
  ProjectStatus,
  fetchUrbanGreeningProjects,
  fetchUrbanGreeningProject,
  createUrbanGreeningProject,
  updateUrbanGreeningProject,
  startProject,
  completeProject,
  addPlantingRecord,
  transferToInventory,
  fetchProjectStats,
  deleteUrbanGreeningProject,
} from "@/core/api/urban-greening-project-api";

const QUERY_KEY = "urban-greening-projects";
const STATS_KEY = "urban-greening-project-stats";

export const useUrbanGreeningProjects = (params?: {
  status?: ProjectStatus;
  type?: ProjectType;
  search?: string;
  year?: number;
}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchUrbanGreeningProjects({
      status: params?.status,
      project_type: params?.type,
      search: params?.search,
      year: params?.year,
    }),
    staleTime: 60_000,
  });
};

export const useUrbanGreeningProject = (id: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => (id ? fetchUrbanGreeningProject(id) : null),
    enabled: !!id,
    staleTime: 60_000,
  });
};

export const useProjectStats = () => {
  return useQuery({
    queryKey: [STATS_KEY],
    queryFn: fetchProjectStats,
    staleTime: 60_000,
  });
};

export const useUrbanGreeningProjectMutations = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [STATS_KEY] });
  };

  const createMutation = useMutation({
    mutationFn: (data: UrbanGreeningProjectCreate) => createUrbanGreeningProject(data),
    onSuccess: () => {
      toast.success("Project created successfully");
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UrbanGreeningProjectUpdate }) =>
      updateUrbanGreeningProject(id, data),
    onSuccess: () => {
      toast.success("Project updated successfully");
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update project: ${error.message}`);
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => startProject(id),
    onSuccess: () => {
      toast.success("Project started");
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(`Failed to start project: ${error.message}`);
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { notes?: string; survival_rate?: number } }) =>
      completeProject(id, data),
    onSuccess: () => {
      toast.success("Project completed successfully");
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(`Failed to complete project: ${error.message}`);
    },
  });

  const addPlantingMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Omit<PlantingRecordCreate, 'project_id'> }) =>
      addPlantingRecord(projectId, data),
    onSuccess: () => {
      toast.success("Planting recorded");
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(`Failed to record planting: ${error.message}`);
    },
  });

  const transferMutation = useMutation({
    mutationFn: ({ projectId, plantingIds }: { projectId: string; plantingIds: string[] }) =>
      transferToInventory(projectId, plantingIds),
    onSuccess: (result) => {
      toast.success(`${result.transferred_count} plants transferred to tree inventory`);
      invalidateQueries();
      // Refresh tree inventory
      queryClient.invalidateQueries({ queryKey: ["tree-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["tree-stats"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to transfer to inventory: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUrbanGreeningProject(id),
    onSuccess: () => {
      toast.success("Project deleted successfully");
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

  return {
    createMutation,
    updateMutation,
    startMutation,
    completeMutation,
    addPlantingMutation,
    transferMutation,
    deleteMutation,
  };
};
