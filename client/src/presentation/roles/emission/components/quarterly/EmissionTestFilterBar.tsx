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

interface EmissionTestFilterBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    result: string;
    onResultChange: (value: string) => void;
}

export const EmissionTestFilterBar: React.FC<EmissionTestFilterBarProps> = ({
    search,
    onSearchChange,
    result,
    onResultChange,
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between mb-4">
            {/* Search */}
            <div className="relative flex items-center w-full md:w-auto justify-start bg-white rounded-md">
                <Input
                    placeholder="Search by plate, driver, or office..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8 max-w-xs w-[320px] bg-white"
                />
                <span className="absolute left-3 text-gray-400">
                    <Search className="h-4 w-4" />
                </span>
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center justify-end">                <Select value={result || "all"} onValueChange={onResultChange}>
                <SelectTrigger className="min-w-[120px] justify-between bg-white pr-8">
                    <SelectValue placeholder="All Results" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="untested">Not Tested</SelectItem>
                </SelectContent>
            </Select>
            </div>
        </div>
    );
};

export default EmissionTestFilterBar;
