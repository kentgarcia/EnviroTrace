import React, { useState } from "react";
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
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ClipboardList, Edit, Trash, Loader2, Settings, GripHorizontal, Rows3, List } from "lucide-react";
import { TestSchedule } from "@/hooks/quarterly/useQuarterlyTesting";
import { EmissionTest } from "@/hooks/quarterly/useQuarterlyTesting";
import EmissionTestTable from "./EmissionTestTable";
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
    getFilteredRowModel,
} from "@tanstack/react-table";

interface ScheduleTableProps {
    schedules: TestSchedule[];
    isLoading: boolean;
    emissionTests: EmissionTest[];
    selectedScheduleId: string | null;
    setSelectedScheduleId: React.Dispatch<React.SetStateAction<string | null>>;
    onEditTest: (test: EmissionTest) => void;
    onDeleteTest: (test: EmissionTest) => void;
    onEditSchedule: (schedule: TestSchedule) => void;
    onDeleteSchedule: (schedule: TestSchedule) => void;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
    schedules,
    isLoading,
    emissionTests,
    selectedScheduleId,
    setSelectedScheduleId,
    onEditTest,
    onDeleteTest,
    onEditSchedule,
    onDeleteSchedule,
}) => {
    // Helper to detect if a schedule is pending sync
    const isPendingSync = (id: string) => id.startsWith('pending-');

    // Density state
    const [density, setDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');
    const densityClasses = {
        compact: 'text-xs h-6',
        normal: 'text-sm h-9',
        spacious: 'text-base h-12',
    };
    // Column visibility state
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

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
                let date: Date;
                if (typeof value === 'number') {
                    date = new Date(value);
                } else if (typeof value === 'string' && /^\d+$/.test(value)) {
                    date = new Date(Number(value));
                } else {
                    date = new Date(value);
                }
                return (
                    <>
                        {!isNaN(date.getTime()) ? format(date, "MMM dd, yyyy") : "Invalid date"}
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
                            <Button variant="ghost" className="h-8 w-8 p-0 vehicle-action-btn">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedScheduleId(row.original.id)}>
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
        state: { sorting, pagination, columnVisibility },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (isLoading) {
        return <div className="text-center py-8 text-muted-foreground">Loading schedules...</div>;
    }

    if (schedules.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No test schedules found for the selected filters. Create a new schedule to get started.
            </div>
        );
    }

    // Split view: left = schedule list, right = details
    if (selectedScheduleId) {
        const selectedSchedule = schedules.find(s => s.id === selectedScheduleId);
        const filteredTests = emissionTests.filter(
            t => t.year === selectedSchedule?.year && t.quarter === selectedSchedule?.quarter
        );
        return (
            <div className="flex gap-4">
                {/* Left: Schedule List */}
                <div className="w-1/2 border-r pr-2">
                    <div className="font-semibold mb-2">Test Schedules</div>
                    <div className="rounded-md border overflow-x-auto">
                        <Table className="text-sm">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Quarter</TableHead>
                                    <TableHead>Personnel</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.map((schedule) => (
                                    <TableRow
                                        key={schedule.id}
                                        className={`cursor-pointer ${schedule.id === selectedScheduleId ? 'bg-primary/10 font-bold' : ''}`}
                                        onClick={() => setSelectedScheduleId(schedule.id)}
                                    >
                                        <TableCell>{schedule.year}</TableCell>
                                        <TableCell>{`Q${schedule.quarter}`}</TableCell>
                                        <TableCell>{schedule.assignedPersonnel}</TableCell>
                                        <TableCell>{schedule.location}</TableCell>
                                        <TableCell>{(() => {
                                            const value = schedule.conductedOn;
                                            let date: Date;
                                            if (typeof value === 'number') {
                                                date = new Date(value);
                                            } else if (typeof value === 'string' && /^\d+$/.test(value)) {
                                                date = new Date(Number(value));
                                            } else {
                                                date = new Date(value);
                                            }
                                            return !isNaN(date.getTime()) ? format(date, "MMM dd, yyyy") : "Invalid date";
                                        })()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <Button className="mt-4 w-full" variant="outline" onClick={() => setSelectedScheduleId(null)}>
                        Back to All Schedules
                    </Button>
                </div>
                {/* Right: Details */}
                <div className="w-1/2 pl-2">
                    <div className="font-semibold mb-2">Test Results for Q{selectedSchedule?.quarter}, {selectedSchedule?.year}</div>
                    <EmissionTestTable
                        tests={filteredTests}
                        isLoading={isLoading}
                        onEditTest={onEditTest}
                        onDeleteTest={onDeleteTest}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2 text-xs">
            {/* Column Visibility Toggle & Density */}
            <div className="flex justify-between items-center py-1">
                <div className="text-xs text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} schedules
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
                                checked={table.getColumn("year")?.getIsVisible()}
                                onCheckedChange={value => table.getColumn("year")?.toggleVisibility(value)}
                            >
                                Year
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={table.getColumn("quarter")?.getIsVisible()}
                                onCheckedChange={value => table.getColumn("quarter")?.toggleVisibility(value)}
                            >
                                Quarter
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={table.getColumn("assignedPersonnel")?.getIsVisible()}
                                onCheckedChange={value => table.getColumn("assignedPersonnel")?.toggleVisibility(value)}
                            >
                                Personnel
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={table.getColumn("location")?.getIsVisible()}
                                onCheckedChange={value => table.getColumn("location")?.toggleVisibility(value)}
                            >
                                Location
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={table.getColumn("conductedOn")?.getIsVisible()}
                                onCheckedChange={value => table.getColumn("conductedOn")?.toggleVisibility(value)}
                            >
                                Date
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
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id} className={densityClasses[density]}>
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
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className={`transition cursor-pointer ${densityClasses[density]} ${(row.original.id.toString().startsWith('pending-') ? 'opacity-60 bg-gray-50' : '')}`}
                                    onClick={() => setSelectedScheduleId(row.original.id)}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} className="px-2 py-1">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className={densityClasses[density]}>
                                <TableCell colSpan={columns.length} className="text-center py-4">
                                    No schedules found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

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
                </div>
            )}
        </div>
    );
};

export default ScheduleTable;