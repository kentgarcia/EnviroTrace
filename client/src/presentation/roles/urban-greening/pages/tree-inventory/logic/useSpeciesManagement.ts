// client/src/presentation/roles/urban-greening/pages/tree-inventory/logic/useSpeciesManagement.ts
/**
 * Hooks for managing tree species
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTreeSpecies,
  createTreeSpecies,
  updateTreeSpecies,
  deleteTreeSpecies,
  TreeSpecies,
  TreeSpeciesCreate,
} from "@/core/api/tree-inventory-api";
import { useDebounce } from "@/core/hooks/useDebounce";

export const useSpeciesManagement = (searchTerm: string = "") => {
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch species with search
  const { data: species = [], isLoading, refetch } = useQuery({
    queryKey: ["tree-species", debouncedSearch],
    queryFn: () => fetchTreeSpecies(debouncedSearch || undefined),
  });

  // Create species mutation
  const createMutation = useMutation({
    mutationFn: createTreeSpecies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-species"] });
    },
  });

  // Update species mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TreeSpeciesCreate> }) =>
      updateTreeSpecies(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-species"] });
    },
  });

  // Delete species mutation (soft delete)
  const deleteMutation = useMutation({
    mutationFn: deleteTreeSpecies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-species"] });
    },
  });

  return {
    species,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
    refetch,
  };
};
