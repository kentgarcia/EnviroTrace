// client/src/presentation/roles/urban-greening/pages/tree-requests/components/EnhancedISODashboard.tsx
/**
 * Enhanced Tree Request Analytics Dashboard with comprehensive delay analysis
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Button } from "@/presentation/components/shared/ui/button";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import {
  fetchTreeRequests,
  TreeRequestWithAnalytics,
  ISOOverallStatus,
} from "@/core/api/tree-management-request-api";
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  FileText,
  Activity,
  Eye,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/shared/ui/dialog";

interface EnhancedISODashboardProps {
  onViewRequest?: (request: TreeRequestWithAnalytics) => void;
}

const STATUS_COLORS: Record<ISOOverallStatus, string> = {
  receiving: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  inspection: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  requirements: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  clearance: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  completed: "bg-green-100 text-green-800 hover:bg-green-200",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
};

// Helper function to determine current phase based on last completed milestone
const getCurrentPhase = (request: TreeRequestWithAnalytics): ISOOverallStatus => {
  if (request.clearance_date_received) return 'completed';
  if (request.requirements_date_completion) return 'clearance';
  if (request.inspection_date_submitted_to_dept_head) return 'requirements';
  if (request.inspection_date_received_by_inspectors) return 'inspection';
  if (request.receiving_date_received) return 'receiving';
  return 'receiving'; // Default to receiving if no dates set
};

const EnhancedISODashboard: React.FC<EnhancedISODashboardProps> = ({
  onViewRequest,
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedPhase, setSelectedPhase] = useState<ISOOverallStatus | null>(null);
  const [showPhaseModal, setShowPhaseModal] = useState(false);

  // Fetch all requests for current year
  const { data: allRequests, isLoading } = useQuery({
    queryKey: ["tree-requests-dashboard", currentYear],
    queryFn: () => fetchTreeRequests({ year: currentYear }),
  });

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!allRequests) return null;

    const total = allRequests.length;
    const byPhase: Record<ISOOverallStatus, number> = {
      receiving: 0,
      inspection: 0,
      requirements: 0,
      clearance: 0,
      completed: 0,
      cancelled: 0,
    };

    const delayedByPhase: Record<string, { count: number; avgDelay: number; totalDelay: number }> = {
      receiving: { count: 0, avgDelay: 0, totalDelay: 0 },
      inspection: { count: 0, avgDelay: 0, totalDelay: 0 },
      requirements: { count: 0, avgDelay: 0, totalDelay: 0 },
      clearance: { count: 0, avgDelay: 0, totalDelay: 0 },
    };

    let totalCompleted = 0;
    let totalDelayed = 0;

    allRequests.forEach((req) => {
      const currentPhase = getCurrentPhase(req);
      byPhase[currentPhase] = (byPhase[currentPhase] || 0) + 1;

      // Request is completed when clearance has date received
      if (req.clearance_date_received) {
        totalCompleted++;
      }

      // Check delays per phase
      if (req.days_in_receiving > (req.receiving_standard_days || 0)) {
        const delay = req.days_in_receiving - (req.receiving_standard_days || 0);
        delayedByPhase.receiving.count++;
        delayedByPhase.receiving.totalDelay += delay;
      }
      if (req.days_in_inspection > (req.inspection_standard_days || 0)) {
        const delay = req.days_in_inspection - (req.inspection_standard_days || 0);
        delayedByPhase.inspection.count++;
        delayedByPhase.inspection.totalDelay += delay;
      }
      if (req.days_in_requirements > (req.requirements_standard_days || 0)) {
        const delay = req.days_in_requirements - (req.requirements_standard_days || 0);
        delayedByPhase.requirements.count++;
        delayedByPhase.requirements.totalDelay += delay;
      }
      if (req.days_in_clearance > (req.clearance_standard_days || 0)) {
        const delay = req.days_in_clearance - (req.clearance_standard_days || 0);
        delayedByPhase.clearance.count++;
        delayedByPhase.clearance.totalDelay += delay;
      }

      if (req.is_delayed) {
        totalDelayed++;
      }
    });

    // Calculate averages
    Object.keys(delayedByPhase).forEach((phase) => {
      const data = delayedByPhase[phase];
      if (data.count > 0) {
        data.avgDelay = Math.round(data.totalDelay / data.count);
      }
    });

    // Find most delayed phase
    let mostDelayedPhase = 'receiving';
    let maxDelayedCount = 0;
    Object.entries(delayedByPhase).forEach(([phase, data]) => {
      if (data.count > maxDelayedCount) {
        maxDelayedCount = data.count;
        mostDelayedPhase = phase;
      }
    });

    return {
      total,
      byPhase,
      completed: totalCompleted,
      delayed: totalDelayed,
      delayedByPhase,
      mostDelayedPhase,
      inProgress: total - totalCompleted - byPhase.cancelled,
    };
  }, [allRequests]);

  const phaseRequests = useMemo(() => {
    if (!selectedPhase || !allRequests) return [];
    return allRequests.filter((req) => getCurrentPhase(req) === selectedPhase);
  }, [selectedPhase, allRequests]);

  const phaseColumns: ColumnDef<TreeRequestWithAnalytics>[] = [
    {
      accessorKey: "request_number",
      header: "Request #",
      cell: ({ getValue }) => (
        <span className="font-medium font-mono text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "request_type",
      header: "Type",
      cell: ({ getValue }) => (
        <Badge variant="outline" className="capitalize">
          {getValue() as string}
        </Badge>
      ),
    },
    {
      accessorKey: "receiving_name",
      header: "Name",
      cell: ({ getValue }) => getValue() || "—",
    },
    {
      accessorKey: "total_days",
      header: "Total Days",
      cell: ({ getValue }) => (
        <div className="text-right font-semibold">{getValue() as number}</div>
      ),
    },
    {
      accessorKey: "is_delayed",
      header: "Status",
      cell: ({ getValue }) => (
        getValue() ? (
          <Badge variant="destructive">Delayed</Badge>
        ) : (
          <Badge className="bg-green-100 text-green-800">On Track</Badge>
        )
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewRequest?.(row.original);
          }}
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      ),
    },
  ];

  const handlePhaseClick = (phase: ISOOverallStatus) => {
    setSelectedPhase(phase);
    setShowPhaseModal(true);
  };

  const handleRowClick = (row: any) => {
    setShowPhaseModal(false);
    onViewRequest?.(row.original);
  };

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics for {currentYear}...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Year Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tree Request Analytics</h2>
          <p className="text-muted-foreground">Dashboard for {currentYear}</p>
        </div>
      </div>

      {/* Summary Cards - Top Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.total}</div>
                <div className="text-xs text-gray-500">Total Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.inProgress}</div>
                <div className="text-xs text-gray-500">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {analytics.completed}
                </div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-sm ${analytics.delayed > 0 ? "border-2 border-red-500" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{analytics.delayed}</div>
                <div className="text-xs text-gray-500">Delayed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests by Phase - Clickable Cards */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-5 h-5" />
            Requests by Phase (Click to view details)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {(Object.keys(analytics.byPhase) as ISOOverallStatus[]).map((phase) => (
              <button
                key={phase}
                onClick={() => handlePhaseClick(phase)}
                className={`p-4 rounded-lg transition-all cursor-pointer ${STATUS_COLORS[phase]} hover:shadow-md`}
              >
                <div className="text-2xl font-bold">{analytics.byPhase[phase]}</div>
                <div className="text-xs font-medium capitalize mt-1">{phase}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delay Analysis */}
      <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Delay Analysis - Most Delayed Phase: <span className="capitalize text-red-600">{analytics.mostDelayedPhase}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analytics.delayedByPhase).map(([phase, data]) => (
              <Card key={phase} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{phase}</span>
                    {phase === analytics.mostDelayedPhase && (
                      <Badge variant="destructive" className="text-xs">Most Delayed</Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delayed Requests:</span>
                      <span className="font-semibold text-red-600">{data.count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Delay:</span>
                      <span className="font-semibold text-orange-600">{data.avgDelay} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Standard:</span>
                      <span className="font-semibold">
                        {phase === 'receiving' ? (allRequests?.[0]?.receiving_standard_days || 'N/A') :
                         phase === 'inspection' ? (allRequests?.[0]?.inspection_standard_days || 'N/A') :
                         phase === 'requirements' ? (allRequests?.[0]?.requirements_standard_days || 'N/A') :
                         (allRequests?.[0]?.clearance_standard_days || 'N/A')} days
                      </span>
                    </div>
                    {data.count > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg Duration:</span>
                          <span className="font-semibold text-blue-600">
                            {Math.round(data.totalDelay / data.count + 
                              (phase === 'receiving' ? (allRequests?.[0]?.receiving_standard_days || 0) :
                               phase === 'inspection' ? (allRequests?.[0]?.inspection_standard_days || 0) :
                               phase === 'requirements' ? (allRequests?.[0]?.requirements_standard_days || 0) :
                               (allRequests?.[0]?.clearance_standard_days || 0))
                            )} days
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Completion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed Requests</span>
              <span className="text-2xl font-bold text-green-600">
                {analytics.total > 0 ? Math.round((analytics.completed / analytics.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all"
                style={{
                  width: `${analytics.total > 0 ? (analytics.completed / analytics.total) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-muted-foreground">Completed</div>
                <div className="font-semibold text-green-600">{analytics.completed}</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">In Progress</div>
                <div className="font-semibold text-orange-600">{analytics.inProgress}</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Cancelled</div>
                <div className="font-semibold text-red-600">{analytics.byPhase.cancelled}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Details Modal */}
      <Dialog open={showPhaseModal} onOpenChange={setShowPhaseModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="capitalize">{selectedPhase}</span> Phase Requests
              <Badge className={selectedPhase ? STATUS_COLORS[selectedPhase] : ""}>
                {phaseRequests.length} requests
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {phaseRequests.length > 0 ? (
              <DataTable
                data={phaseRequests}
                columns={phaseColumns}
                onRowClick={handleRowClick}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <XCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No requests in this phase</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedISODashboard;
