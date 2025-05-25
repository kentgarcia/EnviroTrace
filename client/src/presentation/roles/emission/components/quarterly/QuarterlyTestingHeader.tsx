import React from "react";
import { Plus, FileDown } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";

interface QuarterlyTestingHeaderProps {
    onNewSchedule: () => void;
    onExportResults: () => void;
    canExport: boolean;
}

export const QuarterlyTestingHeader: React.FC<QuarterlyTestingHeaderProps> = ({
    onNewSchedule,
    onExportResults,
    canExport,
}) => {
    return (
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
                Quarterly Testing
            </h1>
            <div className="flex gap-2">
                <Button
                    onClick={onNewSchedule}
                    className="hidden md:inline-flex"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Schedule
                </Button>
                <Button
                    onClick={onExportResults}
                    variant="outline"
                    size="icon"
                    disabled={!canExport}
                >
                    <FileDown className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};
