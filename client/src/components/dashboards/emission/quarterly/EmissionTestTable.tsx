import React from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash, Loader2, CheckCircle, XCircle } from "lucide-react";
import { EmissionTest } from "@/hooks/useQuarterlyTesting";

interface EmissionTestTableProps {
    tests: EmissionTest[];
    isLoading: boolean;
    onEditTest: (test: EmissionTest) => void;
    onDeleteTest: (test: EmissionTest) => void;
}

export const EmissionTestTable: React.FC<EmissionTestTableProps> = ({
    tests,
    isLoading,
    onEditTest,
    onDeleteTest,
}) => {
    // Helper to detect if a test is pending sync
    const isPendingSync = (id: string) => {
        return id.startsWith("pending-");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading test results...</span>
            </div>
        );
    }

    if (tests.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No vehicle test results found. Add a test to get started.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Plate Number</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Office</TableHead>
                        <TableHead>Test Date</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead className="w-16 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tests.map((test) => (
                        <TableRow key={test.id}>
                            <TableCell>{test.vehicle?.plateNumber || "Unknown"}</TableCell>
                            <TableCell>{test.vehicle?.driverName || "Unknown"}</TableCell>
                            <TableCell>{test.vehicle?.officeName || "Unknown"}</TableCell>
                            <TableCell>{format(new Date(test.testDate), "MMM dd, yyyy")}</TableCell>
                            <TableCell>
                                {test.result ? (
                                    <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                                        <span className="text-green-600">Passed</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <XCircle className="h-4 w-4 text-red-600 mr-1" />
                                        <span className="text-red-600">Failed</span>
                                    </div>
                                )}
                                {isPendingSync(test.id) && (
                                    <Badge variant="outline" className="ml-2 text-yellow-600 bg-yellow-50">
                                        Pending Sync
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEditTest(test)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDeleteTest(test)}
                                            className="text-red-600"
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default EmissionTestTable;