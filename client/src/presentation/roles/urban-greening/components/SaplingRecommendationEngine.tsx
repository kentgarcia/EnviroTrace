import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/shared/ui/card';
import { TreePine, Leaf, MapPin, Calendar, User, ChevronDown, AlertCircle, Map as MapIcon, Zap } from 'lucide-react';
import { TreeManagementRequest } from '@/core/api/tree-management-api';
import { fetchMonitoringRequest } from '@/core/api/monitoring-request-service';
import LocationMap from './LocationMap';

interface PlantingRecord {
    id: string;
    record_number: string;
    planting_type: string;
    species_name: string;
    quantity_planted: number;
    planting_date: string;
    location: string;
    barangay: string;
    status: string;
    survival_rate: number;
    responsible_person: string;
    created_at: string;
    updated_at: string;
}

interface RecommendationAnalysis {
    treeCuttingRequest: TreeManagementRequest;
    totalTreesToCut: number;
    totalReplacements: number;
    speciesRecommendations: any[];
    estimatedCost: string;
    timeframe: string;
    monitoringData?: any;
    recommendedLocations?: any[];
}

interface SaplingRecommendationEngineProps {
    treeCuttingRequests: TreeManagementRequest[];
    plantingRecords: PlantingRecord[];
    onSelectRecommendation: (analysis: RecommendationAnalysis, recommendation: any) => void;
}

