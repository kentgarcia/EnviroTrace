// client/src/presentation/roles/urban-greening/pages/tree-inventory/components/CarbonStatistics.tsx
/**
 * Carbon Statistics Component
 * Displays comprehensive tree carbon statistics in a clean, dashboard-style format
 */

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import StatCard from "@/presentation/components/shared/StatCard";
import { Progress } from "@/presentation/components/shared/ui/progress";
import { RechartsBarChart } from "@/presentation/components/shared/dashboard/RechartsBarChart";
import { RechartsPieChart } from "@/presentation/components/shared/dashboard/RechartsPieChart";
import {
  TreePine,
  Leaf,
  Wind,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Trees,
  Sprout,
  Flame,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  fetchCarbonStatistics,
} from "@/core/api/tree-inventory-api";

// Format number with commas
const formatNumber = (num: number, decimals = 0): string => {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const CarbonStatistics: React.FC = () => {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tree-carbon-statistics"],
    queryFn: fetchCarbonStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading carbon statistics...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12 text-red-500">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p>Failed to load carbon statistics</p>
      </div>
    );
  }

  const { composition, carbon_stock, annual_sequestration, carbon_loss } = stats;
  const netBalance =
    annual_sequestration.total_co2_absorbed_per_year_kg -
    carbon_loss.co2_released_from_removals_kg -
    carbon_loss.projected_decay_release_kg;

  // Transform data for charts
  const compositionPieData = [
    { id: "native", label: "Native Species", value: composition.native_count },
    { id: "endangered", label: "Endangered Species", value: composition.endangered_count },
  ];

  const topSpeciesBarData = carbon_stock.co2_stored_per_species.slice(0, 10).map((s) => ({
    id: s.common_name,
    label: s.common_name,
    value: Number((s.co2_stored_kg / 1000).toFixed(1)),
  }));

  const carbonFlowData = [
    { id: "stored", label: "Total Stored", value: Number(carbon_stock.total_co2_stored_tonnes.toFixed(1)) },
    { id: "absorbed", label: "Annual Absorption", value: Number(annual_sequestration.total_co2_absorbed_per_year_tonnes.toFixed(1)) },
    { id: "released", label: "Released", value: Number(carbon_loss.co2_released_from_removals_tonnes.toFixed(1)) },
    { id: "decay", label: "Projected Decay", value: Number(carbon_loss.projected_decay_release_tonnes.toFixed(1)) },
  ];

  const removalMethodsData = carbon_loss.removal_methods.map((m) => ({
    id: m.reason || "Unknown",
    label: m.reason || "Unknown",
    value: Number((m.co2_released_kg / 1000).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      {/* Key Stats Summary */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Carbon Statistics Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Trees"
            value={formatNumber(composition.total_trees)}
            Icon={TreePine}
          />
          <StatCard
            label="Total CO₂ Stored"
            value={`${formatNumber(carbon_stock.total_co2_stored_tonnes, 1)} t`}
            Icon={Wind}
          />
          <StatCard
            label="CO₂ Absorbed/Year"
            value={`${formatNumber(annual_sequestration.total_co2_absorbed_per_year_tonnes, 1)} t`}
            Icon={TrendingUp}
          />
          <StatCard
            label="Net Balance"
            value={`${netBalance >= 0 ? '+' : ''}${formatNumber(netBalance / 1000, 1)} t`}
            Icon={netBalance >= 0 ? TrendingUp : TrendingDown}
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Native vs Exotic Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Tree Species Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RechartsPieChart
              title=""
              data={compositionPieData}
              height={280}
              color={["#0054A6", "#4A90E2"]}
              legendAsList
              showLabels
            />
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{composition.native_ratio}%</div>
                <div className="text-xs text-gray-600">Native Species</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{composition.endangered_count}</div>
                <div className="text-xs text-gray-600">Endangered Species</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Carbon Storing Species */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Top 10 Carbon Storing Species
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RechartsBarChart
              title=""
              data={topSpeciesBarData}
              height={280}
              color={["#0054A6"]}
              insights={[
                `Top species: ${topSpeciesBarData[0]?.label || 'N/A'}`,
                `Stores ${topSpeciesBarData[0]?.value || 0} tonnes CO₂`
              ]}
            />
          </CardContent>
        </Card>

        {/* Carbon Flow Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Carbon Flow Analysis (tonnes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RechartsBarChart
              title=""
              data={carbonFlowData}
              height={280}
              color={["#0054A6", "#22c55e", "#ef4444", "#f97316"]}
              insights={[
                `Net balance: ${netBalance >= 0 ? '+' : ''}${formatNumber(netBalance / 1000, 1)} t/year`,
                netBalance >= 0 ? "Carbon positive!" : "Need more trees"
              ]}
            />
          </CardContent>
        </Card>

        {/* Top 5 Species Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Leaf className="w-5 h-5 text-blue-600" />
              Top 5 Carbon Storing Species - Performance Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {carbon_stock.co2_stored_per_species.slice(0, 5).map((species, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{species.common_name}</div>
                        <div className="text-xs text-gray-500">{species.tree_count} trees</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {formatNumber(species.co2_stored_kg / 1000, 1)} t
                      </div>
                      <div className="text-xs text-gray-500">{species.percentage_of_total.toFixed(1)}% of total</div>
                    </div>
                  </div>
                  <Progress value={species.percentage_of_total} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Removal Methods */}
        {removalMethodsData.length > 0 && (
          <Card className="xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                CO₂ Released by Removal Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RechartsPieChart
                title=""
                data={removalMethodsData}
                height={280}
                color={["#ef4444", "#f97316", "#dc2626"]}
                legendAsList
                showLabels
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Metrics Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Tree Composition Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trees className="w-5 h-5 text-blue-600" />
              Tree Composition Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Trees</span>
                <span className="text-lg font-bold text-gray-900">{formatNumber(composition.total_trees)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Living Trees</span>
                <span className="text-lg font-bold text-blue-600">{formatNumber(composition.alive_trees)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Native Trees</span>
                <span className="text-lg font-bold text-gray-900">{formatNumber(composition.native_count)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Endangered Trees</span>
                <span className="text-lg font-bold text-gray-900">{formatNumber(composition.endangered_count)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-600">Removed (2026)</span>
                <span className="text-lg font-bold text-red-600">{formatNumber(composition.cut_trees)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carbon Metrics Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wind className="w-5 h-5 text-blue-600" />
              Carbon Metrics Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Total CO₂ Stored</span>
                <span className="text-lg font-bold text-blue-600">{formatNumber(carbon_stock.total_co2_stored_tonnes, 1)} t</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Avg per Tree</span>
                <span className="text-lg font-bold text-gray-900">{formatNumber(carbon_stock.total_co2_stored_kg / (composition.alive_trees || 1))} kg</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Annual Absorption</span>
                <span className="text-lg font-bold text-blue-600">{formatNumber(annual_sequestration.total_co2_absorbed_per_year_tonnes, 1)} t/yr</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Trees Planted (2026)</span>
                <span className="text-lg font-bold text-gray-900">{formatNumber(annual_sequestration.trees_planted_this_year)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-600">CO₂ Released (Removals)</span>
                <span className="text-lg font-bold text-red-600">{formatNumber(carbon_loss.co2_released_from_removals_tonnes, 1)} t</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated timestamp */}
      <div className="text-xs text-gray-400 text-right">
        Generated: {new Date(stats.generated_at).toLocaleString()}
      </div>
    </div>
  );
};

export default CarbonStatistics;
