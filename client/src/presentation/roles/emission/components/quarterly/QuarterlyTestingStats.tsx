import React from "react";
import { EmissionTest } from "@/core/hooks/emission/useQuarterlyTesting";

interface QuarterlyTestingStatsProps {
    emissionTests: EmissionTest[];
    isVisible: boolean;
}

export const QuarterlyTestingStats: React.FC<QuarterlyTestingStatsProps> = ({
    emissionTests,
    isVisible,
}) => {
    if (!isVisible || emissionTests.length === 0) {
        return null;
    }

    const totalTests = emissionTests.length;
    const passedTests = emissionTests.filter((t) => t.result).length;
    const failedTests = emissionTests.filter((t) => !t.result).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-slate-50 dark:bg-slate-900">
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-3xl font-bold">{totalTests}</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-green-50 dark:bg-green-950">
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-3xl font-bold text-green-700">{passedTests}</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-red-50 dark:bg-red-950">
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-3xl font-bold text-red-700">{failedTests}</p>
            </div>
        </div>
    );
};