const SaplingRecommendationEngine: React.FC<SaplingRecommendationEngineProps> = ({
    treeCuttingRequests,
    plantingRecords,
    onSelectRecommendation
}) => {
    const [selectedRequest, setSelectedRequest] = useState<string>("");
    const [analysis, setAnalysis] = useState<RecommendationAnalysis | null>(null);
    const [monitoringRequest, setMonitoringRequest] = useState<any>(null);
    const [loadingMonitoring, setLoadingMonitoring] = useState(false);

    // Enhanced Philippine tree replacement recommendations based on regional forestry research and urban ecology literature
    const philippineTreeReplacements = {
        "Acacia": {
            primary: ["Narra", "Mahogany", "Molave"],
            secondary: ["Fire Tree", "Dao", "Ilang-Ilang"],
            ratio: 3,
            reason: "Acacia is fast-growing but non-native. Replace with native hardwoods for biodiversity.",
            ecological: "Native species provide better habitat for local wildlife and improve soil quality.",
            fallback: ["Narra", "Mahogany"]
        },
        "Molave": {
            primary: ["Narra", "Kamagong", "Dao"],
            secondary: ["Mahogany", "Teak", "Yakal"],
            ratio: 4,
            reason: "Molave is premium native hardwood requiring high-value ecological replacements.",
            ecological: "Premium hardwood replacement ensures continued forest ecosystem services.",
            fallback: ["Narra", "Dao"]
        },
        "Mahogany": {
            primary: ["Narra", "Dao", "Fire Tree"],
            secondary: ["Molave", "Teak", "Ilang-Ilang"],
            ratio: 2,
            reason: "Mahogany adapts well but native species preferred for long-term sustainability.",
            ecological: "Mixed native species improve genetic diversity and resilience.",
            fallback: ["Narra", "Dao"]
        },
        "Fire Tree": {
            primary: ["Narra", "Dao", "Ilang-Ilang"],
            secondary: ["Mahogany", "Molave", "Bougainvillea"],
            ratio: 2,
            reason: "Fire Tree is ornamental requiring balance with native canopy species.",
            ecological: "Native trees provide better shade and cooling effects in urban areas.",
            fallback: ["Narra", "Ilang-Ilang"]
        },
        "Narra": {
            primary: ["Molave", "Kamagong", "Dao"],
            secondary: ["Yakal", "Teak", "Mahogany"],
            ratio: 5,
            reason: "Narra is the national tree requiring premium ecological compensation.",
            ecological: "National tree replacement ensures cultural and ecological continuity.",
            fallback: ["Molave", "Dao"]
        },
        "Dao": {
            primary: ["Narra", "Molave", "Mahogany"],
            secondary: ["Fire Tree", "Ilang-Ilang", "Teak"],
            ratio: 3,
            reason: "Dao is valuable native hardwood requiring quality ecological replacements.",
            ecological: "Native hardwood replacement maintains forest structure and function.",
            fallback: ["Narra", "Molave"]
        },
        "Balete": {
            primary: ["Narra", "Molave", "Kamagong"],
            secondary: ["Dao", "Yakal", "Teak"],
            ratio: 6,
            reason: "Balete trees are culturally significant requiring extensive ecological compensation.",
            ecological: "Heritage tree replacement ensures continued ecosystem services and biodiversity.",
            fallback: ["Narra", "Molave"]
        },
        "Banyan": {
            primary: ["Narra", "Molave", "Dao"],
            secondary: ["Mahogany", "Fire Tree", "Ilang-Ilang"],
            ratio: 5,
            reason: "Banyan provides extensive canopy requiring substantial ecological replacement.",
            ecological: "Large canopy tree replacement maintains urban cooling and habitat functions.",
            fallback: ["Narra", "Dao"]
        },
        // Default fallback for unknown species
        "default": {
            // Urban-first default: choose smaller or multi-stem species and ornamentals suitable for constrained spaces
            primary: ["Ilang-Ilang", "Fire Tree", "Bougainvillea"],
            secondary: ["Cassia fistula", "Golden Shower", "Small Mango"],
            ratio: 2,
            reason: "Urban default: species selected for space-constrained plantings (compact forms, multi-stem, lower root impact).",
            ecological: "Small-to-medium native and adapted species give shade and biodiversity benefits while minimizing infrastructure conflicts.",
            fallback: ["Ilang-Ilang", "Bougainvillea"]
        }
    };

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

    const generateAnalysis = (request: TreeManagementRequest): RecommendationAnalysis => {
        // build a quick recommendation pool from other requests to use as fallbacks
        const pool: Array<{ species: string; replacement: any; sourceRequestId: string }> = [];
        treeCuttingRequests.forEach(req => {
            const parsed = parseTreesAndQuantities(req.trees_and_quantities);
            parsed.forEach(p => {
                const rep = philippineTreeReplacements[p.species as keyof typeof philippineTreeReplacements] || philippineTreeReplacements['default'];
                if (rep && rep !== philippineTreeReplacements['default']) {
                    pool.push({ species: p.species, replacement: rep, sourceRequestId: req.id });
                }
            });
        });
        const treesToCut = parseTreesAndQuantities(request.trees_and_quantities);

        // If no explicit trees were parsed from the request, provide a city-appropriate default recommendation
        if (!treesToCut || treesToCut.length === 0) {
            // Urban-friendly defaults for space-constrained plantings (compact/columnar or multi-stem shrubs)
            const urbanDefault = {
                primary: ["Ilang-Ilang", "Bougainvillea", "Golden Shower"],
                secondary: ["Fire Tree", "Cassia fistula", "Small Mango"],
                ratio: 2,
                reason: "Space-constrained urban replacement: prioritize compact or multi-stem species suitable for streets, parks and small green pockets.",
                ecological: "Small-to-medium native and well-adapted species provide shade, biodiversity benefits and lower root-impact on urban infrastructure.",
                fallback: ["Ilang-Ilang", "Bougainvillea"]
            };

            const defaultReplacementsCount = 3; // suggest a small set of saplings when original tree info is missing

            const speciesRecommendations = [
                {
                    original: { species: 'Sapling', quantity: 0, description: 'No tree list provided' },
                    replacements: {
                        primary: { species: urbanDefault.primary, count: Math.ceil(defaultReplacementsCount * 0.6) },
                        secondary: { species: urbanDefault.secondary, count: Math.floor(defaultReplacementsCount * 0.4) }
                    },
                    ratio: urbanDefault.ratio,
                    reason: urbanDefault.reason,
                    ecological: urbanDefault.ecological,
                    fallback: urbanDefault.fallback,
                    urbanGuidance: "Select compact cultivars or multi-stem forms; where space is limited use planters or root barriers and 2-4m spacing. Prioritize low-root-impact species for sidewalks and roadside plantings.",
                    fallbackSource: null
                }
            ];

            return {
                treeCuttingRequest: request,
                totalTreesToCut: 0,
                totalReplacements: defaultReplacementsCount,
                speciesRecommendations,
                estimatedCost: `₱${(defaultReplacementsCount * 200).toLocaleString()} - ₱${(defaultReplacementsCount * 350).toLocaleString()}`,
                timeframe: "3-12 months for establishment"
            };
        }

        const totalTreesToCut = treesToCut.reduce((sum, tree) => sum + (tree?.quantity || 0), 0);

        const totalReplacements = treesToCut.reduce((total, tree) => {
            if (!tree) return total;
            const replacement = philippineTreeReplacements[tree.species as keyof typeof philippineTreeReplacements] ||
                philippineTreeReplacements["default"];
            return total + (tree.quantity * replacement.ratio);
        }, 0);

        const speciesRecommendations = treesToCut.map(tree => {
            if (!tree) return null;

            const replacement = philippineTreeReplacements[tree.species as keyof typeof philippineTreeReplacements] ||
                philippineTreeReplacements["default"];

            // If the replacement is the default (unknown species), try to use a pool entry as fallback
            let usedReplacement = replacement;
            let fallbackSource: string | null = null;
            if (replacement === philippineTreeReplacements['default']) {
                const candidate = pool.find(p => p && p.replacement && p.replacement !== philippineTreeReplacements['default']);
                if (candidate) {
                    usedReplacement = candidate.replacement;
                    fallbackSource = candidate.sourceRequestId;
                }
            }

            const primaryCount = Math.ceil(tree.quantity * usedReplacement.ratio * 0.6);
            const secondaryCount = tree.quantity * usedReplacement.ratio - primaryCount;

            return {
                original: tree,
                replacements: {
                    primary: {
                        species: usedReplacement.primary,
                        count: primaryCount
                    },
                    secondary: {
                        species: usedReplacement.secondary,
                        count: secondaryCount
                    }
                },
                ratio: usedReplacement.ratio,
                reason: usedReplacement.reason,
                ecological: usedReplacement.ecological,
                fallback: usedReplacement.fallback,
                fallbackSource,
                urbanGuidance: `Urban-appropriate: favor compact varieties or multi-stem options; if site is highly constrained prefer planter/raised-bed installations, root barriers, and 2-4m planting intervals depending on mature canopy size.`
            };
        }).filter(Boolean);

        return {
            treeCuttingRequest: request,
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
            const request = treeCuttingRequests.find(r => r.id === requestId);
            if (request) {
                const newAnalysis = generateAnalysis(request);
                setAnalysis(newAnalysis);

                // Fetch monitoring request if linked
                if (request.monitoring_request_id) {
                    fetchMonitoringData(request.monitoring_request_id);
                } else {
                    setMonitoringRequest(null);
                }
            }
        } else {
            setAnalysis(null);
            setMonitoringRequest(null);
        }
    };

    const fetchMonitoringData = async (monitoringRequestId: string) => {
        try {
            setLoadingMonitoring(true);
            const data = await fetchMonitoringRequest(monitoringRequestId);
            setMonitoringRequest(data);
        } catch (error) {
            console.error('Error fetching monitoring request:', error);
            setMonitoringRequest(null);
        } finally {
            setLoadingMonitoring(false);
        }
    };

    // Filter only cutting requests
    const cuttingRequests = treeCuttingRequests.filter(req => req.request_type === "cutting");

    // Gather a recommendation pool from other requests (non-default replacements)
    const recommendationPool = React.useMemo(() => {
        const pool: any[] = [];
        treeCuttingRequests.forEach(req => {
            const parsed = parseTreesAndQuantities(req.trees_and_quantities);
            parsed.forEach(p => {
                const rep = philippineTreeReplacements[p.species as keyof typeof philippineTreeReplacements] || philippineTreeReplacements['default'];
                if (rep && rep !== philippineTreeReplacements['default']) {
                    pool.push({ species: p.species, replacement: rep, sourceRequestId: req.id });
                }
            });
        });
        return pool;
    }, [treeCuttingRequests]);

    return (
        <div className="space-y-6">
            {/* <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                    <Zap className="h-6 w-6 text-green-600" />
                    Urban Tree Replacement Recommendation Engine (Research-Grounded)
                </h2>
                <p className="text-gray-600">
                    Evidence-based recommendations using regional forestry research and urban ecology heuristics
                </p>
            </div> */}

            {/* Request Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TreePine className="h-5 w-5 text-green-600" />
                        Select Tree Cutting Request
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {cuttingRequests.length === 0 ? (
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
                                {cuttingRequests.map((request) => (
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

            {/* Analysis Results */}
            {analysis && (
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
                                    <p className="font-semibold">{analysis.treeCuttingRequest.request_number}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Date</span>
                                    <p className="font-semibold">{analysis.treeCuttingRequest.request_date}</p>
                                </div>
                            </div>

                            <div>
                                <span className="text-sm font-medium text-gray-500">Requester</span>
                                <p className="font-semibold">{analysis.treeCuttingRequest.requester_name}</p>
                            </div>

                            <div>
                                <span className="text-sm font-medium text-gray-500">Location</span>
                                <p className="font-semibold">{analysis.treeCuttingRequest.property_address}</p>
                            </div>

                            <div>
                                <span className="text-sm font-medium text-gray-500">Status</span>
                                <p className="font-semibold capitalize">{analysis.treeCuttingRequest.status.replace('_', ' ')}</p>
                            </div>

                            <div>
                                <span className="text-sm font-medium text-gray-500">Trees to be Cut</span>
                                <div className="mt-2 space-y-2">
                                    {analysis.treeCuttingRequest.trees_and_quantities?.map((treeString, index) => (
                                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <p className="text-sm text-red-800">{treeString}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Leaf className="h-5 w-5 text-green-600" />
                                Sapling Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="font-semibold text-green-900 mb-2">Summary</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-green-700">Trees to Cut:</span>
                                        <p className="font-semibold text-green-900">{analysis.totalTreesToCut}</p>
                                    </div>
                                    <div>
                                        <span className="text-green-700">Replacements:</span>
                                        <p className="font-semibold text-green-900">{analysis.totalReplacements}</p>
                                    </div>
                                    <div>
                                        <span className="text-green-700">Est. Cost:</span>
                                        <p className="font-semibold text-green-900">{analysis.estimatedCost}</p>
                                    </div>
                                    <div>
                                        <span className="text-green-700">Timeframe:</span>
                                        <p className="font-semibold text-green-900">{analysis.timeframe}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {analysis.speciesRecommendations.map((rec: any, index: number) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-gray-900">
                                                {rec.original.species} Replacement
                                            </span>
                                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {rec.ratio}:1 ratio
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                                        <p className="text-sm text-green-700 mb-3 italic">💚 {rec.ecological}</p>

                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Primary Species ({rec.replacements.primary.count} saplings):</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {rec.replacements.primary.species.map((species: string, i: number) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => onSelectRecommendation(analysis, {
                                                                species,
                                                                type: 'primary',
                                                                count: rec.replacements.primary.count,
                                                                originalSpecies: rec.original.species
                                                            })}
                                                            className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded cursor-pointer transition-colors"
                                                        >
                                                            {species}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Secondary Species ({rec.replacements.secondary.count} saplings):</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {rec.replacements.secondary.species.map((species: string, i: number) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => onSelectRecommendation(analysis, {
                                                                species,
                                                                type: 'secondary',
                                                                count: rec.replacements.secondary.count,
                                                                originalSpecies: rec.original.species
                                                            })}
                                                            className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded cursor-pointer transition-colors"
                                                        >
                                                            {species}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Fallback Options */}
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <span className="text-sm font-medium text-gray-700">Fallback Options:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {rec.fallback.map((species: string, i: number) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => onSelectRecommendation(analysis, {
                                                                species,
                                                                type: 'fallback',
                                                                count: Math.ceil(rec.original.quantity * 3), // Default 3:1 ratio
                                                                originalSpecies: rec.original.species
                                                            })}
                                                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded cursor-pointer transition-colors"
                                                        >
                                                            {species} (Fallback)
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location Recommendations Map */}
                    {monitoringRequest && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapIcon className="h-5 w-5 text-blue-600" />
                                    Optimal Planting Location Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingMonitoring ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-2 text-gray-600">Analyzing location data...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h3 className="font-semibold text-blue-900 mb-2">Location Intelligence</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-blue-700">Current Location:</span>
                                                    <p className="font-semibold text-blue-900">{analysis.treeCuttingRequest.property_address}</p>
                                                </div>
                                                <div>
                                                    <span className="text-blue-700">Environmental Zone:</span>
                                                    <p className="font-semibold text-blue-900">Urban Development Area</p>
                                                </div>
                                                <div>
                                                    <span className="text-blue-700">Recommended Radius:</span>
                                                    <p className="font-semibold text-blue-900">500m from cutting site</p>
                                                </div>
                                                <div>
                                                    <span className="text-blue-700">Priority Areas:</span>
                                                    <p className="font-semibold text-blue-900">Parks, green spaces, roadside</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                                            <LocationMap
                                                location={monitoringRequest.location}
                                                height={256}
                                                zoom={16}
                                                radii={[200, 400, 500]}
                                                hotspots={(analysis.speciesRecommendations || []).map((s: any, idx: number) => ({
                                                    lat: monitoringRequest.location.lat + (idx + 1) * 0.0006,
                                                    lng: monitoringRequest.location.lng + (idx + 1) * 0.0006,
                                                    label: `${s.original.species} suggested zone ${idx + 1}`,
                                                    radius: 30
                                                }))}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <h4 className="font-medium text-green-900 mb-1">Primary Zone (0-200m)</h4>
                                                <p className="text-sm text-green-700">Immediate vicinity, highest priority for replacement</p>
                                            </div>
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                <h4 className="font-medium text-yellow-900 mb-1">Secondary Zone (200-400m)</h4>
                                                <p className="text-sm text-yellow-700">Nearby green spaces and parks</p>
                                            </div>
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <h4 className="font-medium text-blue-900 mb-1">Extended Zone (400-500m)</h4>
                                                <p className="text-sm text-blue-700">Broader urban green corridors</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default SaplingRecommendationEngine;