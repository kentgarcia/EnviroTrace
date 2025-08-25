import React from 'react';
import SaplingRecommendationEngine from '../components/SaplingRecommendationEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/shared/ui/card';
import { TreePine } from 'lucide-react';

// Demo data to show how the recommendation system works
const demoTreeCuttingRequests = [
    {
        id: "1",
        request_number: "TC-2025-001",
        request_type: "cutting" as const,
        requester_name: "Manila Parks Department",
        property_address: "Rizal Park, Manila",
        status: "filed" as const,
        request_date: "2024-12-15",
        trees_and_quantities: ["3 Mahogany trees", "1 large Narra tree"],
        notes: "Mature trees removed due to infrastructure development",
        created_at: "2024-12-15T08:00:00Z"
    },
    {
        id: "2",
        request_number: "TC-2025-002",
        request_type: "cutting" as const,
        requester_name: "Quezon City ENRO",
        property_address: "Quezon Memorial Circle, QC",
        status: "filed" as const,
        request_date: "2024-11-20",
        trees_and_quantities: ["2 Acacia trees"],
        notes: "Emergency removal - diseased trees posing safety hazard",
        created_at: "2024-11-20T10:30:00Z"
    },
    {
        id: "3",
        request_number: "TC-2025-003",
        request_type: "cutting" as const,
        requester_name: "BGC Development Corp",
        property_address: "Bonifacio Global City, Taguig",
        status: "filed" as const,
        request_date: "2024-10-10",
        trees_and_quantities: ["5 Bamboo clusters"],
        notes: "Large bamboo grove removal for commercial development",
        created_at: "2024-10-10T14:15:00Z"
    }
];

const demoPlantingRecords = [
    {
        id: "p1",
        record_number: "UG-2024-001",
        planting_type: "trees" as const,
        species_name: "Mahogany",
        quantity_planted: 15,
        planting_date: "2024-06-15",
        location: "Rizal Park area",
        barangay: "Ermita",
        status: "growing" as const,
        survival_rate: 85,
        responsible_person: "John Dela Cruz",
        created_at: "2024-06-15T09:00:00Z",
        updated_at: "2024-06-15T09:00:00Z"
    },
    {
        id: "p2",
        record_number: "UG-2024-002",
        planting_type: "trees" as const,
        species_name: "Narra",
        quantity_planted: 8,
        planting_date: "2024-07-20",
        location: "Rizal Park vicinity",
        barangay: "Ermita",
        status: "mature" as const,
        survival_rate: 92,
        responsible_person: "Maria Santos",
        created_at: "2024-07-20T10:00:00Z",
        updated_at: "2024-07-20T10:00:00Z"
    },
    {
        id: "p3",
        record_number: "UG-2024-003",
        planting_type: "trees" as const,
        species_name: "Bamboo",
        quantity_planted: 25,
        planting_date: "2024-08-10",
        location: "Various parks in Taguig",
        barangay: "Fort Bonifacio",
        status: "growing" as const,
        survival_rate: 78,
        responsible_person: "Carlos Rodriguez",
        created_at: "2024-08-10T11:00:00Z",
        updated_at: "2024-08-10T11:00:00Z"
    },
    {
        id: "p4",
        record_number: "UG-2024-004",
        planting_type: "trees" as const,
        species_name: "Acacia",
        quantity_planted: 12,
        planting_date: "2024-05-25",
        location: "Quezon Memorial area",
        barangay: "South Triangle",
        status: "growing" as const,
        survival_rate: 88,
        responsible_person: "Ana Reyes",
        created_at: "2024-05-25T08:30:00Z",
        updated_at: "2024-05-25T08:30:00Z"
    },
    {
        id: "p5",
        record_number: "UG-2024-005",
        planting_type: "trees" as const,
        species_name: "Mahogany",
        quantity_planted: 20,
        planting_date: "2024-09-05",
        location: "Quezon City parks",
        barangay: "Diliman",
        status: "mature" as const,
        survival_rate: 95,
        responsible_person: "Roberto Kim",
        created_at: "2024-09-05T07:45:00Z",
        updated_at: "2024-09-05T07:45:00Z"
    },
    {
        id: "p6",
        record_number: "UG-2024-006",
        planting_type: "ornamental_plants" as const,
        species_name: "Bougainvillea",
        quantity_planted: 50,
        planting_date: "2024-04-12",
        location: "BGC parks and walkways",
        barangay: "Fort Bonifacio",
        status: "died" as const,
        survival_rate: 45,
        responsible_person: "Lisa Chen",
        created_at: "2024-04-12T13:20:00Z",
        updated_at: "2024-04-12T13:20:00Z"
    }
];

const SaplingRecommendationDemo: React.FC = () => {
    const handleRecommendationSelection = (analysis: any, recommendation: any) => {
        alert(`You selected ${recommendation.species} (${recommendation.recommendedQuantity} saplings) for cutting request ${analysis.treeCuttingRequest.request_number}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TreePine className="h-6 w-6 text-green-600" />
                            Sapling Replacement Recommendation System Demo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• <strong>Analyzes tree cutting requests</strong> - Automatically calculates replacement ratios</li>
                                    <li>• <strong>Species recommendations</strong> - Based on historical success rates in your area</li>
                                    <li>• <strong>Location-based insights</strong> - Suggests species that thrive in similar locations</li>
                                    <li>• <strong>Cost estimation</strong> - Provides budget planning information</li>
                                    <li>• <strong>Success prediction</strong> - Shows survival rates for different species</li>
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h4 className="font-medium text-yellow-900 mb-2">Demo Data Includes:</h4>
                                    <div className="text-sm text-yellow-800 space-y-1">
                                        <div>• {demoTreeCuttingRequests.length} tree cutting requests</div>
                                        <div>• {demoPlantingRecords.length} historical planting records</div>
                                        <div>• Species: Mahogany, Narra, Bamboo, Acacia</div>
                                        <div>• Multiple locations in Metro Manila</div>
                                    </div>
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="font-medium text-green-900 mb-2">Key Features:</h4>
                                    <div className="text-sm text-green-800 space-y-1">
                                        <div>• Frontend-only implementation</div>
                                        <div>• Real-time analysis of existing data</div>
                                        <div>• Interactive species selection</div>
                                        <div>• Urgency and compliance tracking</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <SaplingRecommendationEngine
                    treeCuttingRequests={demoTreeCuttingRequests}
                    plantingRecords={demoPlantingRecords}
                    onSelectRecommendation={handleRecommendationSelection}
                />
            </div>
        </div>
    );
};

export default SaplingRecommendationDemo;
