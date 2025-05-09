import React, { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Row } from "@tanstack/react-table";

export interface ViolationRate {
  id: string;
  category: string;
  level: number;
  amount: number;
  effectiveDate: string;
}

// Sample categories - replace with your actual categories
const categories = [
  "Driver",
  "Operator",
  "Vehicle Owner",
  "Transport Company",
  "Fleet Manager",
];

// Sample data - replace with actual data from your API
const sampleRates: ViolationRate[] = [
  {
    id: "1",
    category: "Driver",
    level: 1,
    amount: 5000,
    effectiveDate: "2024-01-01",
  },
  {
    id: "2",
    category: "Driver",
    level: 2,
    amount: 10000,
    effectiveDate: "2024-01-01",
  },
  {
    id: "3",
    category: "Operator",
    level: 1,
    amount: 10000,
    effectiveDate: "2024-01-01",
  },
];

interface FeeTableProps {
  onSave: (rate: ViolationRate) => Promise<void>;
  onDelete: (rate: ViolationRate) => Promise<void>;
}

const FeeTable: React.FC<FeeTableProps> = ({ onSave, onDelete }) => {
  const [rates, setRates] = useState<ViolationRate[]>(sampleRates);
  const [selectedRate, setSelectedRate] = useState<ViolationRate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<Omit<ViolationRate, "id">>({
    category: "",
    level: 1,
    amount: 0,
    effectiveDate: new Date().toISOString().split("T")[0],
  });
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleRowClick = (row: Row<ViolationRate>) => {
    const rate = row.original;
    setSelectedRate(rate);
    setFormData({
      category: rate.category,
      level: rate.level,
      amount: rate.amount,
      effectiveDate: rate.effectiveDate,
    });
    setIsEditing(false);
    setIsNew(false);
  };

  const handleNewRate = () => {
    setSelectedRate(null);
    setFormData({
      category: "",
      level: 1,
      amount: 0,
      effectiveDate: new Date().toISOString().split("T")[0],
    });
    setIsNew(true);
    setIsEditing(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (selectedRate) {
      setFormData({
        category: selectedRate.category,
        level: selectedRate.level,
        amount: selectedRate.amount,
        effectiveDate: selectedRate.effectiveDate,
      });
    }
    setIsEditing(false);
    setIsNew(false);
  };

  const handleSave = async () => {
    if (isNew) {
      const newRate: ViolationRate = {
        id: Math.random().toString(),
        ...formData,
      };
      await onSave(newRate);
      setRates([...rates, newRate]);
    } else if (selectedRate) {
      const updatedRate: ViolationRate = {
        ...selectedRate,
        ...formData,
      };
      await onSave(updatedRate);
      setRates(
        rates.map((rate) => (rate.id === selectedRate.id ? updatedRate : rate))
      );
    }
    setIsEditing(false);
    setIsNew(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRate) {
      setIsDeleting(true);
      try {
        await onDelete(selectedRate);
        setRates(rates.filter((rate) => rate.id !== selectedRate.id));
        setSelectedRate(null);
      } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
      }
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

  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "driver":
        return "bg-blue-500";
      case "operator":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const columns = [
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => (
        <Badge className={getCategoryBadgeColor(row.original.category)}>
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "level",
      header: "Violation Level",
      cell: ({ row }: any) => (
        <Badge className={getLevelBadgeColor(row.original.level)}>
          Level {row.original.level}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: "Fine Amount",
      cell: ({ row }: any) => `₱${row.original.amount.toLocaleString()}`,
    },
    {
      accessorKey: "effectiveDate",
      header: "Effective Date",
      cell: ({ row }: any) =>
        new Date(row.original.effectiveDate).toLocaleDateString(),
    },
  ];

  return (
    <div className="flex gap-8 h-[calc(100vh-12rem)]">
      <div className="w-1/2 flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Violation Rates
          </h2>
          <p className="text-sm text-gray-500">
            Select a rate to view or edit its details
          </p>
        </div>
        <div className="flex-1 overflow-auto">
          <DataTable
            columns={columns}
            data={rates}
            showDensityToggle={true}
            showColumnVisibility={true}
            showPagination={true}
            defaultPageSize={10}
            loadingMessage="Loading violation rates..."
            emptyMessage="No violation rates found."
            onRowClick={handleRowClick}
          />
        </div>
      </div>

      <div className="w-1/2 flex flex-col">
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">
                  {isNew
                    ? "New Violation Rate"
                    : selectedRate
                    ? "Rate Details"
                    : "Select a Rate"}
                </h2>
                <p className="text-sm text-gray-500">
                  {isNew
                    ? "Create a new violation rate"
                    : selectedRate
                    ? "View and manage rate details"
                    : "Click on a rate from the list to view its details"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleNewRate}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Rate
                </Button>
                {selectedRate && !isEditing && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleEdit}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Edit Rate
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteClick}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Rate
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {selectedRate || isNew ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Category
                  </Label>
                  {isEditing ? (
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between border-gray-300 hover:bg-gray-50"
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
                              <span className="text-sm text-gray-500">
                                No category found
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleAddCategory}
                                className="h-8 text-blue-600 hover:text-blue-700"
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
                  ) : (
                    <Badge
                      className={cn(
                        "text-sm px-3 py-1",
                        getCategoryBadgeColor(selectedRate?.category || "")
                      )}
                    >
                      {selectedRate?.category}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Violation Level
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="1"
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          level: Number(e.target.value),
                        })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <Badge
                      className={cn(
                        "text-sm px-3 py-1",
                        getLevelBadgeColor(selectedRate?.level || 0)
                      )}
                    >
                      Level {selectedRate?.level}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Amount (₱)
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amount: Number(e.target.value),
                        })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">
                      ₱{selectedRate?.amount.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Effective Date
                  </Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={formData.effectiveDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          effectiveDate: e.target.value,
                        })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">
                      {selectedRate?.effectiveDate &&
                        new Date(
                          selectedRate.effectiveDate
                        ).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2 pt-6 mt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                  Select a rate to view its details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Violation Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this violation rate? This action
              cannot be undone.
              {selectedRate && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{selectedRate.category}</p>
                  <p className="text-sm text-gray-600">
                    Level {selectedRate.level} - ₱
                    {selectedRate.amount.toLocaleString()}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FeeTable;
