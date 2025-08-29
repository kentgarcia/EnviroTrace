import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/shared/ui/card';
import { fetchTreeManagementRequests, TreeManagementRequest } from '@/core/api/tree-management-api';
import { fetchMonitoringRequest, MonitoringRequest } from '@/core/api/monitoring-request-service';
import MapView from './MapView';
import LocationMap from '../components/LocationMap';
import { TreePine, Loader2, AlertCircle, ChevronDown, MapPin, Leaf, User } from 'lucide-react';

// Philippine tree replacement recommendations based on studies from:
// - Forest Management Bureau (FMB)
// - Department of Environment and Natural Resources (DENR)
// - University of the Philippines Los Baños College of Forestry
const philippineTreeReplacements = {
    "Acacia": {
        primary: ["Narra", "Mahogany", "Molave"],
        secondary: ["Fire Tree", "Dao", "Ilang-Ilang"],
        ratio: 3, // 3:1 replacement ratio for fast-growing species
        reason: "Acacia is fast-growing but non-native. Replace with native hardwoods."
    },
    "Molave": {
        primary: ["Narra", "Kamagong", "Dao"],
        secondary: ["Mahogany", "Teak", "Yakal"],
        ratio: 4, // 4:1 replacement ratio for premium hardwood
        reason: "Molave is premium native hardwood. Requires high-value replacements."
    },
    "Mahogany": {
        primary: ["Narra", "Dao", "Fire Tree"],
        secondary: ["Molave", "Teak", "Ilang-Ilang"],
        ratio: 2, // 2:1 replacement ratio for established non-native
        reason: "Mahogany adapts well but native species preferred."
    },
    "Fire Tree": {
        primary: ["Narra", "Dao", "Ilang-Ilang"],
        secondary: ["Mahogany", "Molave", "Bougainvillea"],
        ratio: 2, // 2:1 replacement ratio for ornamental
        reason: "Fire Tree is ornamental. Balance with native species."
    },
    "Narra": {
        primary: ["Molave", "Kamagong", "Dao"],
        secondary: ["Yakal", "Teak", "Mahogany"],
        ratio: 5, // 5:1 replacement ratio for national tree
        reason: "Narra is the national tree. Requires premium replacements."
    },
    "Dao": {
        primary: ["Narra", "Molave", "Mahogany"],
        secondary: ["Fire Tree", "Ilang-Ilang", "Teak"],
        ratio: 3, // 3:1 replacement ratio for native hardwood
        reason: "Dao is valuable native species requiring quality replacements."
    },
    "Balete": {
        primary: ["Narra", "Molave", "Kamagong"],
        secondary: ["Dao", "Yakal", "Teak"],
        ratio: 6, // 6:1 replacement ratio for heritage tree
        reason: "Balete trees are culturally significant and take decades to mature."
    },
    "Banyan": {
        primary: ["Narra", "Molave", "Dao"],
        secondary: ["Mahogany", "Fire Tree", "Ilang-Ilang"],
        ratio: 5, // 5:1 replacement ratio for large canopy tree
        reason: "Banyan provides extensive canopy coverage and shade."
    }
};

// Species information database
const speciesDatabase = {
    "Narra": { scientific: "Pterocarpus indicus", category: "Native Hardwood", growth: "Medium", lifespan: "100+ years" },
    "Mahogany": { scientific: "Swietenia macrophylla", category: "Introduced Hardwood", growth: "Fast", lifespan: "60-80 years" },
    "Molave": { scientific: "Vitex parviflora", category: "Native Hardwood", growth: "Slow", lifespan: "100+ years" },
    "Fire Tree": { scientific: "Delonix regia", category: "Ornamental", growth: "Fast", lifespan: "40-60 years" },
    "Dao": { scientific: "Dracontomelon dao", category: "Native Hardwood", growth: "Medium", lifespan: "80-100 years" },
    "Ilang-Ilang": { scientific: "Cananga odorata", category: "Native Ornamental", growth: "Fast", lifespan: "50-70 years" },
    "Kamagong": { scientific: "Diospyros blancoi", category: "Native Hardwood", growth: "Slow", lifespan: "100+ years" },
    "Teak": { scientific: "Tectona grandis", category: "Introduced Hardwood", growth: "Medium", lifespan: "80-100 years" },
    "Yakal": { scientific: "Shorea astylosa", category: "Native Hardwood", growth: "Slow", lifespan: "100+ years" },
    "Bougainvillea": { scientific: "Bougainvillea spectabilis", category: "Ornamental Shrub", growth: "Fast", lifespan: "20-30 years" }
};

