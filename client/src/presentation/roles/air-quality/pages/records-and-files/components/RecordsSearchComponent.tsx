import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/presentation/components/shared/ui/table";
import { Search, X, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";

interface VehicleRecord {
    id: string;
    plateNumber: string;
    vehicleType: string;
    operatorName: string;
    transportGroup: string;
    registrationDate: string;
    status: "active" | "suspended" | "expired";
}

interface RecordsSearchComponentProps {
    searchResults: VehicleRecord[];
    selectedRecord: VehicleRecord | null;
    isLoading: boolean;
    onSearch: (query: string) => void;
    onSelectRecord: (record: VehicleRecord) => void;
}

const RecordsSearchComponent: React.FC<RecordsSearchComponentProps> = ({
    searchResults,
    selectedRecord,
    isLoading,
    onSearch,
    onSelectRecord,
}) => {
    const [searchQuery, setSearchQuery] = useState("");

    // Auto-search when search query changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearch(searchQuery);
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, onSearch]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "text-green-600";
            case "suspended": return "text-yellow-600";
            case "expired": return "text-red-600";
            default: return "text-gray-600";
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Vehicle Records
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Search Form */}
                <div className="space-y-4">
                    <div className="relative">
                        <Label htmlFor="searchQuery">Search Records</Label>
                        <div className="relative">
                            <Input
                                id="searchQuery"
                                placeholder="Search by plate number, operator, or transport group..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="mt-1 pr-8"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search Results */}
                <div className="flex-1 min-h-0">
                    <div className="h-full overflow-auto border rounded">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Plate No.</TableHead>
                                    <TableHead className="w-[80px]">Type</TableHead>
                                    <TableHead>Operator</TableHead>
                                    <TableHead className="w-[80px]">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">
                                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                                            Searching...
                                        </TableCell>
                                    </TableRow>
                                ) : searchResults.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                            No records found. Try adjusting your search criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    searchResults.map((record) => (
                                        <TableRow
                                            key={record.id}
                                            className={`cursor-pointer hover:bg-muted/50 ${selectedRecord?.id === record.id ? "bg-muted" : ""
                                                }`}
                                            onClick={() => onSelectRecord(record)}
                                        >
                                            <TableCell className="font-medium">{record.plateNumber}</TableCell>
                                            <TableCell>{record.vehicleType}</TableCell>
                                            <TableCell className="truncate max-w-[120px]" title={record.operatorName}>
                                                {record.operatorName}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`capitalize font-medium ${getStatusColor(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default RecordsSearchComponent;
