import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/presentation/components/shared/ui/table";
import { Search, RefreshCw, Plus, Receipt, ChevronLeft, X } from "lucide-react";
import { OrderOfPaymentSearchParams } from "../logic/useOrderOfPaymentData";
import { OrderOfPayment } from "../logic/types";

interface OrderOfPaymentSearchComponentProps {
    searchResults: OrderOfPayment[];
    selectedOrder: OrderOfPayment | null;
    isLoading: boolean;
    onSearch: (params: OrderOfPaymentSearchParams) => void;
    onSelectOrder: (order: OrderOfPayment) => void;
    onRefreshData?: () => void;
    onToggleVisibility?: () => void;
    showAsFullPage?: boolean;
}

const OrderOfPaymentSearchComponent: React.FC<OrderOfPaymentSearchComponentProps> = ({
    searchResults,
    selectedOrder,
    isLoading,
    onSearch,
    onSelectOrder,
    onRefreshData,
    onToggleVisibility,
    showAsFullPage = false,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState<string>(""); // Remove default date filter to show all orders

    const handleSearch = () => {
        const params: OrderOfPaymentSearchParams = {};

        if (searchQuery.trim()) {
            params.search = searchQuery.trim();
        }

        if (dateFilter) {
            params.created_date = dateFilter;
        }

        // Set a high limit to get all orders
        params.limit = 1000;

        onSearch(params);
    };

    // Auto-search when search query or date changes
    useEffect(() => {
        // If no filters are set, search immediately
        if (!searchQuery.trim() && !dateFilter) {
            handleSearch();
            return;
        }

        // Otherwise, debounce the search
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, dateFilter]);

    // Initial search on component mount to load all orders
    useEffect(() => {
        handleSearch();
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Order of Payment Search
                    </CardTitle>
                    {!showAsFullPage && onToggleVisibility && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggleVisibility}
                            className="h-8 w-8 p-0"
                            title="Hide Search Panel"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Search Form */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="searchQuery">Search</Label>
                            <div className="relative">
                                <Input
                                    id="searchQuery"
                                    placeholder="Control number, plate number, operator..."
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateFilter">Date Created (optional)</Label>
                            <Input
                                id="dateFilter"
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                placeholder="Filter by date (leave empty for all dates)"
                            />
                        </div>
                    </div>

                    {/* Search Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                            {!searchQuery && !dateFilter
                                ? "Showing all orders"
                                : `Filtered results${searchResults.length > 0 ? ` (${searchResults.length} found)` : ''}`
                            }
                        </span>
                        {(searchQuery || dateFilter) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery("");
                                    setDateFilter("");
                                }}
                                className="text-xs"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search Results */}
                <div className="flex-1 min-h-0">
                    <div className="h-full overflow-auto border rounded">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Control No.</TableHead>
                                    <TableHead>Plate No.</TableHead>
                                    <TableHead>Operator</TableHead>
                                    <TableHead>Date Created</TableHead>
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
                                            No orders of payment found. Try adjusting your search criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    searchResults.map((order) => (
                                        <TableRow
                                            key={order.id}
                                            className={`cursor-pointer hover:bg-muted/50 ${selectedOrder?.id === order.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                                }`}
                                            onClick={() => onSelectOrder(order)}
                                        >
                                            <TableCell className="font-medium">{order.control_number}</TableCell>
                                            <TableCell>{order.plate_number}</TableCell>
                                            <TableCell className="truncate max-w-[120px]" title={order.operator_name}>
                                                {order.operator_name}
                                            </TableCell>
                                            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
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

export default OrderOfPaymentSearchComponent;
