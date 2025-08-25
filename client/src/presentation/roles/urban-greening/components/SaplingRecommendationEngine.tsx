import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/shared/ui/card';
import { Badge } from '@/presentation/components/shared/ui/badge';
import { Button } from '@/presentation/components/shared/ui/button';
import { Progress } from '@/presentation/components/shared/ui/progress';
import {
    TreePine,
    MapPin,
    Calendar,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    DollarSign
} from 'lucide-react';
import { TreeRequest } from '../pages/tree-management/logic/useTreeRequests';
import { UrbanGreeningPlanting } from '@/core/api/planting-api';

// Utility functions
const getEstimatedCostPerSapling = (species: string): number => {
    // Basic cost estimation based on species type
    const costs: Record<string, number> = {
        'mahogany': 150,
        'narra': 200,
        'molave': 180,
        'bamboo': 50,
        'mango': 120,
        'default': 100
    };

    const lowerSpecies = species.toLowerCase();
    return Object.keys(costs).find(key => lowerSpecies.includes(key))
        ? costs[Object.keys(costs).find(key => lowerSpecies.includes(key))!]
        : costs.default;
};

const getOptimalPlantingSeason = (species: string): string => {
    // Philippine planting seasons
    if (species.toLowerCase().includes('bamboo')) return 'Year-round';
    return 'Rainy season (June-November)';
};

const getMaintenanceLevel = (species: string): 'low' | 'medium' | 'high' => {
    const lowMaintenance = ['bamboo', 'mahogany'];
    const highMaintenance = ['ornamental', 'flower'];

    const lowerSpecies = species.toLowerCase();

    if (lowMaintenance.some(type => lowerSpecies.includes(type))) return 'low';
    if (highMaintenance.some(type => lowerSpecies.includes(type))) return 'high';
    return 'medium';
};

const generateRecommendationReasons = (
    species: string,
    stats: any,
    proximityMatch: boolean
): string[] => {
    const reasons: string[] = [];

    if (stats.avgSurvivalRate > 80) {
        reasons.push('High success rate in your area');
    }

    if (proximityMatch) {
        reasons.push('Proven to thrive in similar locations');
    }

    if (stats.total > 10) {
        reasons.push('Extensively tested locally');
    }

    reasons.push(`${stats.avgSurvivalRate.toFixed(0)}% average survival rate`);

    return reasons;
};

interface SaplingRecommendation {
    species: string;
    recommendedQuantity: number;
    successRate: number;
    estimatedCost: number;
    plantingSeason: string;
    maintenanceLevel: 'low' | 'medium' | 'high';
    reasons: string[];
    proximityMatch: boolean;
}

interface ReplacementAnalysis {
    treeCuttingRequest: TreeRequest;
    recommendedReplacements: SaplingRecommendation[];
    totalReplacementRatio: number;
    urgencyLevel: 'low' | 'medium' | 'high';
    complianceStatus: 'pending' | 'partial' | 'complete';
}

interface SaplingRecommendationEngineProps {
    treeCuttingRequests: TreeRequest[];
    plantingRecords: UrbanGreeningPlanting[];
    onSelectRecommendation?: (analysis: ReplacementAnalysis, recommendation: SaplingRecommendation) => void;
}

