// client/src/presentation/roles/urban-greening/pages/dashboard/UrbanGreeningDashboard.tsx
/**
 * New Urban Greening Dashboard - Streamlined Flow
 * Quick access to tree management with actionable insights
 */

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  TreePine,
  Plus,
  ClipboardList,
  Map,
  RefreshCw,
  Leaf,
  AlertTriangle,
  Axe,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
} from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { useTreeStats } from "../tree-inventory/logic/useTreeInventory";

// Quick Action Card Component
interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}

const QuickActionCard: React.FC<QuickActionProps> = ({
  icon,
  title,
  description,
  href,
  color,
}) => (
  <a
    href={href}
    className={`block p-4 rounded-xl border-2 border-dashed ${color} hover:border-solid transition-all duration-200 text-left group w-full`}
  >
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${color.replace("border-", "bg-").replace("-300", "-100")}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{description}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
    </div>
  </a>
);

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  change?: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, change, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      {change !== undefined && (
        <div className={`flex items-center text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
          {change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div className="mt-3">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  </div>
);

const UrbanGreeningDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: stats, isLoading } = useTreeStats();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["tree-inventory"] });
    queryClient.invalidateQueries({ queryKey: ["tree-stats"] });
    queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FBFC]">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Urban Greening & Tree Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage trees, monitor health, and track greening initiatives
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
                className="rounded-lg h-9 w-9"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <a href="/urban-greening/tree-inventory">
                <Button className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg">
                  <TreePine className="w-4 h-4 mr-2" />
                  Open Tree Registry
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC] space-y-6">
          
          {/* Quick Actions Section */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard
                icon={<Plus className="w-5 h-5 text-green-600" />}
                title="Add New Tree"
                description="Register a newly planted tree"
                href="/urban-greening/tree-inventory?action=add"
                color="border-green-300"
              />
              <QuickActionCard
                icon={<Map className="w-5 h-5 text-blue-600" />}
                title="View Tree Map"
                description="See all trees on the map"
                href="/urban-greening/tree-inventory?tab=map"
                color="border-blue-300"
              />
              <QuickActionCard
                icon={<ClipboardList className="w-5 h-5 text-purple-600" />}
                title="Tree Requests"
                description="Manage tree cutting & planting permits"
                href="/urban-greening/tree-requests"
                color="border-purple-300"
              />
              <QuickActionCard
                icon={<DollarSign className="w-5 h-5 text-amber-600" />}
                title="Fee Records"
                description="Track payments & dues"
                href="/urban-greening/fee-records"
                color="border-amber-300"
              />
            </div>
          </div>

          {/* Stats Overview */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Tree Inventory Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <StatCard
                icon={<TreePine className="w-4 h-4 text-green-600" />}
                label="Total Trees"
                value={stats?.total_trees || 0}
                color="bg-green-100"
              />
              <StatCard
                icon={<Leaf className="w-4 h-4 text-emerald-600" />}
                label="Healthy"
                value={stats?.healthy_trees || 0}
                color="bg-emerald-100"
              />
              <StatCard
                icon={<AlertTriangle className="w-4 h-4 text-yellow-600" />}
                label="Needs Attention"
                value={stats?.needs_attention_trees || 0}
                color="bg-yellow-100"
              />
              <StatCard
                icon={<CheckCircle2 className="w-4 h-4 text-blue-600" />}
                label="Alive"
                value={stats?.alive_trees || 0}
                color="bg-blue-100"
              />
              <StatCard
                icon={<Axe className="w-4 h-4 text-red-600" />}
                label="Cut"
                value={stats?.cut_trees || 0}
                color="bg-red-100"
              />
              <StatCard
                icon={<Clock className="w-4 h-4 text-gray-600" />}
                label="Diseased"
                value={stats?.diseased_trees || 0}
                color="bg-gray-100"
              />
            </div>
          </div>

          {/* Main Workflow Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tree Registry Card */}
            <Card className="lg:col-span-2 border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-green-600" />
                  Tree Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  The central registry for all trees in San Fernando. Track planting, cutting, health status, and location.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">{stats?.alive_trees || 0}</div>
                    <div className="text-xs text-green-600">Living Trees</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">{stats?.trees_planted_this_year || 0}</div>
                    <div className="text-xs text-blue-600">Planted This Year</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href="/urban-greening/tree-inventory" className="flex-1">
                    <Button className="w-full bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg">
                      View Registry
                    </Button>
                  </a>
                  <a href="/urban-greening/tree-inventory?action=add">
                    <Button variant="outline" className="rounded-lg">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Tree
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Alerts & Notifications Card */}
            <Card className="border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Attention Needed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(stats?.needs_attention_trees || 0) > 0 && (
                    <a
                      href="/urban-greening/tree-inventory?health=needs_attention"
                      className="block w-full p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-left hover:bg-yellow-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-yellow-800">{stats?.needs_attention_trees} trees need attention</div>
                          <div className="text-xs text-yellow-600">Requires inspection</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-yellow-600" />
                      </div>
                    </a>
                  )}
                  {(stats?.diseased_trees || 0) > 0 && (
                    <a
                      href="/urban-greening/tree-inventory?health=diseased"
                      className="block w-full p-3 bg-orange-50 rounded-lg border border-orange-200 text-left hover:bg-orange-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-orange-800">{stats?.diseased_trees} diseased trees</div>
                          <div className="text-xs text-orange-600">May need treatment</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-orange-600" />
                      </div>
                    </a>
                  )}
                  {(stats?.needs_attention_trees || 0) === 0 && (stats?.diseased_trees || 0) === 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-green-800">All trees are healthy!</div>
                      <div className="text-xs text-green-600">No immediate attention required</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Greening Projects */}
            <a href="/urban-greening/greening-projects">
              <Card className="border-0 hover:border-teal-200 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <TreePine className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Greening Projects</div>
                      <div className="text-xs text-gray-500">Planting projects & sapling tracking</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </a>

            {/* Fee Records */}
            <a href="/urban-greening/fee-records">
              <Card className="border-0 hover:border-amber-200 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Fee Records</div>
                      <div className="text-xs text-gray-500">Payment tracking & fee management</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </a>
          </div>

          {/* Workflow Guide */}
          <Card className="border-0 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tree Management Workflow</h3>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">1</div>
                  <span className="text-gray-700">Register Tree</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                  <span className="text-gray-700">Monitor Health</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
                  <span className="text-gray-700">Process Requests</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">4</div>
                  <span className="text-gray-700">Track Fees</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default UrbanGreeningDashboard;
