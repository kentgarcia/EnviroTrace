import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchTreeSpecies, 
  createTreeSpecies, 
  updateTreeSpecies, 
  deleteTreeSpecies,
  TreeSpecies,
  TreeSpeciesCreate
} from "@/core/api/tree-inventory-api";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/presentation/components/shared/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/shared/ui/table";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { useToast } from "@/core/hooks/ui/use-toast";
import { Search, Plus, Edit, Trash2, Leaf } from "lucide-react";

const SpeciesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<TreeSpecies | null>(null);
  const [deletingSpecies, setDeletingSpecies] = useState<TreeSpecies | null>(null);
  const [formData, setFormData] = useState<TreeSpeciesCreate>({
    common_name: "",
    scientific_name: "",
    description: "",
  });

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
      toast({
        title: "Success",
        description: "Species added successfully",
      });
      resetForm();
      setIsDialogOpen(false);
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
      toast({
        title: "Success",
        description: "Species updated successfully",
      });
      resetForm();
      setIsDialogOpen(false);
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
        description: `Species deactivated successfully. ${data.trees_using_species} tree(s) are using this species.`,
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

  const resetForm = () => {
    setFormData({
      common_name: "",
      scientific_name: "",
      description: "",
    });
    setEditingSpecies(null);
  };

  const handleOpenDialog = (species?: TreeSpecies) => {
    if (species) {
      setEditingSpecies(species);
      setFormData({
        common_name: species.common_name,
        scientific_name: species.scientific_name || "",
        description: species.description || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSpecies) {
      updateMutation.mutate({ id: editingSpecies.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0033a0]">Species Reference</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Maintain uniform species names for categorization
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Species
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search species..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-lg"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Species Name</TableHead>
              <TableHead>Scientific Name</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Loading species...
                </TableCell>
              </TableRow>
            ) : species.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  {searchTerm ? "No species found" : "No species added yet. Add species to ensure uniform naming."}
                </TableCell>
              </TableRow>
            ) : (
              species.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.common_name}</TableCell>
                  <TableCell className="italic text-gray-500">{s.scientific_name || "—"}</TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-xs truncate">{s.description || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(s)}
                        className="rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(s)}
                        className="rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSpecies ? "Edit Species" : "Add New Species"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="common_name">
                  Species Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="common_name"
                  value={formData.common_name}
                  onChange={(e) =>
                    setFormData({ ...formData, common_name: e.target.value })
                  }
                  className="rounded-lg"
                  placeholder="e.g., Mahogany, Narra, Mango"
                  required
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="scientific_name">Scientific Name (Optional)</Label>
                <Input
                  id="scientific_name"
                  value={formData.scientific_name}
                  onChange={(e) =>
                    setFormData({ ...formData, scientific_name: e.target.value })
                  }
                  className="rounded-lg italic"
                  placeholder="e.g., Swietenia macrophylla"
                />
              </div>

              <div>
                <Label htmlFor="description">Notes (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="rounded-lg"
                  rows={2}
                  placeholder="Any additional information about this species"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
              >
                {editingSpecies ? "Save Changes" : "Add Species"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Species</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to remove <strong>{deletingSpecies?.common_name}</strong> from the species list?
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This species will be marked as inactive and won't appear in autocomplete.
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
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpeciesManagement;
