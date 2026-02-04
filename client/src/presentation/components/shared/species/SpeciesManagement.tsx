// client/src/presentation/components/shared/species/SpeciesManagement.tsx
/**
 * Shared Species Management Component
 * Used by both Tree Inventory and Greening Projects for managing tree species
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTreeSpecies,
  createTreeSpecies,
  updateTreeSpecies,
  deleteTreeSpecies,
  TreeSpecies,
  TreeSpeciesCreate,
} from "@/core/api/tree-inventory-api";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Badge } from "@/presentation/components/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/presentation/components/shared/ui/dialog";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { useToast } from "@/core/hooks/ui/use-toast";
import {
  Leaf,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Check,
  Wind,
  Ruler,
  Info,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import SpeciesForm from "./SpeciesForm";

interface SpeciesManagementProps {
  title?: string;
  description?: string;
  variant?: "full" | "compact";
}

// Helper to format number or show dash
const formatNum = (val?: number, decimals = 2) =>
  val !== undefined && val !== null ? val.toFixed(decimals) : "—";

// Check if species has environmental data
const hasEnvData = (s: TreeSpecies) =>
  s.co2_absorbed_kg_per_year ||
  s.co2_stored_mature_avg_kg ||
  s.avg_mature_height_avg_m ||
  s.wood_density_avg;

const SpeciesManagement: React.FC<SpeciesManagementProps> = ({
  title = "Species Database",
  description = "Manage species with environmental impact data",
  variant = "full",
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedSpecies, setSelectedSpecies] = useState<TreeSpecies | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingSpecies, setDeletingSpecies] = useState<TreeSpecies | null>(null);

  // Fetch species
  const { data: species = [], isLoading } = useQuery({
    queryKey: ["tree-species", searchTerm],
    queryFn: () => fetchTreeSpecies(searchTerm),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createTreeSpecies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-species"] });
      toast({ title: "Success", description: "Species added successfully" });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to add species",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TreeSpeciesCreate> }) =>
      updateTreeSpecies(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-species"] });
      toast({ title: "Success", description: "Species updated successfully" });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update species",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTreeSpecies,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tree-species"] });
      toast({
        title: "Success",
        description: `Species deactivated. ${data.trees_using_species} tree(s) using this species.`,
      });
      setIsDeleteDialogOpen(false);
      setDeletingSpecies(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete species",
        variant: "destructive",
      });
    },
  });

  const handleAddSpecies = () => {
    setFormMode("add");
    setSelectedSpecies(null);
    setIsFormOpen(true);
  };

  const handleEditSpecies = (species: TreeSpecies) => {
    setFormMode("edit");
    setSelectedSpecies(species);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (species: TreeSpecies) => {
    setDeletingSpecies(species);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingSpecies) {
      deleteMutation.mutate(deletingSpecies.id);
    }
  };

  const handleFormSave = async (data: TreeSpeciesCreate) => {
    if (formMode === "add") {
      await createMutation.mutateAsync(data);
    } else if (selectedSpecies) {
      await updateMutation.mutateAsync({ id: selectedSpecies.id, data });
    }
  };

  // Define table columns
  const columns: ColumnDef<TreeSpecies>[] = [
    {
      accessorKey: "common_name",
      header: "Common Name",
      cell: ({ row }) => <span className="font-medium">{row.original.common_name}</span>,
    },
    {
      accessorKey: "scientific_name",
      header: "Scientific Name",
      cell: ({ row }) => (
        <span className="italic text-gray-600 dark:text-gray-400">{row.original.scientific_name || "—"}</span>
      ),
    },
    {
      accessorKey: "family",
      header: "Family",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{row.original.family || "—"}</span>
      ),
    },
    {
      accessorKey: "species_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.species_type || "Tree";
        const badgeClasses = {
          Tree: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
          Ornamental: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800",
          Seed: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800",
          Other: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
        };
        const defaultClass = "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800";
        const badgeClass = badgeClasses[type as keyof typeof badgeClasses] || defaultClass;
        
        return (
          <div className="flex justify-center">
            <Badge className={badgeClass}>
              {type}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "is_native",
      header: "Native",
      cell: ({ row }) =>
        row.original.is_native ? (
          <div className="flex justify-center">
            <Badge className="bg-green-100 text-green-800">
              <Check className="w-3 h-3" />
            </Badge>
          </div>
        ) : (
          <div className="text-center text-gray-400">—</div>
        ),
    },
    {
      accessorKey: "is_endangered",
      header: "Endangered",
      cell: ({ row }) =>
        row.original.is_endangered ? (
          <div className="flex justify-center">
            <Badge className="bg-red-100 text-red-800">
              <AlertTriangle className="w-3 h-3" />
            </Badge>
          </div>
        ) : (
          <div className="text-center text-gray-400">—</div>
        ),
    },
    {
      accessorKey: "co2_absorbed_kg_per_year",
      header: "CO₂/yr",
      cell: ({ row }) =>
        row.original.co2_absorbed_kg_per_year ? (
          <div className="text-center text-sm">
            <span className="text-green-700 dark:text-green-400 font-medium">
              {formatNum(row.original.co2_absorbed_kg_per_year, 1)} kg
            </span>
          </div>
        ) : (
          <div className="text-center text-gray-400 dark:text-gray-500">—</div>
        ),
    },
    {
      accessorKey: "growth_speed_label",
      header: "Growth",
      cell: ({ row }) =>
        row.original.growth_speed_label ? (
          <div className="flex justify-center">
            <Badge
              className={
                row.original.growth_speed_label === "Fast"
                  ? "bg-green-100 text-green-800"
                  : row.original.growth_speed_label === "Moderate"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-700"
              }
            >
              {row.original.growth_speed_label}
            </Badge>
          </div>
        ) : (
          <div className="text-center text-gray-400">—</div>
        ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.is_active ? (
            <Badge className="bg-blue-100 text-blue-800">Active</Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditSpecies(row.original)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteClick(row.original)}
            className="h-8 w-8 p-0"
            disabled={!row.original.is_active}
          >
            <Trash2
              className={`h-4 w-4 ${row.original.is_active ? "text-red-600" : "text-gray-400"}`}
            />
          </Button>
        </div>
      ),
    },
  ];

  // Expandable row content
  const renderRowSubComponent = ({ row }: { row: any }) => {
    const s = row.original as TreeSpecies;
    if (!hasEnvData(s)) return null;

    return (
      <div className="bg-blue-50/30 dark:bg-blue-900/10 py-3 px-6">
        <div className="grid grid-cols-4 gap-6 text-sm">
          {/* Physical Data */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
              <Ruler className="w-4 h-4" />
              Physical Data
            </div>
            <div className="space-y-1 text-gray-600 dark:text-gray-400">
              <p>
                Height: {formatNum(s.avg_mature_height_min_m, 0)}–
                {formatNum(s.avg_mature_height_max_m, 0)} m (avg{" "}
                {formatNum(s.avg_mature_height_avg_m, 0)} m)
              </p>
              <p>
                Diameter: {formatNum(s.avg_trunk_diameter_min_cm, 0)}–
                {formatNum(s.avg_trunk_diameter_max_cm, 0)} cm
              </p>
              <p>
                Wood Density: {formatNum(s.wood_density_min)}–
                {formatNum(s.wood_density_max)} g/cm³
              </p>
              <p>Growth Rate: {formatNum(s.growth_rate_m_per_year)} m/yr</p>
            </div>
          </div>

          {/* Carbon Data */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 font-medium text-green-700 dark:text-green-400">
              <Wind className="w-4 h-4" />
              Carbon / CO₂
            </div>
            <div className="space-y-1 text-gray-600 dark:text-gray-400">
              <p>
                CO₂ Absorbed: {formatNum(s.co2_absorbed_kg_per_year, 1)} kg/year
              </p>
              <p>
                CO₂ at Maturity: {formatNum(s.co2_stored_mature_min_kg, 0)}–
                {formatNum(s.co2_stored_mature_max_kg, 0)} kg
              </p>
              <p>Carbon Fraction: {formatNum(s.carbon_fraction)}</p>
            </div>
          </div>

          {/* Removal Impact */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 font-medium text-red-700 dark:text-red-400">
              <Trash2 className="w-4 h-4" />
              Removal Impact
            </div>
            <div className="space-y-1 text-gray-600 dark:text-gray-400">
              <p>
                Decay Years: {s.decay_years_min ?? "—"}–{s.decay_years_max ?? "—"} yrs
              </p>
              <p>
                Lumber Retention:{" "}
                {s.lumber_carbon_retention_pct
                  ? `${(s.lumber_carbon_retention_pct * 100).toFixed(0)}%`
                  : "—"}
              </p>
              <p>
                Burned Release:{" "}
                {s.burned_carbon_release_pct
                  ? `${(s.burned_carbon_release_pct * 100).toFixed(0)}%`
                  : "—"}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
              <Info className="w-4 h-4" />
              Notes
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {s.notes || s.description || "No additional notes"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            {title}
          </CardTitle>
          <Button
            onClick={handleAddSpecies}
            className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Species
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name (common, scientific, or local)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg"
            />
          </div>

          {/* Data Table with Pagination */}
          <DataTable
            columns={columns}
            data={species}
            isLoading={isLoading}
            loadingMessage="Loading species..."
            emptyMessage={
              searchTerm
                ? "No species found matching your search."
                : "No species in database yet."
            }
            showPagination={true}
            pageSizeOptions={[10, 25, 50, 100]}
            renderRowSubComponent={renderRowSubComponent}
            expandedRowIds={{}}
            onExpandedChange={() => {}}
            showDensityToggle={false}
            showColumnVisibility={false}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl p-0 rounded-2xl border-none overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="bg-[#0033a0] dark:bg-gray-800 p-6 m-0 border-none">
            <DialogTitle>
              {formMode === "add"
                ? "Add Tree Species"
                : `Edit Species: ${selectedSpecies?.common_name}`}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto">
            <SpeciesForm
              mode={formMode}
              initialData={selectedSpecies || undefined}
              onSave={handleFormSave}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Species</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to deactivate{" "}
              <strong>{deletingSpecies?.common_name}</strong>?
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This species will be marked as inactive and won't appear in selection lists.
              Existing records using this species will not be affected.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="rounded-lg"
            >
              {deleteMutation.isPending ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SpeciesManagement;
