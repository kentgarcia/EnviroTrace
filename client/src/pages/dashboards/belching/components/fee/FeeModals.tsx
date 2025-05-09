import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViolationRate } from "./FeeTable";

// Sample categories - replace with your actual categories
const categories = [
  "Driver",
  "Operator",
  "Vehicle Owner",
  "Transport Company",
  "Fleet Manager",
];

interface FeeModalsProps {
  isAddModalOpen: boolean;
  onAddModalClose: () => void;
  onAddRate: (rate: Omit<ViolationRate, "id">) => Promise<void>;
  isEditModalOpen: boolean;
  onEditModalClose: () => void;
  onEditRate: (rate: ViolationRate) => Promise<void>;
  selectedRate: ViolationRate | null;
  isViewModalOpen: boolean;
  onViewModalClose: () => void;
  isDeleteDialogOpen: boolean;
  onDeleteDialogClose: () => void;
  onDeleteRate: () => Promise<void>;
  isSubmitting: boolean;
}

export const FeeModals: React.FC<FeeModalsProps> = ({
  isAddModalOpen,
  onAddModalClose,
  onAddRate,
  isEditModalOpen,
  onEditModalClose,
  onEditRate,
  selectedRate,
  isViewModalOpen,
  onViewModalClose,
  isDeleteDialogOpen,
  onDeleteDialogClose,
  onDeleteRate,
  isSubmitting,
}) => {
  const [formData, setFormData] = React.useState<Omit<ViolationRate, "id">>({
    category: "",
    level: 1,
    amount: 0,
    description: "",
    effectiveDate: new Date().toISOString().split("T")[0],
  });
  const [open, setOpen] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState("");

  React.useEffect(() => {
    if (selectedRate) {
      setFormData({
        category: selectedRate.category,
        level: selectedRate.level,
        amount: selectedRate.amount,
        description: selectedRate.description,
        effectiveDate: selectedRate.effectiveDate,
      });
    }
  }, [selectedRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditModalOpen && selectedRate) {
      await onEditRate({ ...formData, id: selectedRate.id });
    } else {
      await onAddRate(formData);
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      categories.push(newCategory);
      setFormData({ ...formData, category: newCategory });
      setNewCategory("");
    }
    setOpen(false);
  };

  return (
    <>
      {/* Add/Edit Modal */}
      <Dialog
        open={isAddModalOpen || isEditModalOpen}
        onOpenChange={onAddModalClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditModalOpen ? "Edit Violation Rate" : "Add Violation Rate"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {formData.category || "Select category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search category..."
                      value={newCategory}
                      onValueChange={setNewCategory}
                    />
                    <CommandEmpty>
                      <div className="flex items-center justify-between p-2">
                        <span>No category found</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleAddCategory}
                          className="h-8"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add "{newCategory}"
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {categories.map((category) => (
                        <CommandItem
                          key={category}
                          value={category}
                          onSelect={() => {
                            setFormData({ ...formData, category });
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.category === category
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {category}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Violation Level</Label>
              <Input
                id="level"
                type="number"
                min="1"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: Number(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₱)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) =>
                  setFormData({ ...formData, effectiveDate: e.target.value })
                }
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onAddModalClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={onViewModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Violation Rate</DialogTitle>
          </DialogHeader>
          {selectedRate && (
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <p className="text-sm">{selectedRate.category}</p>
              </div>
              <div>
                <Label>Violation Level</Label>
                <p className="text-sm">{selectedRate.level}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="text-sm">
                  ₱{selectedRate.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">{selectedRate.description}</p>
              </div>
              <div>
                <Label>Effective Date</Label>
                <p className="text-sm">
                  {new Date(selectedRate.effectiveDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Violation Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this violation rate? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteRate}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
