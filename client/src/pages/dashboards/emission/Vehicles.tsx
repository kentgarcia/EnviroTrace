/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
    SortingState,
    PaginationState,
    VisibilityState,
    ColumnFiltersState,
    OnChangeFn,
    RowSelectionState
} from "@tanstack/react-table";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { NetworkStatus } from "@/components/layout/NetworkStatus";
import { useVehicles, Vehicle, VehicleInput } from "@/hooks/vehicles/useVehicles";
import { VehicleTable, VehicleTableSkeleton } from "@/components/dashboards/emission/vehicles/VehicleTable";
import { VehicleModals } from "@/components/dashboards/emission/vehicles/VehicleModals";
import { VehicleDetails } from "@/components/dashboards/emission/vehicles/VehicleDetails";
import {
    FileDown,
    Plus,
    AlertTriangle,
    Search,
    Filter,
    X
} from "lucide-react";
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
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";

export default function Vehicles() {
    // Modal and dialog states
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // TanStack Table states
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'plateNumber', desc: false }
    ]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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
        const duplicate = vehicles.find(v =>
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
        const duplicate = vehicles.find(v =>
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
        const selectedIds = Object.keys(rowSelection);
        if (selectedIds.length === 0) return;

        toast.info(`${selectedIds.length} vehicles would be deleted. This feature is not yet implemented.`);
        // Implementation would go here
    };

    // Export vehicles to CSV
    const handleExportToCSV = () => {
        if (vehicles.length === 0) {
            toast.warning("No vehicle data to export");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Plate Number,Office,Driver,Vehicle Type,Engine Type,Wheels,Contact,Latest Test,Test Result\n";

        vehicles.forEach(vehicle => {
            const testDate = vehicle.latestTestDate
                ? format(new Date(vehicle.latestTestDate), 'yyyy-MM-dd')
                : "Not Tested";

            const testResult = vehicle.latestTestResult === null
                ? "Not Tested"
                : vehicle.latestTestResult
                    ? "Passed"
                    : "Failed";

            csvContent += `"${vehicle.plateNumber}","${vehicle.officeName}","${vehicle.driverName}","${vehicle.vehicleType}","${vehicle.engineType}","${vehicle.wheels}","${vehicle.contactNumber || ''}","${testDate}","${testResult}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `vehicles_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Vehicle data exported successfully");
    };

    // Handle search query
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        setFilter('searchQuery', value);
    };

    // Reset all filters
    const handleResetFilters = () => {
        resetFilters();
        setSearchQuery("");
        setColumnFilters([]);
    };

    // Update filters from TanStack column filters
    useEffect(() => {
        if (columnFilters.length > 0) {
            columnFilters.forEach(filter => {
                if (filter.id === 'officeName' && typeof filter.value === 'string') {
                    setFilter('officeFilter', filter.value);
                } else if (filter.id === 'vehicleType' && typeof filter.value === 'string') {
                    setFilter('vehicleTypeFilter', filter.value);
                } else if (filter.id === 'engineType' && typeof filter.value === 'string') {
                    setFilter('engineTypeFilter', filter.value);
                } else if (filter.id === 'wheels' && typeof filter.value === 'string') {
                    setFilter('wheelsFilter', filter.value);
                } else if (filter.id === 'latestTestResult' && typeof filter.value === 'string') {
                    setFilter('statusFilter', filter.value as any);
                }
            });
        }
    }, [columnFilters, setFilter]);

    // Table state change handlers
    const handleSortingChange: OnChangeFn<SortingState> = useCallback((updater) => {
        setSorting(typeof updater === 'function' ? updater(sorting) : updater);
    }, [sorting]);

    const handlePaginationChange: OnChangeFn<PaginationState> = useCallback((updater) => {
        setPagination(typeof updater === 'function' ? updater(pagination) : updater);
    }, [pagination]);

    const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback((updater) => {
        setColumnFilters(typeof updater === 'function' ? updater(columnFilters) : updater);
    }, [columnFilters]);

    const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = useCallback((updater) => {
        setColumnVisibility(typeof updater === 'function' ? updater(columnVisibility) : updater);
    }, [columnVisibility]);

    const handleRowSelectionChange: OnChangeFn<RowSelectionState> = useCallback((updater) => {
        setRowSelection(typeof updater === 'function' ? updater(rowSelection) : updater);
    }, [rowSelection]);

    // Filter button for different categories
    const FilterButton = ({
        filterKey,
        value,
        label,
        currentValue
    }: {
        filterKey: 'vehicleTypeFilter' | 'engineTypeFilter' | 'wheelsFilter' | 'officeFilter' | 'statusFilter';
        value: string;
        label: string;
        currentValue: string;
    }) => (
        <Button
            size="sm"
            variant={(currentValue === value || (currentValue === "" && value === "all")) ? "default" : "outline"}
            onClick={() => setFilter(filterKey, value === "all" ? "" : value)}
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
                    <DashboardNavbar dashboardTitle="Government Vehicles" />

                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold">Vehicles Database</h1>
                                <p className="text-muted-foreground">
                                    Manage and view all government vehicles in the system
                                </p>
                            </div>
                            <div className="flex gap-2 self-end">
                                <Button variant="outline" onClick={handleExportToCSV} disabled={vehicles.length === 0 || isLoading}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Export to CSV
                                </Button>
                                <Button onClick={() => setAddModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Vehicle
                                </Button>
                            </div>
                        </div>

                        {/* Error Notice */}
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    There was a problem loading the vehicles data. Please try again later.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Search and Filters */}
                        <div className="mb-4">
                            {/* Search Bar */}
                            <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by plate number, driver, or office..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="pl-8"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`h-10 w-10 ${showFilters ? 'bg-muted' : ''}`}
                                    >
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                    {Object.values(filters).some(v => v !== "" && v !== "all") && (
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-1.5"
                                            onClick={handleResetFilters}
                                        >
                                            <X className="h-3.5 w-3.5" /> Clear filters
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            {showFilters && (
                                <div className="mb-4 border rounded-lg p-4 bg-background">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                        {/* Office Filter */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium mb-2">Office</h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                <FilterButton
                                                    filterKey="officeFilter"
                                                    value="all"
                                                    label="All"
                                                    currentValue={filters.officeFilter}
                                                />
                                                {offices.slice(0, 2).map(office => (
                                                    <FilterButton
                                                        key={office as string}
                                                        filterKey="officeFilter"
                                                        value={office as string}
                                                        label={office as string}
                                                        currentValue={filters.officeFilter}
                                                    />
                                                ))}
                                                {offices.length > 2 && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm" className="text-xs">
                                                                More...
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start">
                                                            {offices.slice(2).map(office => (
                                                                <DropdownMenuItem
                                                                    key={office as string}
                                                                    onClick={() => setFilter('officeFilter', office as string)}
                                                                >
                                                                    {office as string}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>

                                        {/* Vehicle Type Filter */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium mb-2">Vehicle Type</h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                <FilterButton
                                                    filterKey="vehicleTypeFilter"
                                                    value="all"
                                                    label="All"
                                                    currentValue={filters.vehicleTypeFilter}
                                                />
                                                {vehicleTypes.slice(0, 2).map(type => (
                                                    <FilterButton
                                                        key={type as string}
                                                        filterKey="vehicleTypeFilter"
                                                        value={type as string}
                                                        label={type as string}
                                                        currentValue={filters.vehicleTypeFilter}
                                                    />
                                                ))}
                                                {vehicleTypes.length > 2 && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm" className="text-xs">
                                                                More...
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start">
                                                            {vehicleTypes.slice(2).map(type => (
                                                                <DropdownMenuItem
                                                                    key={type as string}
                                                                    onClick={() => setFilter('vehicleTypeFilter', type as string)}
                                                                >
                                                                    {type as string}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>

                                        {/* Engine Type Filter */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium mb-2">Engine Type</h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                <FilterButton
                                                    filterKey="engineTypeFilter"
                                                    value="all"
                                                    label="All"
                                                    currentValue={filters.engineTypeFilter}
                                                />
                                                {engineTypes.slice(0, 2).map(type => (
                                                    <FilterButton
                                                        key={type as string}
                                                        filterKey="engineTypeFilter"
                                                        value={type as string}
                                                        label={type as string}
                                                        currentValue={filters.engineTypeFilter}
                                                    />
                                                ))}
                                                {engineTypes.length > 2 && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm" className="text-xs">
                                                                More...
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start">
                                                            {engineTypes.slice(2).map(type => (
                                                                <DropdownMenuItem
                                                                    key={type as string}
                                                                    onClick={() => setFilter('engineTypeFilter', type as string)}
                                                                >
                                                                    {type as string}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Filter */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium mb-2">Test Status</h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                <FilterButton
                                                    filterKey="statusFilter"
                                                    value="all"
                                                    label="All"
                                                    currentValue={filters.statusFilter}
                                                />
                                                <FilterButton
                                                    filterKey="statusFilter"
                                                    value="passed"
                                                    label="Passed"
                                                    currentValue={filters.statusFilter}
                                                />
                                                <FilterButton
                                                    filterKey="statusFilter"
                                                    value="failed"
                                                    label="Failed"
                                                    currentValue={filters.statusFilter}
                                                />
                                                <FilterButton
                                                    filterKey="statusFilter"
                                                    value="untested"
                                                    label="Not Tested"
                                                    currentValue={filters.statusFilter}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Filters Display */}
                                    {Object.values(filters).some(v => v !== "" && v !== "all") && (
                                        <div className="flex flex-wrap gap-1.5 mt-3 border-t pt-3">
                                            <span className="text-sm text-muted-foreground">Active filters:</span>
                                            {filters.officeFilter && (
                                                <Badge variant="secondary" className="gap-1">
                                                    Office: {filters.officeFilter}
                                                    <X
                                                        className="h-3 w-3 cursor-pointer"
                                                        onClick={() => setFilter('officeFilter', "")}
                                                    />
                                                </Badge>
                                            )}
                                            {filters.vehicleTypeFilter && (
                                                <Badge variant="secondary" className="gap-1">
                                                    Type: {filters.vehicleTypeFilter}
                                                    <X
                                                        className="h-3 w-3 cursor-pointer"
                                                        onClick={() => setFilter('vehicleTypeFilter', "")}
                                                    />
                                                </Badge>
                                            )}
                                            {filters.engineTypeFilter && (
                                                <Badge variant="secondary" className="gap-1">
                                                    Engine: {filters.engineTypeFilter}
                                                    <X
                                                        className="h-3 w-3 cursor-pointer"
                                                        onClick={() => setFilter('engineTypeFilter', "")}
                                                    />
                                                </Badge>
                                            )}
                                            {filters.statusFilter !== "all" && (
                                                <Badge variant="secondary" className="gap-1">
                                                    Status: {filters.statusFilter}
                                                    <X
                                                        className="h-3 w-3 cursor-pointer"
                                                        onClick={() => setFilter('statusFilter', "all")}
                                                    />
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selection Controls */}
                        {Object.keys(rowSelection).length > 0 && (
                            <div className="mb-4 p-3 bg-muted rounded-md flex items-center justify-between">
                                <p className="text-sm">
                                    <span className="font-medium">{Object.keys(rowSelection).length}</span> vehicles selected
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

                        {/* Vehicles Table */}
                        <Card>
                            <CardContent className="p-0 sm:p-1">
                                {isLoading ? (
                                    <VehicleTableSkeleton />
                                ) : (
                                    <VehicleTable
                                        vehicles={vehicles}
                                        isLoading={isLoading}
                                        onView={handleViewVehicle}
                                        onEdit={handleEditVehicle}
                                        onDelete={handleDeleteConfirm}
                                        sorting={sorting}
                                        onSortingChange={handleSortingChange}
                                        pagination={pagination}
                                        onPaginationChange={handlePaginationChange}
                                        columnFilters={columnFilters}
                                        onColumnFiltersChange={handleColumnFiltersChange}
                                        columnVisibility={columnVisibility}
                                        onColumnVisibilityChange={handleColumnVisibilityChange}
                                        rowSelection={rowSelection}
                                        onRowSelectionChange={handleRowSelectionChange}
                                    />
                                )}
                            </CardContent>
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
                            This action cannot be undone. This will permanently delete the vehicle
                            {selectedVehicle && ` (${selectedVehicle.plateNumber})`} and remove its data from the system.
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