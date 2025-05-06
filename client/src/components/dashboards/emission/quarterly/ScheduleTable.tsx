import React from "react";
import { format } from "date-fns";
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
import { MoreHorizontal, ClipboardList, Edit, Trash, Loader2 } from "lucide-react";
import { TestSchedule } from "@/hooks/quarterly/useQuarterlyTesting";
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

interface ScheduleTableProps {
    schedules: TestSchedule[];
    isLoading: boolean;
    onViewTests: (schedule: TestSchedule) => void;
    onEditSchedule: (schedule: TestSchedule) => void;
    onDeleteSchedule: (schedule: TestSchedule) => void;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
    schedules,
    isLoading,
    onViewTests,
    onEditSchedule,
    onDeleteSchedule,
}) => {
    // Helper to detect if a schedule is pending sync
    const isPendingSync = (id: string) => id.startsWith('pending-');

    // Table columns
    const columns: ColumnDef<TestSchedule>[] = [
        {
            accessorKey: 'year',
            header: 'Year',
        },
        {
            accessorKey: 'quarter',
            header: 'Quarter',
            cell: ({ row }) => `Q${row.original.quarter}`,
        },
        {
            accessorKey: 'assignedPersonnel',
            header: 'Personnel',
        },
        {
            accessorKey: 'location',
            header: 'Location',
        },
        {
            accessorKey: 'conductedOn',
            header: 'Date',
            cell: ({ row }) => {
                const value = row.original.conductedOn;
                let date: Date | null = null;
                if (typeof value === "string" && !isNaN(Date.parse(value))) {
                    date = new Date(value);
                } else if (typeof value === "number" || (typeof value === "string" && /^\d+$/.test(value))) {
                    date = new Date(Number(value));
                }
                return (
                    <>
                        {date && !isNaN(date.getTime())
                            ? format(date, "MMM dd, yyyy")
                            : "Invalid date"}
                        {isPendingSync(row.original.id) && (
                            <Badge variant="outline" className="ml-2 text-yellow-600 bg-yellow-50">
                                Pending Sync
                            </Badge>
                        )}
                    </>
                );
            },
        },
        {
            id: 'actions',
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
                            <DropdownMenuItem onClick={() => onViewTests(row.original)}>
                                <ClipboardList className="mr-2 h-4 w-4" />
                                <span>View Tests</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditSchedule(row.original)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDeleteSchedule(row.original)}
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
        data: schedules,
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
                <span className="ml-2">Loading schedules...</span>
            </div>
        );
    }

    if (schedules.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No test schedules found for the selected filters. Create a new schedule to get started.
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
                            <TableRow key={row.id} className="h-7">
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
                                No schedules found.
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
                        {schedules.length === 0
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

export default ScheduleTable;