import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Car, Search, Filter } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { useVehicles } from "@/core/api/emission-service";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/shared/ui/select";

const VehiclesDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("");
    const [engineTypeFilter, setEngineTypeFilter] = useState<string>("");

    // Get filters from URL params if available
    const quarter = searchParams.get("quarter");
    const year = searchParams.get("year");

    const { data: vehiclesData, isLoading, error } = useVehicles({
        search: searchTerm || undefined,
        vehicle_type: vehicleTypeFilter || undefined,
        engine_type: engineTypeFilter || undefined,
    });

    const vehicles = vehiclesData?.vehicles || [];

    // Filter vehicles based on quarter/year if provided
    const filteredVehicles = vehicles.filter(vehicle => {
        if (!quarter || !year) return true;
        // For now, we'll show all vehicles as we don't have test date filtering in the vehicles API
        return true;
    });

    const getStatusBadge = (vehicle: any) => {
        if (vehicle.latest_test_result === null) {
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Untested</Badge>;
        }
        return vehicle.latest_test_result ?
            <Badge variant="default" className="bg-green-100 text-green-800">Passed</Badge> :
            <Badge variant="destructive" className="bg-red-100 text-red-800">Failed</Badge>;
    };

    if (error) {
        return (
            <div className="flex min-h-screen w-full">
                <div className="flex-1 overflow-auto">
                    <TopNavBarContainer dashboardType="government-emission" />
                    <div className="p-6">
                        <div className="text-red-600">Error loading vehicles data</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 overflow-auto">
                <TopNavBarContainer dashboardType="government-emission" />

                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                        <div className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-blue-600" />
                            <h1 className="text-2xl font-semibold text-gray-900">
                                All Vehicles
                                {quarter && year && (
                                    <span className="text-lg text-gray-600 ml-2">
                                        ({year} Q{quarter})
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 min-w-[300px]">
                            <Search className="h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by plate number or driver name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                        <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Vehicle Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Types</SelectItem>
                                <SelectItem value="car">Car</SelectItem>
                                <SelectItem value="truck">Truck</SelectItem>
                                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                <SelectItem value="bus">Bus</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={engineTypeFilter} onValueChange={setEngineTypeFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Engine Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Engines</SelectItem>
                                <SelectItem value="diesel">Diesel</SelectItem>
                                <SelectItem value="gasoline">Gasoline</SelectItem>
                                <SelectItem value="electric">Electric</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 bg-gray-50">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Showing {filteredVehicles.length} vehicles
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-4">
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded"></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredVehicles.map((vehicle) => (
                                <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {vehicle.plate_number}
                                                </h3>
                                                <p className="text-sm text-gray-600">{vehicle.driver_name}</p>
                                            </div>
                                            {getStatusBadge(vehicle)}
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Type:</span>
                                                <span className="font-medium">{vehicle.vehicle_type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Engine:</span>
                                                <span className="font-medium">{vehicle.engine_type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Wheels:</span>
                                                <span className="font-medium">{vehicle.wheels}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Office:</span>
                                                <span className="font-medium text-xs">{vehicle.office?.name || "Unknown"}</span>
                                            </div>
                                            {vehicle.latest_test_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Last Test:</span>
                                                    <span className="font-medium text-xs">
                                                        {new Date(vehicle.latest_test_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredVehicles.length === 0 && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
                                <p className="text-gray-500">
                                    Try adjusting your search criteria or filters.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehiclesDetailPage;
