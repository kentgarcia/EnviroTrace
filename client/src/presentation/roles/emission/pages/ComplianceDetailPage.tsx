import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BarChart3, Search, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { useOfficeCompliance } from "@/core/api/emission-service";
import { EChartsBarChart } from "@/presentation/components/shared/dashboard/EChartsBarChart";

const ComplianceDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");

    // Get filters from URL params
    const quarter = searchParams.get("quarter");
    const year = searchParams.get("year");

    const { data: complianceData, isLoading, error } = useOfficeCompliance({
        year: year ? parseInt(year) : undefined,
        quarter: quarter ? parseInt(quarter) : undefined,
    });

    const offices = complianceData?.offices || [];
    const summary = complianceData?.summary;

    // Filter offices based on search
    const filteredOffices = offices.filter(office =>
        office.office_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort offices by compliance rate
    const sortedOffices = [...filteredOffices].sort((a, b) => b.compliance_rate - a.compliance_rate);

    const getComplianceBadge = (rate: number) => {
        if (rate >= 80) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
        } else if (rate >= 60) {
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Good</Badge>;
        } else if (rate >= 40) {
            return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Fair</Badge>;
        } else {
            return <Badge variant="destructive" className="bg-red-100 text-red-800">Poor</Badge>;
        }
    };

    // Prepare chart data
    const chartData = sortedOffices.map(office => ({
        id: office.office_name,
        label: office.office_name,
        value: Math.round(office.compliance_rate),
    }));

    if (error) {
        return (
            <div className="p-6">
                <div className="text-red-600">Error loading compliance data</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-yellow-600" />
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Compliance Overview
                                {quarter && year && (
                                    <span className="text-lg text-gray-600 ml-2">
                                        ({year} Q{quarter})
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                {summary && (
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl font-bold text-gray-900">{summary.total_offices}</div>
                                    <div className="text-sm text-gray-600">Total Offices</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl font-bold text-gray-900">{summary.total_vehicles}</div>
                                    <div className="text-sm text-gray-600">Total Vehicles</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{summary.total_compliant}</div>
                                    <div className="text-sm text-gray-600">Compliant Vehicles</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {Math.round(summary.overall_compliance_rate)}%
                                    </div>
                                    <div className="text-sm text-gray-600">Overall Compliance</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                <div className="flex-1 p-6 bg-gray-50">
                    {/* Chart Section */}
                    <div className="mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Compliance Rate by Office</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="h-96 flex items-center justify-center">
                                        <div className="text-gray-500">Loading chart...</div>
                                    </div>
                                ) : (
                                    <EChartsBarChart
                                        title=""
                                        data={chartData}
                                        height={400}
                                        layout="horizontal"
                                        color={["#eab308", "#22c55e", "#f97316", "#ef4444"]}
                                        valueFormatter={(value: number) => `${value}%`}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                        <div className="flex items-center gap-2 max-w-md">
                            <Search className="h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search offices..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Showing {filteredOffices.length} offices
                        </p>
                    </div>

                    {/* Office List */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-4">
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded"></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortedOffices.map((office, index) => (
                                <Card key={office.office_name} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                {index === 0 && <TrendingUp className="h-4 w-4 text-green-500" />}
                                                {index === sortedOffices.length - 1 && sortedOffices.length > 1 && (
                                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                                )}
                                                <h3 className="font-semibold text-gray-900 text-sm">
                                                    {office.office_name}
                                                </h3>
                                            </div>
                                            {getComplianceBadge(office.compliance_rate)}
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Compliance Rate:</span>
                                                <span className="font-bold text-lg">
                                                    {Math.round(office.compliance_rate)}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Total Vehicles:</span>
                                                <span className="font-medium">{office.total_vehicles}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Tested:</span>
                                                <span className="font-medium">{office.tested_vehicles}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Compliant:</span>
                                                <span className="font-medium text-green-600">{office.compliant_vehicles}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Non-Compliant:</span>
                                                <span className="font-medium text-red-600">{office.non_compliant_vehicles}</span>
                                            </div>
                                            {office.last_test_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Last Test:</span>
                                                    <span className="font-medium text-xs">
                                                        {new Date(office.last_test_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredOffices.length === 0 && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No offices found</h3>
                                <p className="text-gray-500">
                                    Try adjusting your search criteria.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
    );
};

export default ComplianceDetailPage;
