import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/presentation/components/shared/ui/table";
import { Search, X, RefreshCw, Plus } from "lucide-react";
import { AirQualityRecord } from "@/core/api/air-quality-api";
import { SmokeBelcherSearchParams } from "../logic/useSmokeBelcherData";
import AddRecordDialog from "./AddRecordDialog";

interface VehicleSearchComponentProps {
    searchResults: AirQualityRecord[];
    selectedRecord: AirQualityRecord | null;
    isLoading: boolean;
    onSearch: (params: SmokeBelcherSearchParams) => void;
    onSelectRecord: (record: AirQualityRecord) => void;
    onRefreshData?: () => void;
}

const VehicleSearchComponent: React.FC<VehicleSearchComponentProps> = ({
    searchResults,
    selectedRecord,
    isLoading,
    onSearch,
    onSelectRecord,
    onRefreshData,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddDialog, setShowAddDialog] = useState(false);

    const handleSearch = () => {
        const params: SmokeBelcherSearchParams = {};

        if (searchQuery.trim()) {
            // For combined search, we search both plate number and operator name
            params.plateNumber = searchQuery.trim();
            params.operatorName = searchQuery.trim();
        }
        // If searchQuery is empty, params will be empty which will return all records

        onSearch(params);
    };

    // Auto-search when search query changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Initial search on component mount
    useEffect(() => {
        handleSearch();
    }, []);

    const handleClearAll = () => {
        setSearchQuery("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleRecordCreated = () => {
        // Refresh the search results after creating a new record
        handleSearch();
        onRefreshData?.();
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Vehicle Search
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Search Form */}
                <div className="space-y-4">
                    <div className="relative">
                        <Label htmlFor="searchQuery">Search Vehicle</Label>
                        <div className="flex gap-2 mt-1">
                            <div className="relative flex-1">
                                <Input
                                    id="searchQuery"
                                    placeholder="Search by plate number or operator name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="pr-8"
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
                            <Button
                                onClick={() => setShowAddDialog(true)}
                                className="px-3"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Record
                            </Button>
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8">
                                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                                            Searching...
                                        </TableCell>
                                    </TableRow>
                                ) : searchResults.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                            No records found. Try adjusting your search criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    searchResults.map((record) => (
                                        <TableRow
                                            key={record.id}
                                            className={`cursor-pointer hover:bg-muted/50 ${selectedRecord?.id === record.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                                }`}
                                            onClick={() => onSelectRecord(record)}
                                        >
                                            <TableCell className="font-medium">{record.plate_number}</TableCell>
                                            <TableCell>{record.vehicle_type}</TableCell>
                                            <TableCell className="truncate max-w-[120px]" title={record.operator_company_name}>
                                                {record.operator_company_name}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>

            {/* Add Record Dialog */}
            <AddRecordDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onRecordCreated={handleRecordCreated}
            />
        </Card>
    );
};

export default VehicleSearchComponent;
