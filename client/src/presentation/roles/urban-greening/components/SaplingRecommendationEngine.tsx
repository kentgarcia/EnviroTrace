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
    // Enhanced cost estimation based on species type and commercial suitability
    const costs: Record<string, number> = {
        'narra': 250, // Premium native hardwood
        'mahogany': 180, // Popular commercial species
        'molave': 220, // High-quality hardwood
        'fire tree': 160, // Ornamental tree
        'acacia': 120, // Fast-growing species
        'ilang-ilang': 140, // Fragrant ornamental
        'bougainvillea': 80, // Ornamental shrub
        'mango': 150, // Fruit tree
        'bamboo': 60, // Fast-growing utility
        'default': 120
    };

    const lowerSpecies = species.toLowerCase();
    const matchingKey = Object.keys(costs).find(key => lowerSpecies.includes(key));
    return matchingKey ? costs[matchingKey] : costs.default;
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
    const lowerSpecies = species.toLowerCase();

    // Success rate reasons
    if (stats.avgSurvivalRate > 90) {
        reasons.push('Excellent survival rate in your area');
    } else if (stats.avgSurvivalRate > 80) {
        reasons.push('High success rate in your area');
    } else if (stats.avgSurvivalRate > 70) {
        reasons.push('Good performance in local conditions');
    }

    // Location-specific reasons
    if (proximityMatch) {
        reasons.push('Proven to thrive in similar business districts');
    }

    // Species-specific benefits
    if (lowerSpecies.includes('narra')) {
        reasons.push('Premium native hardwood, excellent for corporate landscaping');
    } else if (lowerSpecies.includes('mahogany')) {
        reasons.push('Fast-growing, low maintenance, professional appearance');
    } else if (lowerSpecies.includes('fire tree')) {
        reasons.push('Beautiful flowering ornamental, attracts positive attention');
    } else if (lowerSpecies.includes('acacia')) {
        reasons.push('Quick establishment, cost-effective solution');
    } else if (lowerSpecies.includes('ilang-ilang')) {
        reasons.push('Fragrant flowers, enhances property ambiance');
    }

    // Data reliability
    if (stats.total > 5) {
        reasons.push('Extensively tested in Muntinlupa area');
    } else if (stats.total > 2) {
        reasons.push('Well-documented local performance');
    }

    // Add survival rate as final reason
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
                
                // Enhanced parsing for realistic tree data format
                let totalTreesCut = 0;
                const speciesRemoved: string[] = [];
                
                treesAndQuantities.forEach(entry => {
                    // Parse entries like "Acacia (Acacia mangium): 12 trees, DBH: 30-50cm"
                    const quantityMatch = entry.match(/(\d+)\s+trees?/i);
                    const speciesMatch = entry.match(/^([^(]+)/);
                    
                    if (quantityMatch) {
                        totalTreesCut += parseInt(quantityMatch[1]);
                    } else {
                        totalTreesCut += 1; // Default to 1 if no quantity specified
                    }
                    
                    if (speciesMatch) {
                        speciesRemoved.push(speciesMatch[1].trim());
                    }
                });

                // Enhanced replacement ratio calculation for commercial developments
                let baseReplacementRatio = 1;

                // Commercial development requires higher replacement ratios
                if (request.requester_name?.toLowerCase().includes('corporation') ||
                    request.requester_name?.toLowerCase().includes('development') ||
                    request.notes?.toLowerCase().includes('development') ||
                    request.notes?.toLowerCase().includes('commercial')) {
                    baseReplacementRatio = 3; // 3:1 ratio for commercial projects
                }

                // Increase ratio for mature trees (DBH > 40cm)
                const hasMatureTrees = treesAndQuantities.some(entry => 
                    entry.includes('DBH') && (
                        entry.includes('45cm') || 
                        entry.includes('50cm') ||
                        entry.match(/DBH:\s*(\d+)-(\d+)cm/) && parseInt(entry.match(/DBH:\s*(\d+)-(\d+)cm/)![2]) > 40
                    )
                );
                
                if (hasMatureTrees) {
                    baseReplacementRatio = Math.max(baseReplacementRatio, 2); // At least 2:1 for mature trees
                }

                // Adjust for emergency/safety cuts (lower ratio)
                if (request.notes?.toLowerCase().includes('emergency') ||
                    request.notes?.toLowerCase().includes('safety') ||
                    request.notes?.toLowerCase().includes('diseased')) {
                    baseReplacementRatio = Math.max(1, baseReplacementRatio * 0.67);
                }

                const totalReplacementRatio = Math.ceil(baseReplacementRatio * totalTreesCut);

                // Find species in the same area for recommendations (enhanced for Muntinlupa/Ayala Alabang)
                const areaKeywords = ['ayala', 'alabang', 'business', 'corporate', 'office'];
                const locationKeywords = request.property_address.toLowerCase();
                
                const areaPlantings = plantingRecords.filter(planting => {
                    const plantingLocation = (planting.location || '').toLowerCase();
                    const plantingBarangay = (planting.barangay || '').toLowerCase();
                    
                    return areaKeywords.some(keyword => 
                        locationKeywords.includes(keyword) && (
                            plantingLocation.includes(keyword) || 
                            plantingBarangay.includes(keyword) ||
                            plantingLocation.includes('business') ||
                            plantingLocation.includes('commercial')
                        )
                    );
                });

                // Enhanced species selection with business district preferences
                const businessDistrictSpecies = ['narra', 'mahogany', 'fire tree', 'acacia'];
                
                const topSpecies = Object.entries(speciesAnalysis)
                    .filter(([_, stats]) => stats.total >= 1) // Include species with any planting data
                    .sort(([speciesA, statsA], [speciesB, statsB]) => {
                        // Prioritize business-friendly species
                        const aIsBusinessFriendly = businessDistrictSpecies.some(bds => 
                            speciesA.toLowerCase().includes(bds));
                        const bIsBusinessFriendly = businessDistrictSpecies.some(bds => 
                            speciesB.toLowerCase().includes(bds));
                        
                        if (aIsBusinessFriendly && !bIsBusinessFriendly) return -1;
                        if (!aIsBusinessFriendly && bIsBusinessFriendly) return 1;
                        
                        // Then sort by survival rate
                        return statsB.avgSurvivalRate - statsA.avgSurvivalRate;
                    })
                    .slice(0, 6); // Get top 6 species

                const recommendations: SaplingRecommendation[] = topSpecies.map(([species, stats], index) => {
                    const proximityMatch = areaPlantings.some(p => 
                        p.species_name.toLowerCase() === species.toLowerCase());
                    
                    // Distribute saplings based on success rate and suitability
                    let baseQuantity: number;
                    if (index === 0) {
                        baseQuantity = Math.ceil(totalReplacementRatio * 0.4); // 40% to top species
                    } else if (index === 1) {
                        baseQuantity = Math.ceil(totalReplacementRatio * 0.3); // 30% to second
                    } else if (index === 2) {
                        baseQuantity = Math.ceil(totalReplacementRatio * 0.2); // 20% to third
                    } else {
                        baseQuantity = Math.ceil(totalReplacementRatio * 0.1 / (topSpecies.length - 3)); // Remaining 10%
                    }

                    return {
                        species,
                        recommendedQuantity: Math.max(1, baseQuantity),
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