export const SaplingRecommendationEngine: React.FC<SaplingRecommendationEngineProps> = ({
    treeCuttingRequests,
    plantingRecords,
    onSelectRecommendation
}) => {
    // Calculate species success rates based on planting records
    const speciesAnalysis = useMemo(() => {
        const speciesStats: Record<string, {
            total: number;
            successful: number;
            avgSurvivalRate: number;
            locations: string[];
        }> = {};

        plantingRecords.forEach(record => {
            if (!speciesStats[record.species_name]) {
                speciesStats[record.species_name] = {
                    total: 0,
                    successful: 0,
                    avgSurvivalRate: 0,
                    locations: []
                };
            }

            speciesStats[record.species_name].total += 1;

            // Consider mature, growing as successful; died, removed as failed
            if (['mature', 'growing', 'planted'].includes(record.status)) {
                speciesStats[record.species_name].successful += 1;
            }

            // Track survival rate if available
            if (record.survival_rate) {
                speciesStats[record.species_name].avgSurvivalRate += record.survival_rate;
            }

            // Track locations
            if (record.location && !speciesStats[record.species_name].locations.includes(record.location)) {
                speciesStats[record.species_name].locations.push(record.location);
            }
        });

        // Calculate success rates
        Object.keys(speciesStats).forEach(species => {
            const stats = speciesStats[species];
            if (stats.total > 0) {
                stats.avgSurvivalRate = stats.avgSurvivalRate / stats.total || (stats.successful / stats.total * 100);
            }
        });

        return speciesStats;
    }, [plantingRecords]);

    // Generate recommendations for tree cutting requests
    const replacementAnalyses = useMemo((): ReplacementAnalysis[] => {
        return treeCuttingRequests
            .filter(request => request.request_type === 'cutting')
            .map(request => {
                // Parse trees and quantities to understand what was cut
                const treesAndQuantities = request.trees_and_quantities || [];
                const totalTreesCut = treesAndQuantities.reduce((total, entry) => {
                    // Try to extract quantity from strings like "5 Mahogany trees" or "Oak tree x3"
                    const quantityMatch = entry.match(/(\d+)/) || ['1'];
                    return total + parseInt(quantityMatch[0]);
                }, treesAndQuantities.length > 0 ? 0 : 1); // Default to 1 if no specific quantities

                // Calculate replacement ratio based on cutting reason and tree characteristics
                let baseReplacementRatio = 1;

                // Increase ratio for mature trees or environmental reasons
                if (request.notes?.toLowerCase().includes('mature') ||
                    request.notes?.toLowerCase().includes('large')) {
                    baseReplacementRatio = 2;
                }

                // Reduce ratio for emergency cuts
                if (request.notes?.toLowerCase().includes('emergency') ||
                    request.notes?.toLowerCase().includes('danger') ||
                    request.notes?.toLowerCase().includes('diseased')) {
                    baseReplacementRatio = Math.max(1, baseReplacementRatio - 0.5);
                }

                const totalReplacementRatio = baseReplacementRatio * totalTreesCut;

                // Find species in the same area for recommendations
                const areaPlantings = plantingRecords.filter(planting =>
                    planting.location?.toLowerCase().includes(request.property_address.toLowerCase().split(',')[0]) ||
                    planting.barangay?.toLowerCase().includes(request.property_address.toLowerCase())
                );

                // Get top performing species
                const topSpecies = Object.entries(speciesAnalysis)
                    .filter(([_, stats]) => stats.total >= 2) // Only species with sufficient data
                    .sort(([_, a], [__, b]) => b.avgSurvivalRate - a.avgSurvivalRate)
                    .slice(0, 5);

                const recommendations: SaplingRecommendation[] = topSpecies.map(([species, stats]) => {
                    const proximityMatch = areaPlantings.some(p => p.species_name === species);
                    const baseQuantity = Math.ceil(totalReplacementRatio / topSpecies.length);

                    return {
                        species,
                        recommendedQuantity: baseQuantity,
                        successRate: Math.round(stats.avgSurvivalRate),
                        estimatedCost: baseQuantity * getEstimatedCostPerSapling(species),
                        plantingSeason: getOptimalPlantingSeason(species),
                        maintenanceLevel: getMaintenanceLevel(species),
                        reasons: generateRecommendationReasons(species, stats, proximityMatch),
                        proximityMatch
                    };
                });

                // Determine urgency based on request date
                const requestDate = new Date(request.request_date);
                const daysSinceRequest = (Date.now() - requestDate.getTime()) / (1000 * 60 * 60 * 24);

                let urgencyLevel: 'low' | 'medium' | 'high' = 'low';
                if (daysSinceRequest > 180) urgencyLevel = 'high';
                else if (daysSinceRequest > 90) urgencyLevel = 'medium';

                return {
                    treeCuttingRequest: request,
                    recommendedReplacements: recommendations,
                    totalReplacementRatio,
                    urgencyLevel,
                    complianceStatus: 'pending' // Would be calculated based on actual plantings linked to this request
                };
            });
    }, [treeCuttingRequests, speciesAnalysis, plantingRecords]);

    const getUrgencyColor = (urgency: 'low' | 'medium' | 'high') => {
        switch (urgency) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-green-600 bg-green-100';
        }
    };

    const getSuccessRateColor = (rate: number) => {
        if (rate >= 80) return 'text-green-600';
        if (rate >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (replacementAnalyses.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <TreePine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tree cutting requests requiring sapling replacements found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">Sapling Replacement Recommendations</h2>
                <Badge variant="secondary">
                    {replacementAnalyses.length} cutting request{replacementAnalyses.length !== 1 ? 's' : ''}
                </Badge>
            </div>

            {replacementAnalyses.map((analysis) => (
                <Card key={analysis.treeCuttingRequest.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                Request #{analysis.treeCuttingRequest.request_number}
                            </CardTitle>
                            <div className="flex gap-2">
                                <Badge className={getUrgencyColor(analysis.urgencyLevel)}>
                                    {analysis.urgencyLevel} priority
                                </Badge>
                                <Badge variant="outline">
                                    {analysis.totalReplacementRatio}x replacement
                                </Badge>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{analysis.treeCuttingRequest.property_address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Cut on: {new Date(analysis.treeCuttingRequest.request_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analysis.recommendedReplacements.map((recommendation, index) => (
                                <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">{recommendation.species}</CardTitle>
                                            {recommendation.proximityMatch && (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={getSuccessRateColor(recommendation.successRate)}>
                                                {recommendation.successRate}% success
                                            </Badge>
                                            <Badge variant="outline">
                                                {recommendation.maintenanceLevel} maintenance
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-1">
                                                <TreePine className="h-4 w-4 text-green-600" />
                                                <span>{recommendation.recommendedQuantity} saplings</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4 text-yellow-600" />
                                                <span>₱{recommendation.estimatedCost.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1 col-span-2">
                                                <Calendar className="h-4 w-4 text-blue-600" />
                                                <span>{recommendation.plantingSeason}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-700">Why this species:</p>
                                            {recommendation.reasons.slice(0, 2).map((reason, i) => (
                                                <p key={i} className="text-xs text-gray-600">• {reason}</p>
                                            ))}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => onSelectRecommendation?.(analysis, recommendation)}
                                        >
                                            Select This Species
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {analysis.urgencyLevel === 'high' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-red-800">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="font-medium">High Priority Replacement</span>
                                </div>
                                <p className="text-sm text-red-700 mt-1">
                                    This tree cutting is overdue for replacement. Consider immediate action to maintain environmental compliance.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}

            {/* Summary Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Replacement Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {replacementAnalyses.reduce((sum, a) => sum + a.totalReplacementRatio, 0)}
                            </div>
                            <p className="text-sm text-gray-600">Total Saplings Needed</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {Object.keys(speciesAnalysis).length}
                            </div>
                            <p className="text-sm text-gray-600">Species Available</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                ₱{replacementAnalyses.reduce((sum, analysis) =>
                                    sum + analysis.recommendedReplacements.reduce((recSum, rec) => recSum + rec.estimatedCost, 0), 0
                                ).toLocaleString()}
                            </div>
                            <p className="text-sm text-gray-600">Estimated Total Cost</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {Math.round(Object.values(speciesAnalysis).reduce((sum, stats) => sum + stats.avgSurvivalRate, 0) / Object.keys(speciesAnalysis).length)}%
                            </div>
                            <p className="text-sm text-gray-600">Avg Success Rate</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SaplingRecommendationEngine;
