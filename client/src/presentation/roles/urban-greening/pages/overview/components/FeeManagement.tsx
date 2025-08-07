import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/presentation/components/shared/ui/table";

interface FeeManagementProps {
    totalFees: number;
    monthlyFees: Array<{ month: string; amount: number }>;
    latePayments: Array<{ year: number; amount: number }>;
    isLoading: boolean;
}

export const FeeManagement: React.FC<FeeManagementProps> = ({
    totalFees,
    monthlyFees,
    latePayments,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Card className="h-80">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Monthly 2025 Fees</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <div className="animate-pulse">
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="h-64">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Late Payment Clearance</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <div className="animate-pulse">
                            <div className="h-48 bg-gray-200 rounded"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="h-80">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Monthly 2025 Fees</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <div className="max-h-64 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">Month</TableHead>
                                    <TableHead className="text-xs">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monthlyFees.map((row) => (
                                    <TableRow key={row.month}>
                                        <TableCell className="text-xs py-1">{row.month}</TableCell>
                                        <TableCell className="text-xs py-1">
                                            ₱{row.amount.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="font-semibold border-t-2">
                                    <TableCell className="text-xs py-1">Total</TableCell>
                                    <TableCell className="text-xs py-1">
                                        ₱{monthlyFees.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card className="h-64">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Late Payment Clearance</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs">Year</TableHead>
                                <TableHead className="text-xs">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {latePayments.map((row) => (
                                <TableRow key={row.year}>
                                    <TableCell className="text-xs py-1">{row.year}</TableCell>
                                    <TableCell className="text-xs py-1">
                                        ₱{row.amount.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {latePayments.length > 0 && (
                                <TableRow className="font-semibold border-t-2">
                                    <TableCell className="text-xs py-1">Total</TableCell>
                                    <TableCell className="text-xs py-1">
                                        ₱{latePayments.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
