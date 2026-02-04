import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Search, Calendar } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { useEmissionTests } from "@/core/hooks/emission/useQuarterlyTesting";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/shared/ui/select";

const TestedVehiclesDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [resultFilter, setResultFilter] = useState<string>("");

    // Get filters from URL params
    const quarter = searchParams.get("quarter");
    const year = searchParams.get("year");

    // Use the quarterly testing hook to get test data
    const { data: tests, isLoading, error } = useEmissionTests({
        vehicleId: undefined
    });

    // Filter tests based on search and result filter
    const filteredTests = (tests || []).filter(test => {
        const vehicleId = test.vehicle?.plate_number || test.vehicle?.chassis_number || test.vehicle?.registration_number || "";
        const matchesSearch = !searchTerm ||
            vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.vehicle?.driver_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesResult = !resultFilter ||
            (resultFilter === "passed" && test.result === true) ||
            (resultFilter === "failed" && test.result === false);

        return matchesSearch && matchesResult;
    });

    const getStatusBadge = (result: boolean | null) => {
        if (result === null) {
            return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Pending</Badge>;
        }
        return result ?
            <Badge variant="default" className="bg-green-100 text-green-800">Passed</Badge> :
            <Badge variant="destructive" className="bg-red-100 text-red-800">Failed</Badge>;
    };

    const passedCount = filteredTests.filter(test => test.result === true).length;
    const failedCount = filteredTests.filter(test => test.result === false).length;

    if (error) {
        return (
            <div className="p-6">
                <div className="text-red-600">Error loading test data</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="page-header-bg px-6 py-4">
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
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Tested Vehicles
                                {quarter && year && (
                                    <span className="text-lg text-gray-600 ml-2">
                                        ({year} Q{quarter})
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900">{filteredTests.length}</div>
                                <div className="text-sm text-gray-600">Total Tests</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{passedCount}</div>
                                <div className="text-sm text-gray-600">Passed</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                                <div className="text-sm text-gray-600">Failed</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 min-w-[300px]">
                            <Search className="h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by plate number or driver name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                        <Select value={resultFilter} onValueChange={setResultFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Test Result" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Results</SelectItem>
                                <SelectItem value="passed">Passed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 bg-gray-50">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Showing {filteredTests.length} test results
                        </p>
                    </div>

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
                            {filteredTests.map((test) => (
                                <Card key={test.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {test.vehicle?.plate_number || test.vehicle?.chassis_number || test.vehicle?.registration_number || "Unknown Vehicle"}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {test.vehicle?.driver_name || "Unknown Driver"}
                                                </p>
                                            </div>
                                            {getStatusBadge(test.result)}
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Test Date:</span>
                                                <span className="font-medium">
                                                    {new Date(test.test_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Quarter:</span>
                                                <span className="font-medium">Q{test.quarter} {test.year}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Office:</span>
                                                <span className="font-medium text-xs">
                                                    {test.vehicle?.office_name || "Unknown Office"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Created By:</span>
                                                <span className="font-medium text-xs">{test.created_by}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredTests.length === 0 && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No test results found</h3>
                                <p className="text-gray-500">
                                    Try adjusting your search criteria or filters.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
    );
};

export default TestedVehiclesDetailPage;
