// client/src/presentation/roles/urban-greening/pages/tree-requests/components/ISOTreeRequestDashboard.tsx
/**
 * Tree Request Analytics Dashboard
 * Displays delay monitoring, processing time trends, and request statistics
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAnalyticsSummary,
  fetchDelayedRequests,
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
  CheckCircle2
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

interface ISOTreeRequestDashboardProps {
  onViewRequest?: (request: TreeRequestWithAnalytics) => void;
}

const STATUS_COLORS: Record<ISOOverallStatus, string> = {
  receiving: "bg-blue-100 text-blue-800",
  inspection: "bg-purple-100 text-purple-800",
  requirements: "bg-yellow-100 text-yellow-800",
  clearance: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const ISOTreeRequestDashboard: React.FC<ISOTreeRequestDashboardProps> = ({
  onViewRequest,
}) => {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["tree-request-analytics-summary"],
    queryFn: fetchAnalyticsSummary,
  });

  const { data: delayedRequests, isLoading: delayedLoading } = useQuery({
    queryKey: ["tree-request-delayed"],
    queryFn: () => fetchDelayedRequests({ limit: 20 }),
  });

  const getDelayDays = (request: TreeRequestWithAnalytics): number => {
    const standardDays = 
      (request.receiving_standard_days || 0) +
      (request.inspection_standard_days || 0) +
      (request.requirements_standard_days || 0) +
      (request.clearance_standard_days || 0);
    return Math.max(0, request.total_days - standardDays);
  };

  const delayedColumns: ColumnDef<TreeRequestWithAnalytics>[] = [
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
      accessorKey: "overall_status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as ISOOverallStatus;
        return (
          <Badge className={STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "receiving_name",
      header: "Name",
      cell: ({ getValue }) => getValue() || "—",
    },
    {
      accessorKey: "receiving_organization",
      header: "Organization",
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
      id: "days_overdue",
      header: "Days Overdue",
      cell: ({ row }) => {
        const delayDays = getDelayDays(row.original);
        return (
          <div className="text-right">
            <span className="text-red-600 font-semibold">+{delayDays}</span>
          </div>
        );
      },
    },
    {
      id: "delayed_phase",
      header: "Delayed Phase",
      cell: ({ row }) => {
        const request = row.original;
        let delayedPhase = "Unknown";
        
        if (request.overall_status === "receiving" && 
            request.days_in_receiving > (request.receiving_standard_days || 0)) {
          delayedPhase = "Receiving";
        } else if ((request.overall_status === "inspection" || request.overall_status === "requirements") && 
                   request.days_in_inspection > (request.inspection_standard_days || 0)) {
          delayedPhase = "Inspection";
        } else if (request.overall_status === "clearance" && 
                   request.days_in_clearance > (request.clearance_standard_days || 0)) {
          delayedPhase = "Clearance";
        }

        return <Badge variant="destructive">{delayedPhase}</Badge>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewRequest?.(row.original);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleRowClick = (row: any) => {
    onViewRequest?.(row.original);
  };

  if (summaryLoading || delayedLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards - Top Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary?.total_requests || 0}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary?.by_status?.receiving || 0}</div>
                <div className="text-xs text-gray-500">Receiving</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary?.by_status?.inspection || 0}</div>
                <div className="text-xs text-gray-500">Inspection</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary?.by_status?.requirements || 0}</div>
                <div className="text-xs text-gray-500">Requirements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary?.by_status?.clearance || 0}</div>
                <div className="text-xs text-gray-500">Clearance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 ${(summary?.delayed_count || 0) > 0 ? "border-2 border-red-500" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{summary?.delayed_count || 0}</div>
                <div className="text-xs text-gray-500">Delayed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {(summary?.by_status?.receiving || 0) + 
                   (summary?.by_status?.inspection || 0) + 
                   (summary?.by_status?.requirements || 0) + 
                   (summary?.by_status?.clearance || 0)}
                </div>
                <div className="text-xs text-gray-500">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {summary?.by_status?.completed || 0}
                </div>
                <div className="text-xs text-gray-500">
                  {summary?.total_requests 
                    ? `${(((summary.by_status?.completed || 0) / summary.total_requests) * 100).toFixed(1)}% completed`
                    : "0% completed"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{summary?.delayed_count || 0}</div>
                <div className="text-xs text-gray-500">
                  {summary?.total_requests 
                    ? `${((summary.delayed_count / summary.total_requests) * 100).toFixed(1)}% delayed`
                    : "0% delayed"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests by Phase */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-5 h-5" />
            Requests by Phase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(summary?.by_status || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[status as ISOOverallStatus]?.split(' ')[0] || "bg-gray-500"}`} />
                  <span className="capitalize font-medium">{status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${STATUS_COLORS[status as ISOOverallStatus]?.split(' ')[0] || "bg-gray-500"}`}
                      style={{
                        width: `${summary?.total_requests ? (count / summary.total_requests) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delayed Requests Table */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Currently Delayed Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {delayedRequests && delayedRequests.length > 0 ? (
            <DataTable
              data={delayedRequests}
              columns={delayedColumns}
              onRowClick={handleRowClick}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No delayed requests at this time</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ISOTreeRequestDashboard;
