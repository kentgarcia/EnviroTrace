import React, { useState } from "react";
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
import { Eye, Edit, Trash2, MoreHorizontal, ArrowUpDown, Settings } from "lucide-react";
import { Vehicle } from "@/hooks/vehicles/useVehicles";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

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

    // Format date helper
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not tested";
        const date = new Date(dateString);
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
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
        },
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
                <div
                    className="font-medium text-blue-900 cursor-pointer hover:text-blue-600"
                    onClick={() => onView(row.original)}
                    title="View vehicle details"
                >
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
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(row.original)}>
                                <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(row.original)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(row.original)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
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

    return (
        <div className="space-y-2 text-xs"> {/* Compressed table: smaller text */}
            {/* Column Visibility Toggle */}
            <div className="flex justify-between items-center py-1"> {/* Less vertical padding */}
                <div className="text-xs text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} of {vehicles.length} vehicles
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 px-2 py-1 text-xs">
                            <Settings className="mr-2 h-3.5 w-3.5" />
                            View Options
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px] text-xs">
                        <DropdownMenuCheckboxItem
                            checked={table.getColumn("select")?.getIsVisible()}
                            onCheckedChange={(value) =>
                                table.getColumn("select")?.toggleVisibility(value)
                            }
                        >
                            Selection
                        </DropdownMenuCheckboxItem>
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

            <div className="rounded-md border">
                <Table className="text-xs"> {/* Smaller font for table */}
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="h-7"> {/* Shorter row height */}
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="px-2 py-1">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() ? "selected" : undefined}
                                    className={
                                        (row.original.id.toString().startsWith('pending-') ? 'opacity-60 bg-gray-50' : '') +
                                        ' h-7'
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-2 py-1">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className="h-7">
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2 py-1 text-xs"> {/* Less padding, smaller text */}
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

                    <div>
                        {vehicles.length === 0
                            ? "0"
                            : `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-${Math.min(
                                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                table.getFilteredRowModel().rows.length
                            )}`} of {table.getFilteredRowModel().rows.length} items
                    </div>
                </div>
            )}
        </div>
    );
};