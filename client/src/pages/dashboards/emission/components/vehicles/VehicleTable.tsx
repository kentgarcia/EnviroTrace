import React, { useState, useRef } from "react";
import { format } from "date-fns";
import {
    ColumnDef,
    SortingState,
    PaginationState,
    VisibilityState,
    ColumnFiltersState,
    OnChangeFn,
    RowSelectionState,
    Row
} from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Vehicle } from "@/hooks/vehicles/useVehicles";
import { Badge } from "@/components/ui/badge";
import { VehicleDetails } from "./VehicleDetails";
import { useVehicles } from "@/hooks/vehicles/useVehicles";
import { DataTable } from "@/components/ui/data-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface VehicleTableProps {
    vehicles: Vehicle[];
    isLoading: boolean;
    onView: (vehicle: Vehicle) => void;
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (vehicle: Vehicle) => void;

    // Optional TanStack Table state
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    pagination?: PaginationState;
    onPaginationChange?: OnChangeFn<PaginationState>;
    columnFilters?: ColumnFiltersState;
    onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
    columnVisibility?: VisibilityState;
    onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

// Skeleton loader for the table
export const VehicleTableSkeleton: React.FC = () => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Plate Number</TableHead>
                        <TableHead>Office</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Latest Test</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export const VehicleTable: React.FC<VehicleTableProps> = ({
    vehicles,
    isLoading,
    onView,
    onEdit,
    onDelete,

    // Optional TanStack Table state props (with defaults)
    sorting = [{ id: 'plateNumber', desc: false }],
    onSortingChange,
    pagination = { pageIndex: 0, pageSize: 10 },
    onPaginationChange,
    columnFilters = [],
    onColumnFiltersChange,
    columnVisibility = {},
    onColumnVisibilityChange,
    rowSelection = {},
    onRowSelectionChange,
}) => {
    // Add: row-to-details functionality
    const [detailsVehicle, setDetailsVehicle] = useState<Vehicle | null>(null);
    
    const { editVehicle } = useVehicles();

    // Add a ref to hold the refetch function from VehicleDetails
    const detailsRefetchRef = useRef<null | (() => void)>(null);

    // Helper to format date from milliseconds
    const formatDate = (dateValue?: string | number) => {
        if (!dateValue) return "Not tested";
        let date: Date;
        if (typeof dateValue === 'number') {
            date = new Date(dateValue);
        } else if (!isNaN(Number(dateValue))) {
            date = new Date(Number(dateValue));
        } else {
            date = new Date(dateValue);
        }
        if (isNaN(date.getTime())) return "Invalid date";
        return format(date, 'MMM dd, yyyy');
    };

    // Render test result badge
    const renderTestResultBadge = (vehicle: Vehicle) => {
        // If it's a pending vehicle (not yet synced)
        if (vehicle.id.toString().startsWith('pending-')) {
            return (
                <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="text-yellow-600 bg-yellow-50">
                        Pending Sync
                    </Badge>
                </div>
            );
        }

        // If there's no test result
        if (vehicle.latestTestResult === undefined || vehicle.latestTestResult === null) {
            return (
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    Not tested
                </Badge>
            );
        }

        // Pass/Fail status
        return vehicle.latestTestResult ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">
                Passed
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-red-100 text-red-800">
                Failed
            </Badge>
        );
    };

    // Define columns
    const columns: ColumnDef<Vehicle>[] = [
        {
            accessorKey: 'plateNumber',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center p-0 font-medium"
                >
                    Plate Number
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.original.plateNumber}
                </div>
            )
        },
        {
            accessorKey: 'officeName',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center p-0 font-medium"
                >
                    Office
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
            )
        },
        {
            accessorKey: 'driverName',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center p-0 font-medium"
                >
                    Driver
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
            )
        },
        {
            accessorKey: 'vehicleType',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center p-0 font-medium"
                >
                    Type
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span title={`${row.original.vehicleType}, ${row.original.engineType} engine, ${row.original.wheels} wheels`}>
                    {row.original.vehicleType}
                </span>
            )
        },
        {
            accessorKey: 'latestTestDate',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center p-0 font-medium"
                >
                    Latest Test
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => formatDate(row.original.latestTestDate)
        },
        {
            accessorKey: 'latestTestResult',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center p-0 font-medium"
                >
                    Result
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => renderTestResultBadge(row.original)
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 vehicle-action-btn">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetailsVehicle(row.original)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(row.original)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={() => onDelete(row.original)}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    if (isLoading) {
        return <VehicleTableSkeleton />;
    }

    if (detailsVehicle) {
        return (
            <div className="flex gap-6">
                {/* List of vehicles (left) */}
                <div className="w-1/3 border-r pr-4 overflow-y-auto max-h-[70vh]">
                    <ul className="divide-y">
                        {vehicles.map(v => (
                            <li
                                key={v.id}
                                className={`p-3 cursor-pointer hover:bg-blue-50 ${detailsVehicle.id === v.id ? 'bg-blue-100 font-semibold' : ''}`}
                                onClick={() => setDetailsVehicle(v)}
                            >
                                <div className="text-sm">{v.plateNumber}</div>
                                <div className="text-xs text-muted-foreground">{v.driverName} • {v.officeName}</div>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Details (right) using VehicleDetails component */}
                <div className="flex-1 p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setDetailsVehicle(null)}>&larr; Back to table</Button>
                    </div>
                    <VehicleDetails
                        vehicle={detailsVehicle}
                        isOpen={true}
                        onClose={() => setDetailsVehicle(null)}
                        onEditVehicle={async (data) => {
                            if (!detailsVehicle) return;
                            await editVehicle(detailsVehicle.id, data);
                            // Refetch the details after update
                            if (detailsRefetchRef.current) detailsRefetchRef.current();
                        }}
                        // Pass a callback to get the refetch function
                        onRegisterRefetch={fn => { detailsRefetchRef.current = fn; }}
                    />
                </div>
            </div>
        );
    }

    return (
        <DataTable
            columns={columns}
            data={vehicles}
            isLoading={isLoading}
            loadingMessage="Loading vehicles..."
            emptyMessage="No vehicles found."
            onRowClick={(row: Row<Vehicle>) => setDetailsVehicle(row.original)}
            showDensityToggle={true}
            showColumnVisibility={true}
            showPagination={true}
            defaultPageSize={10}
            defaultDensity="normal"
        />
    );
};