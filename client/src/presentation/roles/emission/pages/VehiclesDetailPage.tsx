import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Car, Search, Filter, X } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { useVehicles } from "@/core/api/emission-service";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/presentation/components/shared/ui/dropdown-menu";

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

    // Get unique vehicle types and engine types for filters
    const vehicleTypes = Array.from(new Set(vehicles.map(v => v.vehicle_type).filter(Boolean)));
    const engineTypes = Array.from(new Set(vehicles.map(v => v.engine_type).filter(Boolean)));

    const filteredVehicles = vehicles;

    const resetFilters = () => {
        setSearchTerm("");
        setVehicleTypeFilter("");
        setEngineTypeFilter("");
    };

    const hasFilters = searchTerm || vehicleTypeFilter || engineTypeFilter;

    const getStatusBadge = (vehicle: any) => {
        if (vehicle.latest_test_result === null) {
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Untested</Badge>;
        }
        return vehicle.latest_test_result ?
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Passed</Badge> :
            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
    };

    if (error) {
        return (
            <div className="flex min-h-screen w-full">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopNavBarContainer dashboardType="government-emission" />
                    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8">
                        <Card className="border border-red-200 bg-red-50">
                            <CardContent className="p-6">
                                <div className="text-red-600 font-medium">Error loading vehicles data</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="government-emission" />

                {/* Header Section */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 hover:bg-slate-100 rounded-lg"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                                <div className="h-6 w-px bg-gray-300"></div>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                                        All Vehicles
                                    </h1>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {quarter && year ? `Showing vehicles for ${year} Q${quarter}` : 'Complete vehicle fleet overview'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm text-slate-600 font-medium">
                                {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body Section */}
                <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                    <div className="p-8">
                        {/* Filters */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                            {/* Search (left) */}
                            <div className="relative flex items-center w-full lg:w-96">
                                <Input
                                    placeholder="Search by plate, driver, or office..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg h-10 text-sm transition-all"
                                />
                                <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Filters (right) */}
                            <div className="flex flex-wrap gap-2 items-center lg:justify-end">
                                {hasFilters && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={resetFilters}
                                        className="text-slate-500 hover:text-slate-900 text-xs font-medium h-8 px-2"
                                    >
                                        Clear all
                                    </Button>
                                )}

                                {/* Vehicle Type Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-10 px-4 justify-between bg-white border-slate-200 shadow-none rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors min-w-[140px]"
                                        >
                                            <span className="truncate">{vehicleTypeFilter || "All Types"}</span>
                                            <Filter className="ml-2 h-3.5 w-3.5 text-slate-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 p-1">
                                        <DropdownMenuItem onClick={() => setVehicleTypeFilter("")} className="rounded-md cursor-pointer">
                                            All Types
                                        </DropdownMenuItem>
                                        {vehicleTypes.map((type) => (
                                            <DropdownMenuItem key={type} onClick={() => setVehicleTypeFilter(type)} className="rounded-md cursor-pointer">
                                                {type}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Engine Type Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-10 px-4 justify-between bg-white border-slate-200 shadow-none rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors min-w-[140px]"
                                        >
                                            <span className="truncate">{engineTypeFilter || "All Engines"}</span>
                                            <Filter className="ml-2 h-3.5 w-3.5 text-slate-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 p-1">
                                        <DropdownMenuItem onClick={() => setEngineTypeFilter("")} className="rounded-md cursor-pointer">
                                            All Engines
                                        </DropdownMenuItem>
                                        {engineTypes.map((type) => (
                                            <DropdownMenuItem key={type} onClick={() => setEngineTypeFilter(type)} className="rounded-md cursor-pointer">
                                                {type}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Vehicle Grid */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <Card key={i} className="animate-pulse border-slate-200 shadow-none rounded-xl">
                                        <CardContent className="p-6">
                                            <div className="h-4 bg-slate-200 rounded mb-3"></div>
                                            <div className="h-3 bg-slate-200 rounded mb-2 w-3/4"></div>
                                            <div className="h-3 bg-slate-200 rounded mb-2 w-1/2"></div>
                                            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : filteredVehicles.length === 0 ? (
                            <Card className="border border-slate-200 shadow-none rounded-xl">
                                <CardContent className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                                        <Car className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No vehicles found</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto">
                                        Try adjusting your search criteria or filters to find vehicles.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredVehicles.map((vehicle) => (
                                    <Card key={vehicle.id} className="border border-slate-200 shadow-none rounded-xl hover:border-slate-300 transition-all hover:shadow-md bg-white">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-slate-900 text-lg truncate mb-1">
                                                        {vehicle.plate_number || vehicle.chassis_number || vehicle.registration_number || "N/A"}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 truncate">{vehicle.driver_name}</p>
                                                </div>
                                                <div className="ml-2 flex-shrink-0">
                                                    {getStatusBadge(vehicle)}
                                                </div>
                                            </div>

                                            <div className="space-y-2.5 text-sm">
                                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                                                    <span className="text-slate-500 font-medium">Type</span>
                                                    <span className="font-semibold text-slate-900">{vehicle.vehicle_type}</span>
                                                </div>
                                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                                                    <span className="text-slate-500 font-medium">Engine</span>
                                                    <span className="font-semibold text-slate-900">{vehicle.engine_type}</span>
                                                </div>
                                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                                                    <span className="text-slate-500 font-medium">Wheels</span>
                                                    <span className="font-semibold text-slate-900">{vehicle.wheels}</span>
                                                </div>
                                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                                                    <span className="text-slate-500 font-medium">Office</span>
                                                    <span className="font-semibold text-slate-900 text-xs truncate max-w-[140px]" title={vehicle.office?.name}>
                                                        {vehicle.office?.name || "Unknown"}
                                                    </span>
                                                </div>
                                                {vehicle.latest_test_date && (
                                                    <div className="flex items-center justify-between py-1.5">
                                                        <span className="text-slate-500 font-medium">Last Test</span>
                                                        <span className="font-semibold text-slate-900 text-xs">
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehiclesDetailPage;
