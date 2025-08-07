import React, { useState, useMemo } from "react";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import { Alert, AlertDescription } from "@/presentation/components/shared/ui/alert";
import {
    Plus,
    Edit,
    Trash,
    Eye,
    Search,
    Leaf,
    TrendingUp,
    Users,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
    useSaplingCollections,
    useSaplingStatistics,
    useSaplingCollectionMutations,
    filterSaplingCollections,
    transformSaplingForDisplay,
    getPurposeLabel,
    getSaplingStatusLabel,
} from "../logic/usePlantingRecords";
import { SaplingCollection } from "@/core/api/planting-api";
import SaplingCollectionForm from "./SaplingCollectionForm";

const SaplingCollectionTab: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [purposeFilter, setPurposeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit" | "view">("add");
    const [selectedCollection, setSelectedCollection] = useState<SaplingCollection | null>(null);

    // Hooks
    const { data: collections = [], isLoading, error, refetch } = useSaplingCollections();
    const { data: statistics } = useSaplingStatistics();
    const { createMutation, updateMutation, deleteMutation } = useSaplingCollectionMutations();

    // Filter data
    const filteredData = useMemo(() => {
        return filterSaplingCollections(collections, searchTerm, purposeFilter, statusFilter);
    }, [collections, searchTerm, purposeFilter, statusFilter]);

    // Status and purpose colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case "collected": return "bg-blue-100 text-blue-800";
            case "nursery": return "bg-yellow-100 text-yellow-800";
            case "ready_for_planting": return "bg-green-100 text-green-800";
            case "planted": return "bg-emerald-100 text-emerald-800";
            case "distributed": return "bg-purple-100 text-purple-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getPurposeColor = (purpose: string) => {
        switch (purpose) {
            case "replacement": return "bg-orange-100 text-orange-800";
            case "reforestation": return "bg-green-100 text-green-800";
            case "distribution": return "bg-blue-100 text-blue-800";
            case "nursery": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getHealthColor = (condition: string) => {
        switch (condition) {
            case "excellent": return "bg-green-100 text-green-800";
            case "good": return "bg-blue-100 text-blue-800";
            case "fair": return "bg-yellow-100 text-yellow-800";
            case "poor": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Column definitions
    const columns: ColumnDef<SaplingCollection>[] = useMemo(() => [
        {
            accessorKey: "collection_number",
            header: "Collection No.",
        },
        {
            accessorKey: "species_name",
            header: "Species",
        },
        {
            accessorKey: "quantity_collected",
            header: "Quantity",
        },
        {
            accessorKey: "collection_location",
            header: "Collection Location",
            cell: ({ getValue }) => {
                const location = getValue() as string;
                return <span className="truncate max-w-[200px]" title={location}>{location}</span>;
            },
        },
        {
            accessorKey: "collection_date",
            header: "Collection Date",
        },
        {
            accessorKey: "purpose",
            header: "Purpose",
            cell: ({ getValue }) => {
                const purpose = getValue() as string;
                return (
                    <Badge className={getPurposeColor(purpose)}>
                        {getPurposeLabel(purpose)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ getValue }) => {
                const status = getValue() as string;
                return (
                    <Badge className={getStatusColor(status)}>
                        {getSaplingStatusLabel(status)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "health_condition",
            header: "Health",
            cell: ({ getValue }) => {
                const condition = getValue() as string;
                return condition ? (
                    <Badge className={getHealthColor(condition)}>
                        {condition.toUpperCase()}
                    </Badge>
                ) : (
                    <span className="text-gray-400">N/A</span>
                );
            },
        },
        {
            accessorKey: "survival_rate",
            header: "Survival Rate",
            cell: ({ getValue }) => {
                const rate = getValue() as number;
                return rate ? `${rate}%` : "N/A";
            },
        },
        {
            accessorKey: "collector_name",
            header: "Collector",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCollection(row.original)}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCollection(row.original)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCollection(row.original)}
                    >
                        <Trash className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ], []);

    // Event handlers
    const handleAddCollection = () => {
        setFormMode("add");
        setSelectedCollection(null);
        setIsFormOpen(true);
    };

    const handleEditCollection = (collection: SaplingCollection) => {
        setFormMode("edit");
        setSelectedCollection(collection);
        setIsFormOpen(true);
    };

    const handleViewCollection = (collection: SaplingCollection) => {
        setFormMode("view");
        setSelectedCollection(collection);
        setIsFormOpen(true);
    };

    const handleDeleteCollection = (collection: SaplingCollection) => {
        if (confirm(`Are you sure you want to delete sapling collection ${collection.collection_number}?`)) {
            deleteMutation.mutate(collection.id);
        }
    };

    const handleFormSave = (data: any) => {
        if (formMode === "add") {
            createMutation.mutate(data, {
                onSuccess: () => setIsFormOpen(false)
            });
        } else if (formMode === "edit" && selectedCollection) {
            updateMutation.mutate({
                id: selectedCollection.id,
                data
            }, {
                onSuccess: () => setIsFormOpen(false)
            });
        }
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setSelectedCollection(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Plant Sapling Collections</CardTitle>
                        <Button onClick={handleAddCollection} size="sm" disabled={isLoading}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Collection
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert className="border-red-200 bg-red-50 mb-4">
                                <AlertDescription className="text-red-700">
                                    Failed to load sapling collection records. Please try again.
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => refetch()}
                                        className="ml-2 h-auto p-0 text-red-700 underline"
                                    >
                                        Try Again
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search by collection number, species, location, or collector..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <select
                                value={purposeFilter}
                                onChange={(e) => setPurposeFilter(e.target.value)}
                                className="px-3 py-2 border rounded-md"
                            >
                                <option value="all">All Purposes</option>
                                <option value="replacement">Replacement</option>
                                <option value="reforestation">Reforestation</option>
                                <option value="distribution">Distribution</option>
                                <option value="nursery">Nursery</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border rounded-md"
                            >
                                <option value="all">All Status</option>
                                <option value="collected">Collected</option>
                                <option value="nursery">In Nursery</option>
                                <option value="ready_for_planting">Ready for Planting</option>
                                <option value="planted">Planted</option>
                                <option value="distributed">Distributed</option>
                            </select>
                        </div>

                        {/* Data Table */}
                        {isLoading && collections.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-600">Loading collections...</p>
                                </div>
                            </div>
                        ) : (
                            <DataTable
                                data={filteredData}
                                columns={columns}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Statistics Sidebar */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <Leaf className="w-5 h-5 mr-2" />
                            Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {statistics ? (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Collections:</span>
                                    <Badge variant="outline">{statistics.total_collections}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Saplings:</span>
                                    <span className="font-semibold">{statistics.total_quantity.toLocaleString()}</span>
                                </div>

                                {statistics.survival_rate_avg && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Avg. Survival Rate:</span>
                                        <span className="font-semibold text-green-600">
                                            {statistics.survival_rate_avg.toFixed(1)}%
                                        </span>
                                    </div>
                                )}

                                {/* By Species */}
                                <div className="pt-2 border-t">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">By Species</h4>
                                    <div className="space-y-2">
                                        {Object.entries(statistics.by_species)
                                            .sort(([, a], [, b]) => b.quantity - a.quantity)
                                            .slice(0, 5)
                                            .map(([species, data]) => (
                                                <div key={species} className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 truncate" title={species}>{species}:</span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-green-100 text-green-800">{data.count}</Badge>
                                                        <span className="text-xs text-gray-500">({data.quantity})</span>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>

                                {/* By Purpose */}
                                <div className="pt-2 border-t">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">By Purpose</h4>
                                    <div className="space-y-2">
                                        {Object.entries(statistics.by_purpose).map(([purpose, data]) => (
                                            <div key={purpose} className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">{getPurposeLabel(purpose)}:</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getPurposeColor(purpose)}>{data.count}</Badge>
                                                    <span className="text-xs text-gray-500">({data.quantity})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* By Status */}
                                <div className="pt-2 border-t">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">By Status</h4>
                                    <div className="space-y-2">
                                        {Object.entries(statistics.by_status).map(([status, count]) => (
                                            <div key={status} className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">{getSaplingStatusLabel(status)}:</span>
                                                <Badge className={getStatusColor(status)}>{count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-sm text-gray-500">
                                Loading statistics...
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {formMode === "add" && "Add Sapling Collection"}
                            {formMode === "edit" && "Edit Sapling Collection"}
                            {formMode === "view" && "View Sapling Collection"}
                        </DialogTitle>
                    </DialogHeader>
                    <SaplingCollectionForm
                        mode={formMode}
                        initialData={selectedCollection}
                        onSave={handleFormSave}
                        onCancel={handleFormCancel}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SaplingCollectionTab;
