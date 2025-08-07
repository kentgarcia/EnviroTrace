import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/presentation/components/shared/ui/table";

interface PlantingSummaryProps {
    plantingStats: any;
    saplingStats: any;
    isLoading: boolean;
}

export const PlantingSummary: React.FC<PlantingSummaryProps> = ({
    plantingStats,
    saplingStats,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Urban Greening Planted</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <div className="animate-pulse">
                            <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Plant Saplings Collected</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <div className="animate-pulse">
                            <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const urbanGreeningData = [
        {
            type: "Ornamental Plants",
            count: plantingStats?.total_ornamental_plants || 0,
        },
        {
            type: "Trees",
            count: plantingStats?.total_trees || 0,
        },
        {
            type: "Seeds",
            count: plantingStats?.total_seeds || 0,
        },
        {
            type: "Seeds (Private)",
            count: plantingStats?.total_seeds_private || 0,
        },
    ];

    const saplingData = saplingStats?.species_breakdown?.slice(0, 5) || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Urban Greening Planted Table */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                        URBAN GREENING (NUMBER OF ORNAMENTAL PLANT AND TREES PLANTED)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs">Type</TableHead>
                                <TableHead className="text-xs">Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {urbanGreeningData.map((row) => (
                                <TableRow key={row.type}>
                                    <TableCell className="text-xs py-1">{row.type}</TableCell>
                                    <TableCell className="text-xs py-1">{row.count}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="font-semibold">
                                <TableCell className="text-xs py-1">Total</TableCell>
                                <TableCell className="text-xs py-1">
                                    {urbanGreeningData.reduce((sum, item) => sum + item.count, 0)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Plant Saplings Collected Table */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                        Plant Saplings Collected (Replacements)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs">Species</TableHead>
                                <TableHead className="text-xs">Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {saplingData.map((row: any) => (
                                <TableRow key={row.species_name}>
                                    <TableCell className="text-xs py-1">
                                        {row.species_name}
                                    </TableCell>
                                    <TableCell className="text-xs py-1">
                                        {row.total_quantity}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {saplingData.length === 0 && (
                                <TableRow>
                                    <TableCell className="text-xs py-1 text-gray-500" colSpan={2}>
                                        No data available
                                    </TableCell>
                                </TableRow>
                            )}
                            {saplingData.length > 0 && (
                                <TableRow className="font-semibold">
                                    <TableCell className="text-xs py-1">Total</TableCell>
                                    <TableCell className="text-xs py-1">
                                        {saplingData.reduce((sum: number, item: any) => sum + item.total_quantity, 0)}
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
