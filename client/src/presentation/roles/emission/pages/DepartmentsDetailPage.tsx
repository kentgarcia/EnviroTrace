import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Building2, Search, Users } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { useOffices } from "@/core/api/emission-service";

const DepartmentsDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");

    // Get filters from URL params
    const quarter = searchParams.get("quarter");
    const year = searchParams.get("year");

    const { data: officesData, isLoading, error } = useOffices(searchTerm);

    const offices = officesData?.offices || [];

    if (error) {
        return (
            <div className="p-6">
                <div className="text-red-600">Error loading departments data</div>
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
                            <Building2 className="h-5 w-5 text-purple-600" />
                            <h1 className="text-2xl font-semibold text-gray-900">
                                All Departments
                                {quarter && year && (
                                    <span className="text-lg text-gray-600 ml-2">
                                        ({year} Q{quarter})
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">{offices.length}</div>
                            <div className="text-sm text-gray-600">Total Departments/Offices</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-2 max-w-md">
                        <Search className="h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 bg-gray-50">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Showing {offices.length} departments
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
                            {offices.map((office) => (
                                <Card key={office.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3 mb-3">
                                            <Building2 className="h-8 w-8 text-purple-600 mt-1" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {office.name}
                                                </h3>
                                                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                                    Department
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            {office.address && (
                                                <div>
                                                    <span className="text-gray-500 block">Address:</span>
                                                    <span className="font-medium">{office.address}</span>
                                                </div>
                                            )}
                                            {office.contact_number && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Contact:</span>
                                                    <span className="font-medium">{office.contact_number}</span>
                                                </div>
                                            )}
                                            {office.email && (
                                                <div>
                                                    <span className="text-gray-500 block">Email:</span>
                                                    <span className="font-medium text-xs break-all">{office.email}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Created:</span>
                                                <span className="font-medium text-xs">
                                                    {new Date(office.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isLoading && offices.length === 0 && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
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

export default DepartmentsDetailPage;
