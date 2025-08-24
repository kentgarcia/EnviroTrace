import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/shared/ui/card';
import { Button } from '@/presentation/components/shared/ui/button';
import { Badge } from '@/presentation/components/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/shared/ui/tabs';
import {
    Leaf, Trees, MapPin, Calendar, User, FileText,
    ExternalLink, AlertCircle
} from 'lucide-react';
import { MonitoringRequest } from '../logic/useMonitoringRequests';
import { fetchUrbanGreeningPlantings, UrbanGreeningPlanting } from '@/core/api/planting-api';
import { fetchTreeManagementRequests, TreeManagementRequest } from '@/core/api/tree-management-api';

interface RelatedDataViewProps {
    selectedRequest: MonitoringRequest;
    onNavigateToRecord: (type: 'planting' | 'tree_management', id: string) => void;
    onUpdateMonitoringStatus: (status: string) => void;
}

const RelatedDataView: React.FC<RelatedDataViewProps> = ({
    selectedRequest,
    onNavigateToRecord,
    onUpdateMonitoringStatus
}) => {
    const [relatedPlantings, setRelatedPlantings] = useState<UrbanGreeningPlanting[]>([]);
    const [relatedTreeManagement, setRelatedTreeManagement] = useState<TreeManagementRequest[]>([]);
    const [loading, setLoading] = useState(false);

    // Load related data when monitoring request changes
    useEffect(() => {
        if (!selectedRequest?.id) return;

        const loadRelatedData = async () => {
            setLoading(true);
            try {
                // Load plantings with this monitoring request ID
                const plantings = await fetchUrbanGreeningPlantings({
                    limit: 100
                });
                setRelatedPlantings(
                    plantings.filter(p => p.monitoring_request_id === selectedRequest.id)
                );

                // Load tree management requests with this monitoring request ID
                const treeRequests = await fetchTreeManagementRequests();
                setRelatedTreeManagement(
                    treeRequests.filter(t => t.monitoring_request_id === selectedRequest.id)
                );
            } catch (error) {
                console.error('Error loading related data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadRelatedData();
    }, [selectedRequest?.id]);

    const totalPlantedQuantity = relatedPlantings.reduce((sum, p) => sum + (p.quantity_planted || 0), 0);
    const totalTreeActions = relatedTreeManagement.length;

    // Calculate impact metrics
    const plantingImpact = {
        species: [...new Set(relatedPlantings.map(p => p.species_name))].length,
        totalQuantity: totalPlantedQuantity,
        locations: [...new Set(relatedPlantings.map(p => p.location))].length,
        projects: [...new Set(relatedPlantings.map(p => p.project_name).filter(Boolean))].length
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'living': case 'planted': case 'growing': case 'completed':
                return 'bg-green-100 text-green-800';
            case 'dead': case 'died': case 'removed':
                return 'bg-red-100 text-red-800';
            case 'mature': case 'ready_for_planting':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-gray-500">Loading related data...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Impact Summary - Stat Cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Plants/Trees</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {plantingImpact.totalQuantity}
                                </p>
                            </div>
                            <div className="ml-4">
                                <Leaf className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Species</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {plantingImpact.species}
                                </p>
                            </div>
                            <div className="ml-4">
                                <Trees className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Locations</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {plantingImpact.locations}
                                </p>
                            </div>
                            <div className="ml-4">
                                <MapPin className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Tree Actions</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {totalTreeActions}
                                </p>
                            </div>
                            <div className="ml-4">
                                <AlertCircle className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateMonitoringStatus('living')}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                            Mark as Living
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateMonitoringStatus('dead')}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                            Mark as Dead
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateMonitoringStatus('replaced')}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                            Mark as Replaced
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Related Records */}
            <Card>
                <CardHeader>
                    <CardTitle>Related Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="plantings" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="plantings" className="flex items-center">
                                <Leaf className="h-4 w-4 mr-2" />
                                Plantings ({relatedPlantings.length})
                            </TabsTrigger>
                            <TabsTrigger value="tree-management" className="flex items-center">
                                <Trees className="h-4 w-4 mr-2" />
                                Tree Management ({relatedTreeManagement.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="plantings" className="space-y-4">
                            {relatedPlantings.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Leaf className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No planting records linked to this monitoring request.</p>
                                </div>
                            ) : (
                                relatedPlantings.map((planting) => (
                                    <div key={planting.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium">{planting.species_name}</h4>
                                                    <Badge className={getStatusBadgeColor(planting.status)}>
                                                        {planting.status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 mr-1" />
                                                        {planting.responsible_person}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {new Date(planting.planting_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MapPin className="h-4 w-4 mr-1" />
                                                        {planting.location}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Leaf className="h-4 w-4 mr-1" />
                                                        {planting.quantity_planted} planted
                                                    </div>
                                                </div>

                                                {planting.notes && (
                                                    <div className="mt-2">
                                                        <div className="flex items-start">
                                                            <FileText className="h-4 w-4 mr-1 mt-0.5 text-gray-400" />
                                                            <p className="text-sm text-gray-600">{planting.notes}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onNavigateToRecord('planting', planting.id)}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="tree-management" className="space-y-4">
                            {relatedTreeManagement.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Trees className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No tree management records linked to this monitoring request.</p>
                                </div>
                            ) : (
                                relatedTreeManagement.map((treeRequest) => (
                                    <div key={treeRequest.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium">{treeRequest.request_number}</h4>
                                                    <Badge variant="outline">{treeRequest.request_type}</Badge>
                                                    <Badge className={getStatusBadgeColor(treeRequest.status)}>
                                                        {treeRequest.status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 mr-1" />
                                                        {treeRequest.requester_name}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {new Date(treeRequest.request_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center col-span-2">
                                                        <MapPin className="h-4 w-4 mr-1" />
                                                        {treeRequest.property_address}
                                                    </div>
                                                </div>

                                                {treeRequest.notes && (
                                                    <div className="mt-2">
                                                        <div className="flex items-start">
                                                            <FileText className="h-4 w-4 mr-1 mt-0.5 text-gray-400" />
                                                            <p className="text-sm text-gray-600">{treeRequest.notes}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onNavigateToRecord('tree_management', treeRequest.id)}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Action Recommendations */}
            {(relatedPlantings.length > 0 || relatedTreeManagement.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                            Recommended Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {selectedRequest.status?.toLowerCase() === 'untracked' && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Inspection Required:</strong> This location has not been tracked recently.
                                        Consider scheduling a field inspection to assess current status.
                                    </p>
                                </div>
                            )}

                            {selectedRequest.status?.toLowerCase() === 'dead' && relatedPlantings.length > 0 && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800">
                                        <strong>Replacement Needed:</strong> Dead plants detected at this location.
                                        Consider scheduling replacement plantings to maintain green coverage.
                                    </p>
                                </div>
                            )}

                            {selectedRequest.status?.toLowerCase() === 'living' && relatedPlantings.length > 0 && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        <strong>Maintenance Due:</strong> Living plants require regular maintenance.
                                        Schedule watering, pruning, and fertilization as needed.
                                    </p>
                                </div>
                            )}

                            {relatedPlantings.length > 5 && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>High-Impact Location:</strong> This area has significant planting activity.
                                        Consider establishing it as a monitoring priority zone.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RelatedDataView;
