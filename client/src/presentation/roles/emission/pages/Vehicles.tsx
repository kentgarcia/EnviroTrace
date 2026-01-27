/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
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
import { useDebounce } from "@/core/hooks/useDebounce";
import {
  VehicleTable,
  VehicleTableSkeleton,
} from "@/presentation/roles/emission/components/vehicles/VehicleTable";
import { VehicleModals } from "@/presentation/roles/emission/components/vehicles/VehicleModals";
import { VehicleDetails } from "@/presentation/roles/emission/components/vehicles/VehicleDetails";
import { FileDown, Plus, AlertTriangle, Search, Filter, X, Loader2, RefreshCw } from "lucide-react";
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
  const [pagination, setPagination] = useState(() => {
    const saved = localStorage.getItem("vehiclesPageSize");
    return {
      pageIndex: 0,
      pageSize: saved ? Number(saved) : 25,
    };
  });

  useEffect(() => {
    localStorage.setItem("vehiclesPageSize", String(pagination.pageSize));
  }, [pagination.pageSize]);

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
    refetch,
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
  const { data: officesData, refetch: refetchOffices } = useOffices();
  const officesList = officesData?.offices || [];
  
  // Create list of office names for the modal dropdown
  const availableOfficeNames = useMemo(() => {
    return officesList.map(o => o.name).sort();
  }, [officesList]);

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

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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
      plate_number: vehicleData.plateNumber || undefined,
      chassis_number: vehicleData.chassisNumber || undefined,
      registration_number: vehicleData.registrationNumber || undefined,
      vehicle_type: vehicleData.vehicleType,
      wheels: vehicleData.wheels,
      description: vehicleData.description || undefined,
      year_acquired: vehicleData.yearAcquired || undefined
    };

    try {
      await updateVehicleMutation.mutateAsync({
        id: selectedVehicle.id,
        vehicleData: apiVehicleData,
      });

      toast.success("Vehicle updated successfully");
      setEditModalOpen(false);
      setSelectedVehicle(null);
      // Refetch vehicles to show the updated data
      await refetch();
    } catch (error: any) {
      console.error("Error updating vehicle:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to update vehicle";
      toast.error(errorMessage);
    }
  };  // Handler for adding new vehicle
  const handleAddVehicle = async (vehicle: VehicleFormInput) => {
    // Find the office ID by office name
    const officeId = getOfficeIdByName(vehicle.officeName);
    if (!officeId) {
      toast.error(`Office "${vehicle.officeName}" not found`);
      return;
    }

    // Convert from UI VehicleFormInput to API VehicleInput
    const apiVehicle = {
      driver_name: vehicle.driverName,
      contact_number: vehicle.contactNumber,
      engine_type: vehicle.engineType,
      office_id: officeId,
      plate_number: vehicle.plateNumber || undefined,
      chassis_number: vehicle.chassisNumber || undefined,
      registration_number: vehicle.registrationNumber || undefined,
      vehicle_type: vehicle.vehicleType,
      wheels: vehicle.wheels,
      description: vehicle.description || undefined,
      year_acquired: vehicle.yearAcquired || undefined
    };

    try {
      await addVehicleMutation.mutateAsync(apiVehicle);
      toast.success("Vehicle added successfully");
      setAddModalOpen(false);
      // Refetch vehicles to show the new vehicle
      await refetch();
    } catch (error: any) {
      console.error("Error adding vehicle:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to add vehicle";
      toast.error(errorMessage);
    }
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
      // Refetch vehicles to update the list
      await refetch();
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to delete vehicle";
      toast.error(errorMessage);
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
      "Plate Number,Chassis Number,Registration Number,Office,Driver,Vehicle Type,Engine Type,Wheels,Contact\n";

    vehicles.forEach((vehicle) => {
      const officeName = vehicle.office?.name || "Unknown Office";

      csvContent += `"${vehicle.plate_number || ""}","${vehicle.chassis_number || ""}","${vehicle.registration_number || ""}","${officeName}","${vehicle.driver_name
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
      <div className="flex flex-col h-full overflow-hidden">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
              <div className="shrink-0">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                  Vehicles
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage and monitor the vehicle fleet across all offices
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="border border-gray-200 bg-white shadow-none rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
                <Button
                  onClick={handleExportToCSV}
                  variant="outline"
                  size="icon"
                  disabled={vehicles.length === 0 || isLoading}
                  className="border border-gray-200 bg-white shadow-none rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <FileDown className="h-4 w-4 text-slate-600" />
                </Button>
              </div>
            </div>
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
            <div className="p-8">
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
            <Card className="border border-slate-200 shadow-none rounded-xl bg-white overflow-hidden">
              <div className="p-6">
                {/* Controls Row: Search left, Filters right */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                  {/* Search (left) */}
                  <div className="relative flex items-center w-full lg:w-96">
                    <Input
                      placeholder="Search by plate, driver, or office..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg h-10 text-sm transition-all"
                    />
                    <span className="absolute left-3 text-slate-400">
                      {search && search !== debouncedSearch ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </span>
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Filters (right) */}
                  <div className="flex flex-wrap gap-2 items-center lg:justify-end">
                    {(office || vehicleType || engineType || search) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetFilters}
                        className="text-slate-500 hover:text-slate-900 text-xs font-medium h-8 px-2"
                      >
                        Clear all
                      </Button>
                    )}
                    
                    {/* Office Filter Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 px-4 justify-between bg-white border-slate-200 shadow-none rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors min-w-[140px]"
                        >
                          <span className="truncate">{office ? office : "All Offices"}</span>
                          <Filter className="ml-2 h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 p-1">
                        <DropdownMenuItem onClick={() => setOffice("")} className="rounded-md cursor-pointer">
                          All Offices
                        </DropdownMenuItem>
                        {offices.map((o) => (
                          <DropdownMenuItem key={o} onClick={() => setOffice(o)} className="rounded-md cursor-pointer">
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
                          className="h-10 px-4 justify-between bg-white border-slate-200 shadow-none rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors min-w-[130px]"
                        >
                          <span className="truncate">{vehicleType ? vehicleType : "All Types"}</span>
                          <Filter className="ml-2 h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-1">
                        <DropdownMenuItem onClick={() => setVehicleType("")} className="rounded-md cursor-pointer">
                          All Types
                        </DropdownMenuItem>
                        {vehicleTypes.map((t) => (
                          <DropdownMenuItem key={t} onClick={() => setVehicleType(t)} className="rounded-md cursor-pointer">
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
                          className="h-10 px-4 justify-between bg-white border-slate-200 shadow-none rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors min-w-[130px]"
                        >
                          <span className="truncate">{engineType ? engineType : "All Engines"}</span>
                          <Filter className="ml-2 h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-1">
                        <DropdownMenuItem onClick={() => setEngineType("")} className="rounded-md cursor-pointer">
                          All Engines
                        </DropdownMenuItem>
                        {engineTypes.map((e) => (
                          <DropdownMenuItem key={e} onClick={() => setEngineType(e)} className="rounded-md cursor-pointer">
                            {e}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                  onClick={() => setAddModalOpen(true)}
                  className="bg-[#0033a0] hover:bg-[#002a80] text-white border-none shadow-none rounded-lg px-4 h-9 text-sm font-medium transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Button>
                  </div>
                </div>

                {isLoading ? (
                    <VehicleTableSkeleton />
                  ) : (
                    <VehicleTable
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
                          plate_number: data.plateNumber || undefined,
                          chassis_number: data.chassisNumber || undefined,
                          registration_number: data.registrationNumber || undefined,
                          vehicle_type: data.vehicleType,
                          wheels: data.wheels,
                          description: data.description || undefined,
                          year_acquired: data.yearAcquired || undefined
                        };

                        try {
                          await updateVehicleMutation.mutateAsync({
                            id,
                            vehicleData: apiVehicleData,
                          });

                          toast.success("Vehicle updated successfully");
                          await refetch();
                        } catch (error: any) {
                          console.error("Error updating vehicle:", error);
                          const errorMessage = error.response?.data?.detail || error.message || "Failed to update vehicle";
                          toast.error(errorMessage);
                        }
                      }}
                    />
                  )}
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
        offices={availableOfficeNames}
        onRefreshOffices={refetchOffices}
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
              {selectedVehicle && ` (${selectedVehicle.plate_number || selectedVehicle.chassis_number || selectedVehicle.registration_number})`} and
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
    </>
  );
}
