import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { VehicleFilters } from '@/hooks/vehicles/useVehicleStore';

interface VehicleFiltersProps {
    filters: VehicleFilters;
    setFilter: <K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K]) => void;
    resetFilters: () => void;
    vehicleTypes: string[];
    engineTypes: string[];
    wheelCounts: string[];
    offices: string[];
}

export const VehicleFilterPanel: React.FC<VehicleFiltersProps> = ({
    filters,
    setFilter,
    resetFilters,
    vehicleTypes,
    engineTypes,
    wheelCounts,
    offices
}) => {
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter('searchQuery', e.target.value);
    };

    const handleReset = () => {
        resetFilters();
    };

    return (
        <div className="space-y-4 my-4">
            <div className="flex flex-col md:flex-row gap-3 items-start">
                <div className="w-full md:w-1/3 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search vehicles..."
                        value={filters.searchQuery}
                        onChange={handleSearch}
                        className="pl-8"
                    />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-2/3">
                    {/* Status Filter */}
                    <div className="w-full sm:w-auto">
                        <Select
                            value={filters.statusFilter}
                            onValueChange={(value) => setFilter('statusFilter', value as VehicleFilters['statusFilter'])}
                        >
                            <SelectTrigger className="h-10 w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="passed">Passed</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="untested">Not Tested</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Office Filter */}
                    <div className="w-full sm:w-auto">
                        <Select
                            value={filters.officeFilter}
                            onValueChange={(value) => setFilter('officeFilter', value)}
                        >
                            <SelectTrigger className="h-10 w-[180px]">
                                <SelectValue placeholder="Office" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all_offices">All Offices</SelectItem>
                                    {offices.map(office => (
                                        <SelectItem key={office} value={office}>{office}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Vehicle Type Filter */}
                    <div className="w-full sm:w-auto">
                        <Select
                            value={filters.vehicleTypeFilter}
                            onValueChange={(value) => setFilter('vehicleTypeFilter', value)}
                        >
                            <SelectTrigger className="h-10 w-[180px]">
                                <SelectValue placeholder="Vehicle Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all_types">All Types</SelectItem>
                                    {vehicleTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Engine Type Filter */}
                    <div className="w-full sm:w-auto">
                        <Select
                            value={filters.engineTypeFilter}
                            onValueChange={(value) => setFilter('engineTypeFilter', value)}
                        >
                            <SelectTrigger className="h-10 w-[180px]">
                                <SelectValue placeholder="Engine Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all_engines">All Engines</SelectItem>
                                    {engineTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Wheels Filter */}
                    <div className="w-full sm:w-auto">
                        <Select
                            value={filters.wheelsFilter}
                            onValueChange={(value) => setFilter('wheelsFilter', value)}
                        >
                            <SelectTrigger className="h-10 w-[180px]">
                                <SelectValue placeholder="Wheels" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all_wheels">All Wheels</SelectItem>
                                    {wheelCounts.map(count => (
                                        <SelectItem key={count} value={count}>{count} Wheels</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Filter actions */}
            <div className="flex justify-end">
                <button
                    onClick={handleReset}
                    className="text-sm text-primary hover:underline"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
};