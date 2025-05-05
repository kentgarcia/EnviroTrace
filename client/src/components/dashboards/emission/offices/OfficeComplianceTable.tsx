import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OfficeComplianceSkeleton } from "./OfficeComplianceSkeleton";
import { OfficeData } from "@/hooks/useOffices";

interface OfficeComplianceTableProps {
    officeData: OfficeData[];
    isLoading: boolean;
    errorMessage?: string;
}

export function OfficeComplianceTable({
    officeData,
    isLoading,
    errorMessage,
}: OfficeComplianceTableProps) {
    // Handle error state
    if (errorMessage) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error loading data</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
        );
    }

    // Handle empty state
    if (!isLoading && (!officeData || officeData.length === 0)) {
        return (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No data available</AlertTitle>
                <AlertDescription>
                    There are no office compliance records for the selected period.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[200px]">Office Name</TableHead>
                        <TableHead>Vehicles</TableHead>
                        <TableHead>Tested</TableHead>
                        <TableHead>Passed</TableHead>
                        <TableHead className="min-w-[200px]">Compliance</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <OfficeComplianceSkeleton rowCount={8} />
                    ) : (
                        officeData.map((office) => {
                            // Calculate compliance rate if not already provided
                            const complianceRate =
                                office.complianceRate !== undefined
                                    ? office.complianceRate
                                    : office.vehicleCount > 0
                                        ? Math.round((office.passedCount / office.vehicleCount) * 100)
                                        : 0;
                            const isCompliant = complianceRate >= 80;

                            return (
                                <TableRow key={office.id}>
                                    <TableCell className="font-medium">{office.name}</TableCell>
                                    <TableCell>{office.vehicleCount}</TableCell>
                                    <TableCell>{office.testedCount}</TableCell>
                                    <TableCell>{office.passedCount}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between">
                                                <span>{complianceRate}%</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {office.passedCount}/{office.vehicleCount}
                                                </span>
                                            </div>
                                            <Progress
                                                value={complianceRate}
                                                // TODO: Implement conditional indicator color via CSS or component modification
                                                // The indicator color defaults to 'bg-primary'.
                                                // The className below styles the track background.
                                                className={`h-2 ${isCompliant ? "bg-green-100" : "bg-red-100"
                                                    }`}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {isCompliant ? (
                                            <CheckCircle2 className="ml-auto h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircle className="ml-auto h-5 w-5 text-red-500" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            {/* Pagination controls could be added here */}
            <div className="flex items-center justify-end space-x-2 py-4 px-4">
                <Button variant="outline" size="sm" disabled>
                    Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                    Next
                </Button>
            </div>
        </div>
    );
}