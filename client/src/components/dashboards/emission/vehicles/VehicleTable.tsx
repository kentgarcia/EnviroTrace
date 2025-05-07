import React, { useState, useRef } from "react";
import { format } from "date-fns";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    ColumnDef,
    SortingState,
    flexRender,
    PaginationState,
    VisibilityState,
    ColumnFiltersState,
    OnChangeFn,
    RowSelectionState,
    getFilteredRowModel,
    ColumnResizeMode,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, MoreHorizontal, ArrowUpDown, Settings, GripHorizontal, List, Rows3 } from "lucide-react";
import { Vehicle } from "@/hooks/vehicles/useVehicles";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { VehicleDetails } from "./VehicleDetails";
import { useVehicles } from "@/hooks/vehicles/useVehicles";

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
    // Internal state management when parent doesn't provide state handlers
    const [internalSorting, setInternalSorting] = React.useState<SortingState>(sorting);
    const [internalPagination, setInternalPagination] = React.useState<PaginationState>(pagination);
    const [internalColumnFilters, setInternalColumnFilters] = React.useState<ColumnFiltersState>(columnFilters);
    const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>(columnVisibility);
    const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>(rowSelection);
    const [density, setDensity] = React.useState<'compact' | 'normal' | 'spacious'>('normal');
    // Add: row-to-details functionality
    const [detailsVehicle, setDetailsVehicle] = React.useState<Vehicle | null>(null);
    // Add columnResizeMode state
    const [columnResizeMode, setColumnResizeMode] = React.useState<ColumnResizeMode>("onChange");

    const { editVehicle } = useVehicles();

    // Add a ref to hold the refetch function from VehicleDetails
    const detailsRefetchRef = useRef<null | (() => void)>(null);

    const densityClasses = {
        compact: 'text-xs h-6',
        normal: 'text-sm h-9',
        spacious: 'text-base h-12',
    };

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
    // Add size, minSize, maxSize to columns
    const columns: ColumnDef<Vehicle>[] = [
        {
            accessorKey: 'plateNumber',
            size: 160,
            minSize: 80,
            maxSize: 400,
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
            size: 140,
            minSize: 80,
            maxSize: 300,
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
            size: 140,
            minSize: 80,
            maxSize: 300,
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
            size: 120,
            minSize: 80,
            maxSize: 200,
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
            size: 120,
            minSize: 80,
            maxSize: 200,
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
            size: 100,
            minSize: 80,
            maxSize: 160,
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
        }
    ];

    // Initialize table
    const table = useReactTable({
        data: vehicles,
        columns,
        state: {
            sorting: onSortingChange ? sorting : internalSorting,
            pagination: onPaginationChange ? pagination : internalPagination,
            columnFilters: onColumnFiltersChange ? columnFilters : internalColumnFilters,
            columnVisibility: onColumnVisibilityChange ? columnVisibility : internalColumnVisibility,
            rowSelection: onRowSelectionChange ? rowSelection : internalRowSelection,
        },
        enableRowSelection: true,
        enableColumnResizing: true,
        columnResizeMode,
        onSortingChange: onSortingChange || ((updater) => {
            setInternalSorting(typeof updater === 'function' ? updater(internalSorting) : updater);
        }),
        onPaginationChange: onPaginationChange || ((updater) => {
            setInternalPagination(typeof updater === 'function' ? updater(internalPagination) : updater);
        }),
        onColumnFiltersChange: onColumnFiltersChange || ((updater) => {
            setInternalColumnFilters(typeof updater === 'function' ? updater(internalColumnFilters) : updater);
        }),
        onColumnVisibilityChange: onColumnVisibilityChange || ((updater) => {
            setInternalColumnVisibility(typeof updater === 'function' ? updater(internalColumnVisibility) : updater);
        }),
        onRowSelectionChange: onRowSelectionChange || ((updater) => {
            setInternalRowSelection(typeof updater === 'function' ? updater(internalRowSelection) : updater);
        }),
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

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
        <div className="space-y-2 text-xs">
            {/* Column Visibility Toggle */}
            <div className="flex justify-between items-center py-1">
                <div className="text-xs text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} vehicles
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs">Density:</span>
                    <Button size="sm" variant={density === 'compact' ? 'default' : 'outline'} className="px-2 py-1 text-xs" onClick={() => setDensity('compact')} title="Compact"><GripHorizontal className="h-4 w-4" /></Button>
                    <Button size="sm" variant={density === 'normal' ? 'default' : 'outline'} className="px-2 py-1 text-xs" onClick={() => setDensity('normal')} title="Normal"><Rows3 className="h-4 w-4" /></Button>
                    <Button size="sm" variant={density === 'spacious' ? 'default' : 'outline'} className="px-2 py-1 text-xs" onClick={() => setDensity('spacious')} title="Spacious"><List className="h-4 w-4" /></Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 px-2 py-1 text-xs bg-white min-h-[28px]">
                                <Settings className="mr-2 h-3.5 w-3.5" />
                                View Options
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] text-xs bg-white">
                            <DropdownMenuCheckboxItem
                                checked={table.getColumn("plateNumber")?.getIsVisible()}
                                onCheckedChange={(value) =>
                                    table.getColumn("plateNumber")?.toggleVisibility(value)
                                }
                            >
                                Plate Number
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={table.getColumn("officeName")?.getIsVisible()}
                                onCheckedChange={(value) =>
                                    table.getColumn("officeName")?.toggleVisibility(value)
                                }
                            >
                                Office
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={table.getColumn("driverName")?.getIsVisible()}
                                onCheckedChange={(value) =>
                                    table.getColumn("driverName")?.toggleVisibility(value)
                                }
                            >
                                Driver
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={table.getColumn("vehicleType")?.getIsVisible()}
                                onCheckedChange={(value) =>
                                    table.getColumn("vehicleType")?.toggleVisibility(value)
                                }
                            >
                                Type
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={table.getColumn("latestTestDate")?.getIsVisible()}
                                onCheckedChange={(value) =>
                                    table.getColumn("latestTestDate")?.toggleVisibility(value)
                                }
                            >
                                Latest Test
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={table.getColumn("latestTestResult")?.getIsVisible()}
                                onCheckedChange={(value) =>
                                    table.getColumn("latestTestResult")?.toggleVisibility(value)
                                }
                            >
                                Result
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => table.resetColumnVisibility()}
                                className="justify-center text-center"
                            >
                                Reset View
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto bg-white">
                <Table className={density === 'compact' ? 'text-xs' : density === 'spacious' ? 'text-base' : 'text-sm'}>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className={densityClasses[density]}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="px-2 py-1 relative group" style={{ width: header.getSize() }}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        {header.column.getCanResize() && (
                                            <div
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                className="absolute right-0 top-0 h-full w-2 cursor-col-resize group-hover:bg-blue-200 transition"
                                                style={{ userSelect: 'none', touchAction: 'none' }}
                                            />
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, idx) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() ? "selected" : undefined}
                                    className={`cursor-pointer transition ${densityClasses[density]} ${(row.original.id.toString().startsWith('pending-') ? 'opacity-60 bg-gray-50' : '')}`}
                                    onClick={e => {
                                        if ((e.target as HTMLElement).closest('.vehicle-action-btn, .vehicle-checkbox')) return;
                                        setDetailsVehicle(row.original);
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <TableCell key={cell.id} className="px-2 py-1" style={{ width: cell.column.getSize() }}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className={densityClasses[density]}>
                                <TableCell colSpan={columns.length} className="text-center py-4">
                                    No vehicles found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {table.getRowModel().rows?.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2 py-1 text-xs">
                    <div className="flex items-center gap-2">
                        <span>Rows per page:</span>
                        <select
                            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => {
                                table.setPageSize(Number(e.target.value));
                            }}
                        >
                            {[5, 10, 20, 50, 100].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>{pageSize}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 py-1"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>

                        <span>
                            Page <span className="font-semibold">{table.getState().pagination.pageIndex + 1}</span> of{" "}
                            <span className="font-semibold">{table.getPageCount()}</span>
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 py-1"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};