// client/src/presentation/roles/urban-greening/pages/tree-inventory/components/SpeciesManagement.tsx
/**
 * Species Management Component - List, Add, Edit, Delete tree species
 */

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import {
  Leaf,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Check,
  X
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { TreeSpecies } from "@/core/api/tree-inventory-api";
import SpeciesForm from "./SpeciesForm";
import { useSpeciesManagement } from "../logic/useSpeciesManagement";

const SpeciesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedSpecies, setSelectedSpecies] = useState<TreeSpecies | null>(null);

  const {
    species,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
    refetch
  } = useSpeciesManagement(searchTerm);

  // Table columns
  const columns: ColumnDef<TreeSpecies>[] = [
    {
      accessorKey: "common_name",
      header: "Common Name",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.common_name}</div>
      ),
    },
    {
      accessorKey: "scientific_name",
      header: "Scientific Name",
      cell: ({ row }) => (
        <div className="italic text-gray-700">{row.original.scientific_name || "—"}</div>
      ),
    },
    {
      accessorKey: "local_name",
      header: "Local Name",
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">{row.original.local_name || "—"}</div>
      ),
    },
    {
      accessorKey: "family",
      header: "Family",
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">{row.original.family || "—"}</div>
      ),
    },
    {
      accessorKey: "is_native",
      header: "Native",
      cell: ({ row }) => (
        row.original.is_native ? (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
            <Check className="w-3 h-3" /> Yes
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-600 flex items-center gap-1 w-fit">
            <X className="w-3 h-3" /> No
          </Badge>
        )
      ),
    },
    {
      accessorKey: "is_endangered",
      header: "Endangered",
      cell: ({ row }) => (
        row.original.is_endangered ? (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3" /> Yes
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-600 flex items-center gap-1 w-fit">
            <X className="w-3 h-3" /> No
          </Badge>
        )
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        row.original.is_active ? (
          <Badge className="bg-blue-100 text-blue-800">Active</Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
        )
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditSpecies(row.original);
            }}
            className="h-8 w-8 p-0"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteSpecies(row.original);
            }}
            className="h-8 w-8 p-0"
            disabled={!row.original.is_active}
          >
            <Trash2 className={`w-4 h-4 ${row.original.is_active ? 'text-red-600' : 'text-gray-400'}`} />
          </Button>
        </div>
      ),
    },
  ];

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

  const handleDeleteSpecies = async (species: TreeSpecies) => {
    const confirmMsg = `Are you sure you want to deactivate "${species.common_name}"?\n\nThis will mark it as inactive. Existing trees using this species will not be affected.`;
    
    if (confirm(confirmMsg)) {
      try {
        const result = await deleteMutation.mutateAsync(species.id);
        
        if (result.trees_using_species > 0) {
          alert(
            `Species "${result.species_name}" has been deactivated.\n\n` +
            `Note: ${result.trees_using_species} tree(s) are currently using this species. ` +
            `They will continue to display this species name.`
          );
        }
      } catch (error: any) {
        alert(`Error: ${error.message || "Failed to delete species"}`);
      }
    }
  };

  const handleFormSave = async (data: any) => {
    if (formMode === "add") {
      await createMutation.mutateAsync(data);
    } else if (selectedSpecies) {
      await updateMutation.mutateAsync({ id: selectedSpecies.id, data });
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            Tree Species Database
          </CardTitle>
          <Button
            onClick={handleAddSpecies}
            className="bg-[#0033a0] hover:bg-[#002a80]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Species
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name (common, scientific, or local)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Data Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading species...</p>
              </div>
            </div>
          ) : species.length === 0 ? (
            <div className="text-center py-12">
              <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm ? "No species found matching your search." : "No species in database yet."}
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleAddSpecies}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Species
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded border border-gray-100">
              <DataTable
                data={species}
                columns={columns}
              />
            </div>
          )}

          {/* Results Count */}
          {species.length > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              Showing {species.length} species
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl p-0 rounded-2xl border-none overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="bg-[#0033a0] p-6 m-0 border-none">
            <DialogTitle className="text-xl font-bold text-white">
              {formMode === "add" ? "Add Tree Species" : `Edit Species: ${selectedSpecies?.common_name}`}
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
    </div>
  );
};

export default SpeciesManagement;
