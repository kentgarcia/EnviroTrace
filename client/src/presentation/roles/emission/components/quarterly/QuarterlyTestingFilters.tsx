import React from "react";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Button } from "@/presentation/components/shared/ui/button";

interface QuarterlyTestingFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    result: string;
    onResultChange: (value: string) => void;
}

export const QuarterlyTestingFilters: React.FC<QuarterlyTestingFiltersProps> = ({
    search,
    onSearchChange,
    result,
    onResultChange,
}) => {
    const handleResultToggle = () => {
        const nextResult = result === "" ? "passed" :
            result === "passed" ? "failed" :
                result === "failed" ? "untested" : "";
        onResultChange(nextResult);
    };

    const getResultLabel = () => {
        switch (result) {
            case "passed": return "Passed";
            case "failed": return "Failed";
            case "untested": return "Not Tested";
            default: return "All Results";
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Search (left) */}
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

            {/* Filters (right) */}
            <div className="flex flex-wrap gap-2 items-center justify-end">
                <Button
                    variant="outline"
                    className="min-w-[120px] justify-between bg-white pr-8"
                    onClick={handleResultToggle}
                >
                    {getResultLabel()}
                    <span className="ml-2 text-gray-400 flex items-center">
                        <RefreshCw className="h-4 w-4" />
                    </span>
                </Button>
            </div>
        </div>
    );
};
