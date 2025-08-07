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
    TreePine,
    Activity,
    TrendingUp,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
    useUrbanGreeningPlantings,
    useUrbanGreeningStatistics,
    useUrbanGreeningPlantingMutations,
    filterUrbanGreeningPlantings,
    transformPlantingForDisplay,
    getPlantingTypeLabel,
    getPlantingStatusLabel,
} from "../logic/usePlantingRecords";
import { UrbanGreeningPlanting } from "@/core/api/planting-api";
import UrbanGreeningPlantingForm from "./UrbanGreeningPlantingForm";

const UrbanGreeningPlantingTab: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit" | "view">("add");
    const [selectedPlanting, setSelectedPlanting] = useState<UrbanGreeningPlanting | null>(null);

    // Hooks
    const { data: plantings = [], isLoading, error, refetch } = useUrbanGreeningPlantings();
    const { data: statistics } = useUrbanGreeningStatistics();
    const { createMutation, updateMutation, deleteMutation } = useUrbanGreeningPlantingMutations();

    // Filter data
    const filteredData = useMemo(() => {
        return filterUrbanGreeningPlantings(plantings, searchTerm, typeFilter, statusFilter);
    }, [plantings, searchTerm, typeFilter, statusFilter]);

    // Status and type colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case "planted": return "bg-blue-100 text-blue-800";
            case "growing": return "bg-green-100 text-green-800";
            case "mature": return "bg-emerald-100 text-emerald-800";
            case "died": return "bg-red-100 text-red-800";
            case "removed": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "ornamental_plants": return "bg-pink-100 text-pink-800";
            case "trees": return "bg-green-100 text-green-800";
            case "seeds": return "bg-yellow-100 text-yellow-800";
            case "seeds_private": return "bg-purple-100 text-purple-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Column definitions
    const columns: ColumnDef<UrbanGreeningPlanting>[] = useMemo(() => [
        {
            accessorKey: "record_number",
            header: "Record No.",
        },
        {
            accessorKey: "planting_type",
            header: "Type",
            cell: ({ getValue }) => {
                const type = getValue() as string;
                return (
                    <Badge className={getTypeColor(type)}>
                        {getPlantingTypeLabel(type)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "species_name",
            header: "Species",
        },
        {
            accessorKey: "quantity_planted",
            header: "Quantity",
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ getValue }) => {
                const location = getValue() as string;
                return <span className="truncate max-w-[200px]" title={location}>{location}</span>;
            },
        },
        {
            accessorKey: "planting_date",
            header: "Date",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ getValue }) => {
                const status = getValue() as string;
                return (
                    <Badge className={getStatusColor(status)}>
                        {getPlantingStatusLabel(status)}
                    </Badge>
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
            accessorKey: "responsible_person",
            header: "Responsible Person",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPlanting(row.original)}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPlanting(row.original)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlanting(row.original)}
                    >
                        <Trash className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ], []);

    // Event handlers
    const handleAddPlanting = () => {
        setFormMode("add");
        setSelectedPlanting(null);
        setIsFormOpen(true);
    };

    const handleEditPlanting = (planting: UrbanGreeningPlanting) => {
        setFormMode("edit");
        setSelectedPlanting(planting);
        setIsFormOpen(true);
    };

    const handleViewPlanting = (planting: UrbanGreeningPlanting) => {
        setFormMode("view");
        setSelectedPlanting(planting);
        setIsFormOpen(true);
    };

    const handleDeletePlanting = (planting: UrbanGreeningPlanting) => {
        if (confirm(`Are you sure you want to delete planting record ${planting.record_number}?`)) {
            deleteMutation.mutate(planting.id);
        }
    };

    const handleFormSave = (data: any) => {
        if (formMode === "add") {
            createMutation.mutate(data, {
                onSuccess: () => setIsFormOpen(false)
            });
        } else if (formMode === "edit" && selectedPlanting) {
            updateMutation.mutate({
                id: selectedPlanting.id,
                data
            }, {
                onSuccess: () => setIsFormOpen(false)
            });
        }
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setSelectedPlanting(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Urban Greening Plantings</CardTitle>
                        <Button onClick={handleAddPlanting} size="sm" disabled={isLoading}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Planting
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert className="border-red-200 bg-red-50 mb-4">
                                <AlertDescription className="text-red-700">
                                    Failed to load planting records. Please try again.
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
                                        placeholder="Search by record number, species, location, or person..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2 border rounded-md"
                            >
                                <option value="all">All Types</option>
                                <option value="ornamental_plants">Ornamental Plants</option>
                                <option value="trees">Trees</option>
                                <option value="seeds">Seeds</option>
                                <option value="seeds_private">Seeds (Private)</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border rounded-md"
                            >
                                <option value="all">All Status</option>
                                <option value="planted">Planted</option>
                                <option value="growing">Growing</option>
                                <option value="mature">Mature</option>
                                <option value="died">Died</option>
                                <option value="removed">Removed</option>
                            </select>
                        </div>

                        {/* Data Table */}
                        {isLoading && plantings.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-600">Loading plantings...</p>
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
                            <TreePine className="w-5 h-5 mr-2" />
                            Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {statistics ? (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Plantings:</span>
                                    <Badge variant="outline">{statistics.total_plantings}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Quantity:</span>
                                    <span className="font-semibold">{statistics.total_quantity.toLocaleString()}</span>
                                </div>

                                {/* By Type */}
                                <div className="pt-2 border-t">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">By Type</h4>
                                    <div className="space-y-2">
                                        {Object.entries(statistics.by_type).map(([type, data]) => (
                                            <div key={type} className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">{getPlantingTypeLabel(type)}:</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getTypeColor(type)}>{data.count}</Badge>
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
                                                <span className="text-sm text-gray-600">{getPlantingStatusLabel(status)}:</span>
                                                <Badge className={getStatusColor(status)}>{count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Monthly Progress */}
                                <div className="pt-2 border-t">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        <Activity className="w-4 h-4 inline mr-1" />
                                        This Year
                                    </h4>
                                    <div className="space-y-1">
                                        {Object.entries(statistics.by_month)
                                            .sort(([a], [b]) => parseInt(b) - parseInt(a))
                                            .slice(0, 3)
                                            .map(([month, data]) => (
                                                <div key={month} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600">
                                                        {new Date(2024, parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' })}:
                                                    </span>
                                                    <span>{data.count} ({data.quantity})</span>
                                                </div>
                                            ))
                                        }
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
                            {formMode === "add" && "Add Urban Greening Planting"}
                            {formMode === "edit" && "Edit Urban Greening Planting"}
                            {formMode === "view" && "View Urban Greening Planting"}
                        </DialogTitle>
                    </DialogHeader>
                    <UrbanGreeningPlantingForm
                        mode={formMode}
                        initialData={selectedPlanting}
                        onSave={handleFormSave}
                        onCancel={handleFormCancel}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UrbanGreeningPlantingTab;
