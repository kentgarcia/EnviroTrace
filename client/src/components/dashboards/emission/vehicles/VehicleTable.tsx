import React, { useState, Suspense } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Vehicle } from "@/hooks/vehicles/useVehicles";
import { Badge } from "@/components/ui/badge";

interface VehicleTableProps {
    vehicles: Vehicle[];
    isLoading: boolean;
    isOffline: boolean;
    onView: (vehicle: Vehicle) => void;
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (vehicle: Vehicle) => void;
}

// Skeleton loader for the table
export const VehicleTableSkeleton: React.FC = () => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
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
    isOffline,
    onView,
    onEdit,
    onDelete
}) => {
    // Pagination state
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Sort state
    const [sortField, setSortField] = useState<keyof Vehicle>('plateNumber');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Handle sorting
    const handleSort = (field: keyof Vehicle) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Sort and paginate vehicles
    const sortedVehicles = [...vehicles].sort((a, b) => {
        if (a[sortField] == null) return sortDirection === 'asc' ? 1 : -1;
        if (b[sortField] == null) return sortDirection === 'asc' ? -1 : 1;

        if (typeof a[sortField] === 'string' && typeof b[sortField] === 'string') {
            return sortDirection === 'asc'
                ? (a[sortField] as string).localeCompare(b[sortField] as string)
                : (b[sortField] as string).localeCompare(a[sortField] as string);
        }

        return sortDirection === 'asc'
            ? a[sortField] > b[sortField] ? 1 : -1
            : a[sortField] < b[sortField] ? 1 : -1;
    });

    const totalRows = sortedVehicles.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const paginatedVehicles = sortedVehicles.slice(
        (page - 1) * rowsPerPage,
        Math.min(page * rowsPerPage, totalRows)
    );

    // Pagination handlers
    const handlePrev = () => setPage((p) => Math.max(1, p - 1));
    const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
    const handleRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    };

    // Sort indicator component
    const SortIndicator = ({ field }: { field: keyof Vehicle }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc'
            ? <ChevronUp className="ml-1 h-4 w-4 inline" />
            : <ChevronDown className="ml-1 h-4 w-4 inline" />;
    };

    // Format date helper
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not tested";
        return format(new Date(dateString), 'MMM dd, yyyy');
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

    if (isLoading) {
        return <VehicleTableSkeleton />;
    }

    return (
        <div className="space-y-2">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="cursor-pointer whitespace-nowrap"
                                onClick={() => handleSort('plateNumber')}
                            >
                                Plate Number <SortIndicator field="plateNumber" />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer whitespace-nowrap"
                                onClick={() => handleSort('officeName')}
                            >
                                Office <SortIndicator field="officeName" />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer whitespace-nowrap"
                                onClick={() => handleSort('driverName')}
                            >
                                Driver <SortIndicator field="driverName" />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer whitespace-nowrap"
                                onClick={() => handleSort('vehicleType')}
                            >
                                Type <SortIndicator field="vehicleType" />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer whitespace-nowrap"
                                onClick={() => handleSort('latestTestDate')}
                            >
                                Latest Test <SortIndicator field="latestTestDate" />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer whitespace-nowrap"
                                onClick={() => handleSort('latestTestResult')}
                            >
                                Result <SortIndicator field="latestTestResult" />
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {totalRows === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    No vehicles found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedVehicles.map((vehicle) => (
                                <TableRow
                                    key={vehicle.id}
                                    className={vehicle.id.toString().startsWith('pending-') ? 'opacity-60 bg-gray-50' : ''}
                                >
                                    <TableCell
                                        className="font-medium text-blue-900 cursor-pointer hover:text-blue-600"
                                        onClick={() => onView(vehicle)}
                                        title="View vehicle details"
                                    >
                                        {vehicle.plateNumber}
                                    </TableCell>
                                    <TableCell>{vehicle.officeName}</TableCell>
                                    <TableCell>{vehicle.driverName}</TableCell>
                                    <TableCell>
                                        <span title={`${vehicle.vehicleType}, ${vehicle.engineType} engine, ${vehicle.wheels} wheels`}>
                                            {vehicle.vehicleType}
                                        </span>
                                    </TableCell>
                                    <TableCell>{formatDate(vehicle.latestTestDate)}</TableCell>
                                    <TableCell>{renderTestResultBadge(vehicle)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onView(vehicle)}>
                                                    <Eye className="mr-2 h-4 w-4" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(vehicle)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalRows > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2 py-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
                        <select
                            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                            value={rowsPerPage}
                            onChange={handleRowsPerPage}
                        >
                            {[5, 10, 20, 50, 100].map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrev}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>

                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNext}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {totalRows === 0
                            ? "0"
                            : `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalRows)}`} of {totalRows} items
                    </div>
                </div>
            )}
        </div>
    );
};