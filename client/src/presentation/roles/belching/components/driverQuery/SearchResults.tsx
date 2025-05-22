import React from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Badge } from "@/presentation/components/shared/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/presentation/components/shared/ui/table";
import { DriverRecord } from "@/lib/api/driver-api";

interface SearchResultsProps {
    results: DriverRecord[];
    selectedDriver: DriverRecord | null;
    loading: boolean;
    error: string | null;
    onViewDriver: (driver: DriverRecord) => void;
    onEditDriver: (driver: DriverRecord) => void;
    onDeleteDriver: (driver: DriverRecord) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
    results,
    selectedDriver,
    loading,
    error,
    onViewDriver,
    onEditDriver,
    onDeleteDriver,
}) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'suspended': return 'bg-red-500';
            case 'warning': return 'bg-yellow-500';
            case 'active': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    }; return (
        <div className="border border-gray-300">
            {error && <div className="text-red-600 mb-2 p-4">{error}</div>}
            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : results.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No drivers found. Try a different search or add a new driver.
                </div>
            ) : (
                <Table>
                    <TableHeader className="bg-primary">
                        <TableRow>
                            <TableHead className="text-white">Driver Name</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                            <TableHead className="text-white">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((row) => (
                            <TableRow
                                key={row.id}
                                className={selectedDriver?.id === row.id ? "bg-blue-50" : ""}
                            >
                                <TableCell>
                                    <div>{row.name}</div>
                                    <div className="text-xs text-gray-500">{row.license_no}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(row.status)}>
                                        {row.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant={selectedDriver?.id === row.id ? "default" : "outline"}
                                            onClick={() => onViewDriver(row)}
                                        >
                                            {selectedDriver?.id === row.id ? "Selected" : "View"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => onEditDriver(row)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => onDeleteDriver(row)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};

export default SearchResults;
