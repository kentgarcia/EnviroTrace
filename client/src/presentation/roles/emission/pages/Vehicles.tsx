/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import {
  SortingState,
  PaginationState,
  VisibilityState,
  ColumnFilter,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table";
import { NetworkStatus } from "@/presentation/components/shared/layout/NetworkStatus";
import { formatDate } from "@/core/utils/dateUtils";
import {
  useVehicles,
  useFilterOptions,
  useAddVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  useOffices,
  Vehicle,
  VehicleFilters,
  VehicleFormInput,
} from "@/core/api/emission-service";
import { useDebounce } from "@/hooks/useDebounce";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import {
  VehicleTable,
  VehicleTableSkeleton,
} from "@/presentation/roles/emission/components/vehicles/VehicleTable";
import { VehicleModals } from "@/presentation/roles/emission/components/vehicles/VehicleModals";
import { VehicleDetails } from "@/presentation/roles/emission/components/vehicles/VehicleDetails";
import { FileDown, Plus, AlertTriangle, Search, Filter, X } from "lucide-react";
import { toast } from "sonner";
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/presentation/components/shared/ui/alert";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/presentation/components/shared/ui/dropdown-menu";
import { Badge } from "@/presentation/components/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/presentation/components/shared/ui/pagination";

export default function Vehicles() {
  // Modal and dialog states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25, // Increased from 10 to 25 for better scalability
  });

  // Filter states
  const [search, setSearch] = useState("");
  const [office, setOffice] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [engineType, setEngineType] = useState("");

  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 300); // 300ms delay

  // Build filters object using debounced search
  const filters: VehicleFilters = useMemo(() => {
    const result: VehicleFilters = {};

    if (debouncedSearch) result.search = debouncedSearch;
    if (office) result.office_name = office;
    if (vehicleType) result.vehicle_type = vehicleType;
    if (engineType) result.engine_type = engineType;

    return result;
  }, [debouncedSearch, office, vehicleType, engineType]);

  // Get vehicles data using the new API service
  const {
    data: vehiclesData,
    isLoading,
    error,
  } = useVehicles(
    filters,
    pagination.pageIndex * pagination.pageSize,
    pagination.pageSize
  );
  // Get filter options from the API
  const {
    data: filterOptions,
    isLoading: isLoadingOptions,
  } = useFilterOptions();

  // Get offices for office name/ID conversion
  const { data: officesData } = useOffices();
  const officesList = officesData?.offices || [];
  // Use mutation hooks for CRUD operations
  const addVehicleMutation = useAddVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  // Helper functions for office name/ID conversion
  const getOfficeIdByName = (officeName: string): string | undefined => {
    const office = officesList.find(office => office.name === officeName);
    return office?.id;
  };

  const getOfficeNameById = (officeId: string): string => {
    const office = officesList.find(office => office.id === officeId);
    return office?.name || "Unknown Office";
  };
  // Get array of vehicles
  const vehicles = useMemo(() => {
    return vehiclesData?.vehicles || [];
  }, [vehiclesData]);

  // Get unique values for filters
  const offices = useMemo(() => filterOptions?.offices || [], [filterOptions]);
  const vehicleTypes = useMemo(
    () => filterOptions?.vehicle_types || [],
    [filterOptions]
  );
  const engineTypes = useMemo(() => filterOptions?.engine_types || [], [
    filterOptions,
  ]);
  const wheelCounts = useMemo(() => filterOptions?.wheels || [], [filterOptions]);

  // Row selection state
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  // Handler for viewing vehicle details
  const handleViewVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setViewModalOpen(true);
  }, []);

  // Handler for editing vehicle
  const handleEditVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditModalOpen(true);
  }, []);

  // Handler for deleting vehicle
  const handleDeleteConfirm = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDeleteDialogOpen(true);
  }, []);// Handler for saving edited vehicle
  const handleSaveEdit = async (vehicleData: VehicleFormInput) => {
    if (!selectedVehicle) return;

    // Find the office ID by office name
    const officeId = getOfficeIdByName(vehicleData.officeName); if (!officeId) {
      toast.error(`Office "${vehicleData.officeName}" not found`);
      return;
    }

    // Convert from UI VehicleFormInput to API VehicleInput
    const apiVehicleData = {
      driver_name: vehicleData.driverName,
      contact_number: vehicleData.contactNumber,
      engine_type: vehicleData.engineType,
      office_id: officeId,
      plate_number: vehicleData.plateNumber,
      vehicle_type: vehicleData.vehicleType,
      wheels: vehicleData.wheels
    };

    try {
      await updateVehicleMutation.mutateAsync({
        id: selectedVehicle.id,
        vehicleData: apiVehicleData,
      });

      toast.success("Vehicle updated successfully");
      setEditModalOpen(false);
      setSelectedVehicle(null);
    } catch (error: any) {
      console.error("Error updating vehicle:", error);
      toast.error(error.response?.data?.detail || "Failed to update vehicle");
    }
  };  // Handler for adding new vehicle
  const handleAddVehicle = (vehicle: VehicleFormInput) => {
    // Find the office ID by office name
    const officeId = getOfficeIdByName(vehicle.officeName);
    if (!officeId) {
      toast.error(`Office "${vehicle.officeName}" not found`);
      return;
    }    // Convert from UI VehicleFormInput to API VehicleInput
    const apiVehicle = {
      driver_name: vehicle.driverName,
      contact_number: vehicle.contactNumber,
      engine_type: vehicle.engineType,
      office_id: officeId,
      plate_number: vehicle.plateNumber,
      vehicle_type: vehicle.vehicleType,
      wheels: vehicle.wheels
    };

    addVehicleMutation.mutate(apiVehicle, {
      onSuccess: () => {
        toast.success("Vehicle added successfully");
        setAddModalOpen(false);
      },
      onError: (error: any) => {
        console.error("Error adding vehicle:", error);
        toast.error(error.response?.data?.detail || "Failed to add vehicle");
      }
    });
  };

  // Handler for deleting vehicle
  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    try {
      await deleteVehicleMutation.mutateAsync(selectedVehicle.id);
      toast.success("Vehicle deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedVehicle(null);
      setRowSelection({});
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      toast.error(error.response?.data?.detail || "Failed to delete vehicle");
    }
  };

  // Handler for deleting selected vehicles
  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    toast.info(
      `${selectedIds.length} vehicles would be deleted. This feature is not yet implemented.`
    );
    // Implementation would go here
  };
  // Export vehicles to CSV
  const handleExportToCSV = () => {
    if (vehicles.length === 0) {
      toast.warning("No vehicle data to export");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent +=
      "Plate Number,Office,Driver,Vehicle Type,Engine Type,Wheels,Contact\n";

    vehicles.forEach((vehicle) => {
      const officeName = vehicle.office?.name || "Unknown Office";

      csvContent += `"${vehicle.plate_number}","${officeName}","${vehicle.driver_name
        }","${vehicle.vehicle_type}","${vehicle.engine_type}","${vehicle.wheels
        }","${vehicle.contact_number || ""}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `vehicles_report_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Vehicle data exported successfully");
  };

  // Stats for the tabs - since test data is not fetched, show simplified stats
  const stats = useMemo(() => {
    const allCount = vehicles.length;
    // Without test data, we can't calculate passed/failed/untested counts
    // These would require separate API calls if needed
    return {
      all: allCount,
      passed: 0, // Would need separate API call
      failed: 0, // Would need separate API call
      untested: 0, // Would need separate API call
    };
  }, [vehicles]);

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setOffice("");
    setVehicleType("");
    setEngineType("");
  };

  return (
    <>
      <div className="flex min-h-screen w-full">
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavBarContainer dashboardType="government-emission" />

          {/* Header Section */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200 shadow-none">
            <h1 className="text-2xl font-semibold text-gray-900">Vehicles</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setAddModalOpen(true)}
                className="hidden md:inline-flex text-white border-none shadow-none rounded-none"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
              <Button
                onClick={handleExportToCSV}
                variant="outline"
                size="icon"
                disabled={vehicles.length === 0 || isLoading}
                className="border border-gray-200 bg-white shadow-none rounded-none"
              >
                <FileDown className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            {/* Controls Row: Search left, Filters right */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">              {/* Search (left) */}
              <div className="relative flex items-center w-full md:w-auto justify-start bg-white rounded-md">
                <Input
                  placeholder="Search by plate, driver, or office..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 max-w-xs w-[320px] bg-white"
                />
                <span className="absolute left-3 text-gray-400">
                  {search && search !== debouncedSearch ? (
                    <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </span>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {/* Filters (right) */}
              <div className="flex flex-wrap gap-2 items-center justify-end">
                {/* Office Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="min-w-[140px] justify-between bg-white border border-gray-200 shadow-none rounded-none"
                    >
                      {office ? office : "All Offices"}
                      <span className="ml-2 text-gray-400 flex items-center">
                        <Filter className="h-4 w-4" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="bg-white border border-gray-200 shadow-none rounded-none"
                  >
                    <DropdownMenuItem
                      onClick={() => setOffice("")}
                      className="rounded-none"
                    >
                      All Offices
                    </DropdownMenuItem>
                    {offices.map((o) => (
                      <DropdownMenuItem
                        key={o}
                        onClick={() => setOffice(o)}
                        className="rounded-none"
                      >
                        {o}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Vehicle Type Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="min-w-[120px] justify-between bg-white border border-gray-200 shadow-none rounded-none"
                    >
                      {vehicleType ? vehicleType : "All Types"}
                      <span className="ml-2 text-gray-400 flex items-center">
                        <Filter className="h-4 w-4" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="bg-white border border-gray-200 shadow-none rounded-none"
                  >
                    <DropdownMenuItem
                      onClick={() => setVehicleType("")}
                      className="rounded-none"
                    >
                      All Types
                    </DropdownMenuItem>
                    {vehicleTypes.map((t) => (
                      <DropdownMenuItem
                        key={t}
                        onClick={() => setVehicleType(t)}
                        className="rounded-none"
                      >
                        {t}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Engine Type Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="min-w-[120px] justify-between bg-white border border-gray-200 shadow-none rounded-none"
                    >
                      {engineType ? engineType : "All Engines"}
                      <span className="ml-2 text-gray-400 flex items-center">
                        <Filter className="h-4 w-4" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="bg-white border border-gray-200 shadow-none rounded-none"
                  >
                    <DropdownMenuItem
                      onClick={() => setEngineType("")}
                      className="rounded-none"
                    >
                      All Engines
                    </DropdownMenuItem>
                    {engineTypes.map((e) => (
                      <DropdownMenuItem
                        key={e}
                        onClick={() => setEngineType(e)}
                        className="rounded-none"
                      >
                        {e}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <Alert
                variant="destructive"
                className="mb-4 border border-red-200 bg-white shadow-none rounded-none"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was a problem loading the vehicles data. Please try
                  again later.
                </AlertDescription>
              </Alert>
            )}

            {/* Selection Controls */}
            {Object.keys(rowSelection).length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-none flex items-center justify-between shadow-none">
                <p className="text-sm">
                  <span className="font-medium">
                    {Object.keys(rowSelection).length}
                  </span>{" "}
                  vehicles selected
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRowSelection({})}
                    className="border border-gray-200 bg-white shadow-none rounded-none"
                  >
                    Deselect All
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    className="bg-red-600 text-white border-none shadow-none rounded-none"
                  >
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}

            {/* Vehicles Table */}
            <Card className="mt-6 border border-gray-200 shadow-none rounded-none bg-white">
              <div className="p-6">
                {/* Status Tabs - Removed since test data is no longer fetched for performance */}
                <div className="flex gap-2 mb-6">
                  <div className="flex items-center px-4 py-2 rounded-none text-sm font-medium bg-primary text-white border border-gray-200 shadow-none">
                    All Vehicles
                    <span className="ml-2 px-2 py-0.5 rounded-none text-xs font-semibold bg-primary text-white">
                      {stats.all}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 px-4 py-2">
                    Test status filtering is available in the Quarterly Testing section
                  </div>
                </div>                {isLoading ? (
                  <VehicleTableSkeleton />
                ) : (<VehicleTable
                  vehicles={vehicles}
                  isLoading={isLoading}
                  onView={handleViewVehicle}
                  onEdit={handleEditVehicle}
                  onDelete={handleDeleteConfirm}
                  onEditVehicle={async (id: string, data: VehicleFormInput) => {
                    // Find the office ID by office name
                    const officeId = getOfficeIdByName(data.officeName);
                    if (!officeId) {
                      toast.error(`Office "${data.officeName}" not found`);
                      return;
                    }

                    // Convert from UI VehicleFormInput to API VehicleInput
                    const apiVehicleData = {
                      driver_name: data.driverName,
                      contact_number: data.contactNumber,
                      engine_type: data.engineType,
                      office_id: officeId,
                      plate_number: data.plateNumber,
                      vehicle_type: data.vehicleType,
                      wheels: data.wheels
                    };

                    await updateVehicleMutation.mutateAsync({
                      id,
                      vehicleData: apiVehicleData,
                    });

                    toast.success("Vehicle updated successfully");
                  }}
                />)}
              </div>

            </Card>
          </div>
        </div>
      </div>      {/* Modals and Dialogs */}
      <VehicleModals
        isAddModalOpen={addModalOpen}
        onAddModalClose={() => setAddModalOpen(false)}
        onAddVehicle={handleAddVehicle}
        isEditModalOpen={editModalOpen}
        onEditModalClose={() => {
          setEditModalOpen(false);
          setSelectedVehicle(null);
        }} onEditVehicle={handleSaveEdit}
        selectedVehicle={selectedVehicle}
        isLoading={isLoading}
        vehicleTypes={vehicleTypes}
        engineTypes={engineTypes}
        wheelCounts={wheelCounts.map((w) => w.toString())}
        offices={offices}
      />      <VehicleDetails
        vehicle={selectedVehicle}
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedVehicle(null);
        }}
        onEditVehicle={handleSaveEdit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              vehicle
              {selectedVehicle && ` (${selectedVehicle.plate_number})`} and
              remove its data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedVehicle(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVehicle}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NetworkStatus />
    </>
  );
}
