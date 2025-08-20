import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/presentation/components/shared/ui/table";
import { Search, X, RefreshCw, Plus, UserPlus } from "lucide-react";
import { Driver } from "@/core/api/belching-api";
import { DriverSearchParams } from "../logic/useDriverQueryData";
import AddDriverDialog from "./AddDriverDialog";

interface DriverSearchComponentProps {
    searchResults: Driver[];
    selectedDriver: Driver | null;
    isLoading: boolean;
    onSearch: (params: DriverSearchParams) => void;
    onSelectDriver: (driver: Driver) => void;
    onRefreshData?: () => void;
}

const DriverSearchComponent: React.FC<DriverSearchComponentProps> = ({
    searchResults,
    selectedDriver,
    isLoading,
    onSearch,
    onSelectDriver,
    onRefreshData,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddDialog, setShowAddDialog] = useState(false);

    const handleSearch = () => {
        const params: DriverSearchParams = {};

        if (searchQuery.trim()) {
            params.search = searchQuery.trim();
        }

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

    const handleDriverCreated = () => {
        // Refresh the search results after creating a new driver
        handleSearch();
        onRefreshData?.();
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Driver Search
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Search Form */}
                <div className="space-y-4">
                    <div className="relative">
                        <Label htmlFor="searchQuery">Search Driver</Label>
                        <div className="flex gap-2 mt-1">
                            <div className="relative flex-1">
                                <Input
                                    id="searchQuery"
                                    placeholder="Search by name or license number..."
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
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Driver
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>License No.</TableHead>
                                    <TableHead>Address</TableHead>
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
                                            No drivers found. Try adjusting your search criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    searchResults.map((driver) => (
                                        <TableRow
                                            key={driver.id}
                                            className={`cursor-pointer hover:bg-muted/50 ${selectedDriver?.id === driver.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                                }`}
                                            onClick={() => onSelectDriver(driver)}
                                        >
                                            <TableCell className="font-medium">
                                                {`${driver.first_name} ${driver.middle_name || ""} ${driver.last_name}`.trim()}
                                            </TableCell>
                                            <TableCell>{driver.license_number}</TableCell>
                                            <TableCell className="truncate max-w-[150px]" title={driver.address}>
                                                {driver.address}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>

            {/* Add Driver Dialog */}
            <AddDriverDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onDriverCreated={handleDriverCreated}
            />
        </Card>
    );
};

export default DriverSearchComponent;