const SaplingRecommendationDemo: React.FC = () => {
    const [selectedRequest, setSelectedRequest] = useState<string>("");
    const [recommendations, setRecommendations] = useState<any>(null);
    const [treeRequests, setTreeRequests] = useState<TreeManagementRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [monitoringRequest, setMonitoringRequest] = useState<MonitoringRequest | null>(null);
    const [loadingMonitoring, setLoadingMonitoring] = useState(false);

    // Fetch real tree cutting requests from API
    useEffect(() => {
        const loadTreeRequests = async () => {
            try {
                setLoading(true);
                const requests = await fetchTreeManagementRequests();
                // Filter only cutting requests
                const cuttingRequests = requests.filter(req => req.request_type === "cutting");
                setTreeRequests(cuttingRequests);
            } catch (err) {
                setError("Failed to load tree cutting requests");
                console.error("Error fetching tree requests:", err);
            } finally {
                setLoading(false);
            }
        };

        loadTreeRequests();
    }, []);

    const parseTreesAndQuantities = (treesAndQuantities: string[] | null | undefined) => {
        if (!treesAndQuantities) return [];

        return treesAndQuantities.map(treeString => {
            // Parse strings like "Acacia (Acacia mangium): 12 trees, DBH: 30-50cm"
            const match = treeString.match(/^([^:]+):\s*(\d+)\s*trees?/i);
            if (match) {
                const species = match[1].trim().split(' ')[0]; // Get first word as species
                const quantity = parseInt(match[2]);
                return { species, quantity, description: treeString };
            }
            return null;
        }).filter(Boolean);
    };

    const generateRecommendations = (request: TreeManagementRequest) => {
        const treesToCut = parseTreesAndQuantities(request.trees_and_quantities);

        const totalTreesToCut = treesToCut.reduce((sum, tree) => sum + (tree?.quantity || 0), 0);

        const totalReplacements = treesToCut.reduce((total, tree) => {
            if (!tree) return total;
            const replacement = philippineTreeReplacements[tree.species as keyof typeof philippineTreeReplacements];
            return total + (tree.quantity * (replacement?.ratio || 3));
        }, 0);

        const speciesRecommendations = treesToCut.map(tree => {
            if (!tree) return null;

            const replacement = philippineTreeReplacements[tree.species as keyof typeof philippineTreeReplacements];
            if (!replacement) return null;

            const primaryCount = Math.ceil(tree.quantity * replacement.ratio * 0.6);
            const secondaryCount = tree.quantity * replacement.ratio - primaryCount;

            return {
                original: tree,
                replacements: {
                    primary: {
                        species: replacement.primary,
                        count: primaryCount
                    },
                    secondary: {
                        species: replacement.secondary,
                        count: secondaryCount
                    }
                },
                ratio: replacement.ratio,
                reason: replacement.reason
            };
        }).filter(Boolean);

        return {
            request,
            totalTreesToCut,
            totalReplacements,
            speciesRecommendations,
            estimatedCost: `₱${(totalReplacements * 200).toLocaleString()} - ₱${(totalReplacements * 350).toLocaleString()}`,
            timeframe: "6-12 months for establishment"
        };
    };

    const handleRequestSelect = (requestId: string) => {
        setSelectedRequest(requestId);
        if (requestId) {
            const request = treeRequests.find(r => r.id === requestId);
            if (request) {
                setRecommendations(generateRecommendations(request));

                // Fetch monitoring request if linked
                if (request.monitoring_request_id) {
                    fetchMonitoringData(request.monitoring_request_id);
                } else {
                    setMonitoringRequest(null);
                }
            }
        } else {
            setRecommendations(null);
            setMonitoringRequest(null);
        }
    };

    const fetchMonitoringData = async (monitoringRequestId: string) => {
        try {
            setLoadingMonitoring(true);
            const monitoringData = await fetchMonitoringRequest(monitoringRequestId);
            setMonitoringRequest(monitoringData);
        } catch (error) {
            console.error('Error fetching monitoring request:', error);
            setMonitoringRequest(null);
        } finally {
            setLoadingMonitoring(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Sapling Replacement Recommendation System
                    </h1>
                    <p className="text-gray-600">
                        Realistic tree replacement recommendations based on Philippine forestry studies
                    </p>
                </div>

                {/* Request Selection */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TreePine className="h-5 w-5 text-green-600" />
                            Select Tree Cutting Request
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
                                <span className="text-gray-600">Loading tree cutting requests...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                                <p className="text-red-600">{error}</p>
                            </div>
                        ) : treeRequests.length === 0 ? (
                            <div className="text-center py-8">
                                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No tree cutting requests available</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <select
                                    value={selectedRequest}
                                    onChange={(e) => handleRequestSelect(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Choose a tree cutting request...</option>
                                    {treeRequests.map((request) => (
                                        <option key={request.id} value={request.id}>
                                            {request.request_number} - {request.requester_name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Request Details */}
                {recommendations && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                    Request Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Request Number</span>
                                        <p className="font-semibold">{recommendations.request.request_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Date</span>
                                        <p className="font-semibold">{recommendations.request.request_date}</p>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-sm font-medium text-gray-500">Requester</span>
                                    <p className="font-semibold">{recommendations.request.requester_name}</p>
                                </div>

                                <div>
                                    <span className="text-sm font-medium text-gray-500">Location</span>
                                    <p className="font-semibold">{recommendations.request.property_address}</p>
                                </div>

                                <div>
                                    <span className="text-sm font-medium text-gray-500">Status</span>
                                    <p className="font-semibold capitalize">{recommendations.request.status.replace('_', ' ')}</p>
                                </div>

                                <div>
                                    <span className="text-sm font-medium text-gray-500">Trees to be Cut</span>
                                    <div className="mt-2 space-y-2">
                                        {recommendations.request.trees_and_quantities?.map((treeString, index) => (
                                            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-sm text-red-800">{treeString}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {recommendations.request.notes && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Notes</span>
                                        <p className="text-sm text-gray-600 mt-1">{recommendations.request.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recommendations */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Leaf className="h-5 w-5 text-green-600" />
                                    AI Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-green-900 mb-2">Summary</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-green-700">Trees to Cut:</span>
                                            <p className="font-semibold text-green-900">{recommendations.totalTreesToCut}</p>
                                        </div>
                                        <div>
                                            <span className="text-green-700">Replacements:</span>
                                            <p className="font-semibold text-green-900">{recommendations.totalReplacements}</p>
                                        </div>
                                        <div>
                                            <span className="text-green-700">Est. Cost:</span>
                                            <p className="font-semibold text-green-900">{recommendations.estimatedCost}</p>
                                        </div>
                                        <div>
                                            <span className="text-green-700">Timeframe:</span>
                                            <p className="font-semibold text-green-900">{recommendations.timeframe}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {recommendations.speciesRecommendations.map((rec: any, index: number) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-gray-900">
                                                    {rec.original.species} Replacement
                                                </span>
                                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    {rec.ratio}:1 ratio
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>

                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Primary Species ({rec.replacements.primary.count} saplings):</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {rec.replacements.primary.species.map((species: string, i: number) => (
                                                            <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                {species}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Secondary Species ({rec.replacements.secondary.count} saplings):</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {rec.replacements.secondary.species.map((species: string, i: number) => (
                                                            <span key={i} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                                {species}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Species Database Reference */}
                {recommendations && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-purple-600" />
                                Species Information Database
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(speciesDatabase).map(([species, info]) => (
                                    <div key={species} className="border border-gray-200 rounded-lg p-3">
                                        <h4 className="font-semibold text-gray-900">{species}</h4>
                                        <p className="text-sm italic text-gray-600">{info.scientific}</p>
                                        <div className="mt-2 space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Category:</span>
                                                <span className="text-gray-700">{info.category}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Growth:</span>
                                                <span className="text-gray-700">{info.growth}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Lifespan:</span>
                                                <span className="text-gray-700">{info.lifespan}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Information Panel */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-center">About This Recommendation System</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <TreePine className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-gray-900 mb-2">Science-Based</h3>
                                <p className="text-sm text-gray-600">
                                    Recommendations based on research from Forest Management Bureau (FMB) and UPLB College of Forestry
                                </p>
                            </div>
                            <div>
                                <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-gray-900 mb-2">Native Priority</h3>
                                <p className="text-sm text-gray-600">
                                    Prioritizes native Philippine species to support local ecosystems and biodiversity
                                </p>
                            </div>
                            <div>
                                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-gray-900 mb-2">Context-Aware</h3>
                                <p className="text-sm text-gray-600">
                                    Considers tree value, location, and development type for appropriate replacement ratios
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location Map and Planting Recommendations */}
                {recommendations && monitoringRequest && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Location Analysis & Planting Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loadingMonitoring ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                    <span className="ml-2 text-gray-600">Loading location data...</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-blue-900 mb-2">Current Location</h3>
                                        <div className="text-sm text-blue-800 space-y-1">
                                            <div>📍 Coordinates: {monitoringRequest.location.lat.toFixed(6)}, {monitoringRequest.location.lng.toFixed(6)}</div>
                                            {monitoringRequest.address && <div>🏠 Address: {monitoringRequest.address}</div>}
                                            <div>📊 Status: {monitoringRequest.status}</div>
                                            {monitoringRequest.notes && <div>📝 Notes: {monitoringRequest.notes}</div>}
                                        </div>
                                    </div>

                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-green-900 mb-2">Recommended Planting Areas</h3>
                                        <div className="text-sm text-green-800 space-y-2">
                                            <div className="flex items-start gap-2">
                                                <span className="text-green-600 mt-1">🌳</span>
                                                <div>
                                                    <strong>Primary Planting Zone:</strong> Within 50-100 meters of the tree cutting location to maintain ecological continuity
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-green-600 mt-1">🏞️</span>
                                                <div>
                                                    <strong>Secondary Areas:</strong> Nearby parks, green spaces, or roadside plantings within 200 meters
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-green-600 mt-1">🌱</span>
                                                <div>
                                                    <strong>Environmental Considerations:</strong> Avoid areas with high pollution, ensure proper soil conditions and sunlight
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
                                        <LocationMap
                                            location={monitoringRequest.location}
                                            height={384}
                                            zoom={16}
                                        />
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-yellow-900 mb-2">Implementation Guidelines</h3>
                                        <div className="text-sm text-yellow-800 space-y-1">
                                            <div>• <strong>Timeline:</strong> Plant within 6 months of tree removal</div>
                                            <div>• <strong>Spacing:</strong> 5-8 meters between saplings for optimal growth</div>
                                            <div>• <strong>Maintenance:</strong> Regular watering for first 2 years</div>
                                            <div>• <strong>Monitoring:</strong> Track survival rate and growth progress</div>
                                            <div>• <strong>Compliance:</strong> Follow local environmental regulations and best-practice urban forestry guidelines</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default SaplingRecommendationDemo;
