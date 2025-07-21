import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/presentation/components/shared/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/shared/ui/select";
import { MultiSelect, MultiSelectItem } from "@/presentation/components/shared/ui/multi-select";
import { Label } from "@/presentation/components/shared/ui/label";
import { Office } from "@/core/api/emission-service";

interface QuarterlyTestingFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    selectedYear: number | null;
    availableYears: number[];
    onYearChange: (year: string) => void;
    selectedOffices: string[];
    offices: Office[];
    onOfficeChange: (officeIds: string[]) => void;
}

export const QuarterlyTestingFilters: React.FC<QuarterlyTestingFiltersProps> = ({
    search,
    onSearchChange,
    selectedYear,
    availableYears,
    onYearChange,
    selectedOffices,
    offices,
    onOfficeChange,
}) => {
    // Convert offices to MultiSelect items
    const officeItems: MultiSelectItem[] = [
        { value: "all", label: "All Offices" },
        ...offices.map((office) => ({
            value: office.id,
            label: office.name,
        })),
    ];
    return (
        <div className="flex flex-col gap-4 mb-6">
            {/* Filters Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                {/* Search (left) */}
                <div className="relative flex items-center w-full md:w-auto justify-start bg-white rounded-md">
                    <Search className="absolute left-2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder="Search by plate, driver, or office..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-8 max-w-xs w-[320px] bg-white"
                    />
                </div>

                {/* Filters (right) */}
                <div className="flex items-end gap-4">
                    {/* Year Filter */}
                    <div className="space-y-1">
                        <Label htmlFor="year-select" className="text-sm font-medium">
                            Year <span className="text-red-500">*</span>
                        </Label>
                        <Select value={selectedYear?.toString() || ""} onValueChange={onYearChange}>
                            <SelectTrigger id="year-select" className="w-32 bg-white">
                                <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Office Filter */}
                    <div className="space-y-1">
                        <Label htmlFor="office-select" className="text-sm font-medium">
                            Offices
                        </Label>
                        <MultiSelect
                            items={officeItems}
                            selectedValues={selectedOffices}
                            onChange={onOfficeChange}
                            placeholder="Select offices..."
                            className="w-64 bg-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
