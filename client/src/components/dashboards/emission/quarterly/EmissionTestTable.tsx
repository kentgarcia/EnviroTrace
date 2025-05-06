import React from "react";
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
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash, Loader2, CheckCircle, XCircle } from "lucide-react";
import { EmissionTest } from "@/hooks/quarterly/useQuarterlyTesting";

interface EmissionTestTableProps {
    tests: EmissionTest[];
    isLoading: boolean;
    onEditTest: (test: EmissionTest) => void;
    onDeleteTest: (test: EmissionTest) => void;
}

export const EmissionTestTable: React.FC<EmissionTestTableProps> = ({
    tests,
    isLoading,
    onEditTest,
    onDeleteTest,
}) => {
    // Helper to detect if a test is pending sync
    const isPendingSync = (id: string) => id.startsWith("pending-");

    // Table columns
    const columns: ColumnDef<EmissionTest>[] = [
        {
            accessorKey: "vehicle.plateNumber",
            header: "Plate Number",
            cell: ({ row }) => row.original.vehicle?.plateNumber || "Unknown",
        },
        {
            accessorKey: "vehicle.driverName",
            header: "Driver",
            cell: ({ row }) => row.original.vehicle?.driverName || "Unknown",
        },
        {
            accessorKey: "vehicle.officeName",
            header: "Office",
            cell: ({ row }) => row.original.vehicle?.officeName || "Unknown",
        },
        {
            accessorKey: "testDate",
            header: "Test Date",
            cell: ({ row }) => {
                try {
                    let date: Date;
                    const value = row.original.testDate;
                    if (typeof value === "number") {
                        date = new Date(value);
                    } else if (/^\d{13}$/.test(value)) {
                        date = new Date(Number(value));
                    } else {
                        date = new Date(value);
                    }
                    if (isNaN(date.getTime())) return "Invalid date";
                    return format(date, "MMM dd, yyyy");
                } catch {
                    return "Invalid date";
                }
            },
        },
        {
            accessorKey: "result",
            header: "Result",
            cell: ({ row }) => (
                <div className="flex items-center">
                    {row.original.result ? (
                        <>
                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-green-600">Passed</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-4 w-4 text-red-600 mr-1" />
                            <span className="text-red-600">Failed</span>
                        </>
                    )}
                    {isPendingSync(row.original.id) && (
                        <Badge variant="outline" className="ml-2 text-yellow-600 bg-yellow-50">
                            Pending Sync
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditTest(row.original)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDeleteTest(row.original)}
                                className="text-red-600"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    // Table state
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

    const table = useReactTable({
        data: tests,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading test results...</span>
            </div>
        );
    }

    if (tests.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No vehicle test results found. Add a test to get started.
            </div>
        );
    }

    return (
        <div className="rounded-md border text-xs">
            <Table className="text-xs">
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id} className="h-7">
                            {headerGroup.headers.map(header => (
                                <TableHead key={header.id} className="px-2 py-1">
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map(row => (
                            <TableRow key={row.id} className={row.original.id.startsWith('pending-') ? 'opacity-60 bg-gray-50 h-7' : 'h-7'}>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id} className="px-2 py-1">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow className="h-7">
                            <TableCell colSpan={columns.length} className="text-center py-4">
                                No test results found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {/* Pagination Controls */}
            {table.getRowModel().rows.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2 py-1 text-xs">
                    <div className="flex items-center gap-2">
                        <span>Rows per page:</span>
                        <select
                            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                            value={table.getState().pagination.pageSize}
                            onChange={e => table.setPageSize(Number(e.target.value))}
                        >
                            {[5, 10, 20, 50, 100].map(pageSize => (
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
                            Page <span className="font-semibold">{table.getState().pagination.pageIndex + 1}</span> of {" "}
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
                        {tests.length === 0
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

export default EmissionTestTable;