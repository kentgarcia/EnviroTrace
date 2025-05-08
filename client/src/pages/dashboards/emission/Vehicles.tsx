/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
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
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { NetworkStatus } from "@/components/layout/NetworkStatus";
import {
  useVehicles,
  Vehicle,
  VehicleInput,
} from "@/hooks/vehicles/useVehicles";
import {
  VehicleTable,
  VehicleTableSkeleton,
} from "@/pages/dashboards/emission/components/vehicles/VehicleTable";
import { VehicleModals } from "@/pages/dashboards/emission/components/vehicles/VehicleModals";
import { VehicleDetails } from "@/pages/dashboards/emission/components/vehicles/VehicleDetails";
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
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Vehicles() {
  // Modal and dialog states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Search, filter, and table states
  const [tableState, setTableState] = useState({
    searchQuery: "",
    officeFilter: "",
    vehicleTypeFilter: "",
    engineTypeFilter: "",
    wheelsFilter: "",
    statusFilter: "all",
    sorting: [{ id: "plateNumber", desc: false }],
    pagination: { pageIndex: 0, pageSize: 10 },
    columnFilters: [] as ColumnFiltersState,
    columnVisibility: {},
    rowSelection: {},
  });

  // Show/hide advanced filters
  const [showFilters, setShowFilters] = useState(false);

  // Get vehicles data and actions from our custom hook
  const {
    vehicles,
    isLoading,
    error,
    filters,
    setFilter,
    resetFilters,
    vehicleTypes,
    engineTypes,
    wheelCounts,
    offices,
    addVehicle,
    editVehicle,
    removeVehicle,
  } = useVehicles();

  // Simple search and filter state
  const [search, setSearch] = useState("");
  const [office, setOffice] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [engineType, setEngineType] = useState("");
  const [status, setStatus] = useState("");

  // Simple filter logic
  const filteredVehicles = vehicles.filter((v) => {
    // Search by plate, driver, or office
    const searchMatch =
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.driverName.toLowerCase().includes(search.toLowerCase()) ||
      v.officeName.toLowerCase().includes(search.toLowerCase());
    // Office filter
    const officeMatch = !office || v.officeName === office;
    // Vehicle type filter
    const typeMatch = !vehicleType || v.vehicleType === vehicleType;
    // Engine type filter
    const engineMatch = !engineType || v.engineType === engineType;
    // Status filter
    let statusMatch = true;
    if (status === "passed") statusMatch = v.latestTestResult === true;
    else if (status === "failed") statusMatch = v.latestTestResult === false;
    else if (status === "untested") statusMatch = v.latestTestResult == null;
    return (
      searchMatch && officeMatch && typeMatch && engineMatch && statusMatch
    );
  });

  // Row selection handler
  const setRowSelection = (rowSelection: Record<string, boolean>) => {
    setTableState((prev) => ({ ...prev, rowSelection }));
  };

  // Update filter state (remove duplicate from hook destructure)
  const setTableFilter = useCallback((key: string, value: string) => {
    setTableState((prev) => ({ ...prev, [key]: value }));
  }, []);
  const resetTableFilters = () => {
    setTableState((prev) => ({
      ...prev,
      searchQuery: "",
      officeFilter: "",
      vehicleTypeFilter: "",
      engineTypeFilter: "",
      wheelsFilter: "",
      statusFilter: "all",
      columnFilters: [],
    }));
  };

  // Handle viewing vehicle details
  const handleViewVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setViewModalOpen(true);
  }, []);

  // Handle editing vehicle
  const handleEditVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditModalOpen(true);
  }, []);

  // Handle deleting vehicle confirmation
  const handleDeleteConfirm = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDeleteDialogOpen(true);
  }, []);

  // Handle saving edited vehicle
  const handleSaveEdit = async (vehicleData: VehicleInput) => {
    if (!selectedVehicle) return;

    // Check for duplicate plate number
    const duplicate = vehicles.find(
      (v) =>
        v.plateNumber.toLowerCase() === vehicleData.plateNumber.toLowerCase() &&
        v.id !== selectedVehicle.id
    );

    if (duplicate) {
      toast.error("A vehicle with this plate number already exists");
      return;
    }

    const success = await editVehicle(selectedVehicle.id, vehicleData);
    if (success) {
      setEditModalOpen(false);
      setSelectedVehicle(null);
    }
  };

  // Handle adding new vehicle
  const handleAddVehicle = async (vehicleData: VehicleInput) => {
    // Check for duplicate plate number
    const duplicate = vehicles.find(
      (v) =>
        v.plateNumber.toLowerCase() === vehicleData.plateNumber.toLowerCase()
    );

    if (duplicate) {
      toast.error("A vehicle with this plate number already exists");
      return;
    }

    const success = await addVehicle(vehicleData);
    if (success) {
      setAddModalOpen(false);
    }
  };

  // Handle deleting vehicle
  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    const success = await removeVehicle(selectedVehicle.id);
    if (success) {
      setDeleteDialogOpen(false);
      setSelectedVehicle(null);
    }
  };

  // Handle deleting selected vehicles
  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(tableState.rowSelection);
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
      "Plate Number,Office,Driver,Vehicle Type,Engine Type,Wheels,Contact,Latest Test,Test Result\n";

    vehicles.forEach((vehicle) => {
      const testDate = vehicle.latestTestDate
        ? format(new Date(vehicle.latestTestDate), "yyyy-MM-dd")
        : "Not Tested";

      const testResult =
        vehicle.latestTestResult === null
          ? "Not Tested"
          : vehicle.latestTestResult
          ? "Passed"
          : "Failed";

      csvContent += `"${vehicle.plateNumber}","${vehicle.officeName}","${
        vehicle.driverName
      }","${vehicle.vehicleType}","${vehicle.engineType}","${
        vehicle.wheels
      }","${vehicle.contactNumber || ""}","${testDate}","${testResult}"\n`;
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

  // Table state change handlers
  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      setTableState((prev) => ({
        ...prev,
        sorting:
          typeof updater === "function" ? updater(prev.sorting) : updater,
      }));
    },
    []
  );
  const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      setTableState((prev) => ({
        ...prev,
        pagination:
          typeof updater === "function" ? updater(prev.pagination) : updater,
      }));
    },
    []
  );
  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) => {
      setTableState((prev) => ({
        ...prev,
        columnFilters:
          typeof updater === "function" ? updater(prev.columnFilters) : updater,
      }));
    },
    []
  );
  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = useCallback(
    (updater) => {
      setTableState((prev) => ({
        ...prev,
        columnVisibility:
          typeof updater === "function"
            ? updater(prev.columnVisibility)
            : updater,
      }));
    },
    []
  );
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = useCallback(
    (updater) => {
      setTableState((prev) => ({
        ...prev,
        rowSelection:
          typeof updater === "function" ? updater(prev.rowSelection) : updater,
      }));
    },
    []
  );

  // Update filters from TanStack column filters
  useEffect(() => {
    if (tableState.columnFilters.length > 0) {
      (tableState.columnFilters as ColumnFilter[]).forEach((filter) => {
        if (filter.id === "officeName" && typeof filter.value === "string") {
          setTableFilter("officeFilter", filter.value);
        } else if (
          filter.id === "vehicleType" &&
          typeof filter.value === "string"
        ) {
          setTableFilter("vehicleTypeFilter", filter.value);
        } else if (
          filter.id === "engineType" &&
          typeof filter.value === "string"
        ) {
          setTableFilter("engineTypeFilter", filter.value);
        } else if (filter.id === "wheels" && typeof filter.value === "string") {
          setTableFilter("wheelsFilter", filter.value);
        } else if (
          filter.id === "latestTestResult" &&
          typeof filter.value === "string"
        ) {
          setTableFilter("statusFilter", filter.value as any);
        }
      });
    }
  }, [tableState.columnFilters, setTableFilter]);

  // Filter button for different categories
  const FilterButton = ({
    filterKey,
    value,
    label,
    currentValue,
  }: {
    filterKey:
      | "vehicleTypeFilter"
      | "engineTypeFilter"
      | "wheelsFilter"
      | "officeFilter"
      | "statusFilter";
    value: string;
    label: string;
    currentValue: string;
  }) => (
    <Button
      size="sm"
      variant={
        currentValue === value || (currentValue === "" && value === "all")
          ? "default"
          : "outline"
      }
      onClick={() => setTableFilter(filterKey, value === "all" ? "" : value)}
      className="text-xs whitespace-nowrap"
    >
      {label}
    </Button>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar />
          {/* Header Section */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Vehicles</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setAddModalOpen(true)}
                className="hidden md:inline-flex"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
              <Button
                onClick={handleExportToCSV}
                variant="outline"
                size="icon"
                disabled={vehicles.length === 0 || isLoading}
              >
                <FileDown className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            {/* Controls Row: Search left, Filters right */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              {/* Search (left) */}
              <div className="relative flex items-center w-full md:w-auto justify-start bg-white rounded-md">
                <Search className="absolute left-3 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by plate, driver, or office..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 max-w-xs w-[320px] bg-white"
                />
              </div>
              {/* Filters (right) */}
              <div className="flex flex-wrap gap-2 items-center justify-end">
                {/* Office Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="min-w-[140px] justify-between bg-white"
                    >
                      {office ? office : "All Offices"}
                      <span className="ml-2 text-gray-400 flex items-center">
                        <Filter className="h-4 w-4" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-white">
                    <DropdownMenuItem onClick={() => setOffice("")}>
                      All Offices
                    </DropdownMenuItem>
                    {offices.map((o) => (
                      <DropdownMenuItem
                        key={o as string}
                        onClick={() => setOffice(o as string)}
                      >
                        {o as string}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Vehicle Type Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="min-w-[120px] justify-between bg-white"
                    >
                      {vehicleType ? vehicleType : "All Types"}
                      <span className="ml-2 text-gray-400 flex items-center">
                        <Filter className="h-4 w-4" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-white">
                    <DropdownMenuItem onClick={() => setVehicleType("")}>
                      All Types
                    </DropdownMenuItem>
                    {vehicleTypes.map((t) => (
                      <DropdownMenuItem
                        key={t as string}
                        onClick={() => setVehicleType(t as string)}
                      >
                        {t as string}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Engine Type Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="min-w-[120px] justify-between bg-white"
                    >
                      {engineType ? engineType : "All Engines"}
                      <span className="ml-2 text-gray-400 flex items-center">
                        <Filter className="h-4 w-4" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-white">
                    <DropdownMenuItem onClick={() => setEngineType("")}>
                      All Engines
                    </DropdownMenuItem>
                    {engineTypes.map((e) => (
                      <DropdownMenuItem
                        key={e as string}
                        onClick={() => setEngineType(e as string)}
                      >
                        {e as string}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Status Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="min-w-[120px] justify-between bg-white"
                    >
                      {status
                        ? status === "passed"
                          ? "Passed"
                          : status === "failed"
                          ? "Failed"
                          : status === "untested"
                          ? "Not Tested"
                          : status
                        : "All Status"}
                      <span className="ml-2 text-gray-400 flex items-center">
                        <Filter className="h-4 w-4" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-white">
                    <DropdownMenuItem onClick={() => setStatus("")}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatus("passed")}>
                      Passed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatus("failed")}>
                      Failed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatus("untested")}>
                      Not Tested
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was a problem loading the vehicles data. Please try
                  again later.
                </AlertDescription>
              </Alert>
            )}

            {/* Selection Controls */}
            {Object.keys(tableState.rowSelection).length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded-md flex items-center justify-between">
                <p className="text-sm">
                  <span className="font-medium">
                    {Object.keys(tableState.rowSelection).length}
                  </span>{" "}
                  vehicles selected
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRowSelection({})}
                  >
                    Deselect All
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteSelected}
                  >
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}

            {/* Vehicles Table (no Card) */}
            <Card className="mt-6">
              <div className="p-6">
                {isLoading ? (
                  <VehicleTableSkeleton />
                ) : (
                  <VehicleTable
                    vehicles={filteredVehicles}
                    isLoading={isLoading}
                    onView={handleViewVehicle}
                    onEdit={handleEditVehicle}
                    onDelete={handleDeleteConfirm}
                  />
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals and Dialogs */}
      <VehicleModals
        isAddModalOpen={addModalOpen}
        onAddModalClose={() => setAddModalOpen(false)}
        onAddVehicle={handleAddVehicle}
        isEditModalOpen={editModalOpen}
        onEditModalClose={() => {
          setEditModalOpen(false);
          setSelectedVehicle(null);
        }}
        onEditVehicle={handleSaveEdit}
        selectedVehicle={selectedVehicle}
        isLoading={isLoading}
        vehicleTypes={vehicleTypes as string[]}
        engineTypes={engineTypes as string[]}
        wheelCounts={wheelCounts as string[]}
        offices={offices as string[]}
      />

      <VehicleDetails
        vehicle={selectedVehicle}
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedVehicle(null);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              vehicle
              {selectedVehicle && ` (${selectedVehicle.plateNumber})`} and
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
    </SidebarProvider>
  );
}
