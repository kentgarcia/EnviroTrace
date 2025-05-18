import React, { useState, useEffect } from "react";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { Button } from "@/presentation/components/shared/ui/button";
import { Plus, Save, X } from "lucide-react";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/presentation/components/shared/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/presentation/components/shared/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/components/shared/ui/alert-dialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { Row } from "@tanstack/react-table";
import {
  fetchBelchingFees,
  createBelchingFee,
  updateBelchingFee,
  deleteBelchingFee,
} from "@/lib/api/belching-api";

export interface ViolationRate {
  id: string;
  category: string;
  level: number;
  amount: number;
  effectiveDate: string;
}

const FeeTable: React.FC = () => {
  const [rates, setRates] = useState<ViolationRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ViolationRate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<Omit<ViolationRate, "id">>({
    category: "",
    level: 0,
    amount: 0,
    effectiveDate: new Date().toISOString().split("T")[0],
  });
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetchBelchingFees().then((fees) => {
      setRates(
        fees.map((fee) => ({
          id: fee.id,
          category: fee.category,
          level: fee.level ?? 0,
          amount: fee.amount,
          effectiveDate: fee.effectiveDate || "",
        }))
      );
    });
  }, []);

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
      const apiInput = {
        amount: formData.amount,
        category: formData.category,
        level: formData.level,
        effectiveDate: formData.effectiveDate,
      };
      const newFee = await createBelchingFee(apiInput);
      setRates([
        ...rates,
        {
          id: newFee.id,
          category: newFee.category,
          level: newFee.level,
          amount: newFee.amount,
          effectiveDate: newFee.effectiveDate || "",
        },
      ]);
    } else if (selectedRate) {
      const apiInput = {
        amount: formData.amount,
        category: formData.category,
        level: formData.level,
        effectiveDate: formData.effectiveDate,
      };
      const updatedFee = await updateBelchingFee(selectedRate.id, apiInput);
      setRates(
        rates.map((rate) =>
          rate.id === selectedRate.id
            ? {
                ...rate,
                ...formData,
                amount: updatedFee.amount,
                category: updatedFee.category,
                level: updatedFee.level,
                effectiveDate: updatedFee.effectiveDate || "",
              }
            : rate
        )
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
        await deleteBelchingFee(selectedRate.id);
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

  // Compute unique categories from rates
  const categories = Array.from(
    new Set(rates.map((rate) => rate.category))
  ).filter(Boolean);

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
            className="bg-white border border-gray-200 rounded-none shadow-none"
          />
        </div>
      </div>

      <div className="w-1/2 flex flex-col">
        <div className="bg-white border border-gray-200 rounded-none shadow-none">
          <div className="p-6 border-b border-gray-200">
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
                  className="bg-blue-500 hover:bg-blue-600 text-white border-none shadow-none rounded-none"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Rate
                </Button>
                {selectedRate && !isEditing && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleEdit}
                      className="border border-gray-300 bg-white hover:bg-gray-100 shadow-none rounded-none"
                    >
                      Edit Rate
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteClick}
                      className="bg-red-500 hover:bg-red-600 text-white border-none shadow-none rounded-none"
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
                          className="w-full justify-between border border-gray-300 bg-white hover:bg-gray-100 shadow-none rounded-none"
                        >
                          {formData.category || "Select category..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 border border-gray-200 bg-white rounded-none shadow-none">
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
                                className="h-8 text-blue-600 hover:text-blue-700 border-none shadow-none rounded-none"
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
                                className="rounded-none"
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
                        "text-sm px-3 py-1 border-none shadow-none rounded-none bg-gray-200 text-gray-800",
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
                      min="0"
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          level: Number(e.target.value),
                        })
                      }
                      className="border border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 shadow-none rounded-none"
                    />
                  ) : (
                    <Badge
                      className={cn(
                        "text-sm px-3 py-1 border-none shadow-none rounded-none bg-gray-200 text-gray-800",
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
                      className="border border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 shadow-none rounded-none"
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
                      className="border border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 shadow-none rounded-none"
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
                  <div className="flex justify-end space-x-2 pt-6 mt-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="border border-gray-300 bg-white hover:bg-gray-100 shadow-none rounded-none"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-blue-500 hover:bg-blue-600 text-white border-none shadow-none rounded-none"
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
        <AlertDialogContent className="bg-white border border-gray-200 rounded-none shadow-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Violation Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this violation rate? This action
              cannot be undone.
              {selectedRate && (
                <div className="mt-2 p-3 bg-gray-100 rounded-none border border-gray-200">
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
            <AlertDialogCancel
              disabled={isDeleting}
              className="bg-white border border-gray-300 text-gray-700 shadow-none rounded-none"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white border-none shadow-none rounded-none focus:ring-red-500"
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
