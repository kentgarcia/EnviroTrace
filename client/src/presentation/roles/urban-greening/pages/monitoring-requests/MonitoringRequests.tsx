import React from "react";
import { useMonitoringRequests } from "./logic/useMonitoringRequests";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/shared/ui/tabs";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
import { Plus, BarChart3, Map, List, Database } from "lucide-react";
import MapView from "../MapView";
import MonitoringRequestForm from "./components/MonitoringRequestForm";
import MonitoringRequestDetails from "./components/MonitoringRequestDetails";
import MonitoringRequestsTable from "./components/MonitoringRequestsTable";
import MonitoringAnalytics from "./components/MonitoringAnalytics";
import RelatedDataView from "./components/RelatedDataView";
import ActionWorkflowDialog from "./components/ActionWorkflowDialog";
import MonitoringRequestModal from "./components/MonitoringRequestModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import { MONITORING_REQUEST_STATUS_OPTIONS, SOURCE_TYPE_OPTIONS, SOURCE_TYPE_LABELS } from "../../constants";
import { updateMonitoringRequest } from "@/core/api/monitoring-request-service";
import { executeMonitoringAction, generateEnvironmentalReport } from "@/core/api/workflow-service";
import { toast } from "sonner";

import { useState } from "react";

const MonitoringRequests: React.FC = () => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"adding" | "editing">("adding");
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const {
    requests,
    loading,
    error,
    selectedRequestId,
    mode,
    currentView,
    searchTerm,
    statusFilter,
    sourceTypeFilter,
    selectedRequest,
    formLocation,
    setCurrentView,
    setSearchTerm,
    setStatusFilter,
    setSourceTypeFilter,
    setFormLocation,
    setSelectedRequestId,
    handleSelectRequest,
    handleAddRequest,
    handleCancel,
    handleEdit,
    handleDelete,
    handleSaveRequest,
    handleUpdateSourceType,
    getStatusColor,
    refetchRequests,
  } = useMonitoringRequests();

  // Action workflow state
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    actionType: string;
    requests: any[];
  }>({
    isOpen: false,
    actionType: '',
    requests: []
  });

  // Handle action-driven workflows
  const handleTakeAction = async (actionType: string, targetRequests: any[]) => {
    switch (actionType) {
      case 'inspect':
        // Navigate to inspection mode for single request
        if (targetRequests[0]) {
          handleSelectRequest(targetRequests[0].id);
          handleEdit();
        }
        break;
      case 'bulk_inspect':
      case 'schedule_maintenance':
      case 'plan_replacement':
        // Open action workflow dialog
        setActionDialog({
          isOpen: true,
          actionType,
          requests: targetRequests
        });
        break;
      case 'generate_report':
        // Generate and download report
        toast.info('Report generation started...');
        // You could implement actual report generation here
        break;
      default:
        console.log('Unknown action:', actionType);
    }
  };

  // Modal handlers
  const handleOpenAddModal = () => {
    setModalMode("adding");
    setIsRequestModalOpen(true);
  };

  const handleOpenEditModal = (id: string) => {
    setSelectedRequestId(id);
    setModalMode("editing");
    setIsRequestModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsRequestModalOpen(false);
    setFormLocation(null);
  };

  const handleOpenDeleteModal = (id: string) => {
    setRequestToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setRequestToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (requestToDelete) {
      try {
        await handleDelete(requestToDelete);
        handleCloseDeleteModal();
      } catch (error) {
        console.error('Error deleting request:', error);
      }
    }
  };

  const handleUpdateTitle = async (id: string, title: string) => {
    try {
      await updateMonitoringRequest(id, { title });
      toast.success('Title updated successfully');
      refetchRequests();
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
    }
  };

  // Execute action from workflow dialog
  const handleExecuteAction = async (actionType: string, actionData: any) => {
    try {
      if (actionType === 'generate_report') {
        // Handle report generation
        await generateEnvironmentalReport({
          report_type: 'monitoring_overview',
          title: `Environmental Monitoring Report - ${new Date().toLocaleDateString()}`,
          description: 'Comprehensive overview of monitoring request status and environmental impact',
          monitoring_request_ids: actionData.requestIds,
          file_format: 'pdf',
          generated_by: 'System'
        });
        toast.success('Environmental report generated successfully');
      } else {
        // Handle other action types through workflow service
        await executeMonitoringAction({
          action_type: actionType,
          request_ids: actionData.requestIds,
          scheduled_date: actionData.scheduledDate,
          assigned_to: actionData.assignedTo,
          notes: actionData.notes,
          priority: actionData.priority,
          estimated_duration: actionData.estimatedDuration,
          resources: actionData.resources,
          locations: actionData.locations,
          executed_at: actionData.executedAt
        });

        const actionMessages = {
          'bulk_inspect': 'Bulk inspection workflow created successfully',
          'schedule_maintenance': 'Maintenance workflow scheduled successfully',
          'plan_replacement': 'Replacement planning workflow initiated'
        };

        toast.success(actionMessages[actionType] || 'Action workflow created successfully');
      }

      // Refresh the monitoring requests to reflect any status changes
      refetchRequests();
    } catch (error) {
      console.error('Error executing action:', error);
      throw error; // Re-throw to be handled by the dialog
    }
  };

  // Handle navigation to related records
  const handleNavigateToRecord = (type: 'planting' | 'tree_management', id: string) => {
    // This would typically navigate to the specific record page
    toast.info(`Navigating to ${type} record: ${id}`);
  };

  // Handle monitoring status updates from related data view
  const handleUpdateMonitoringStatus = async (status: string) => {
    if (!selectedRequest) return;

    try {
      await updateMonitoringRequest(selectedRequest.id, {
        status,
        location: selectedRequest.location,
        source_type: selectedRequest.source_type
      });
      toast.success(`Status updated to ${status}`);
      refetchRequests();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="urban-greening" />
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Environmental Monitoring Hub</h1>
          <div className="flex items-center gap-4">

          </div>
        </div>
        {/* Body Section */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">

          <Tabs defaultValue="analytics" className="mt-6">
            <TabsList className="mb-6">
              <TabsTrigger value="analytics" className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics & Charts
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center">
                <Map className="w-4 h-4 mr-2" />
                Map View
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Data Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <MonitoringAnalytics
                requests={requests.filter((request) => {
                  let matchesSearch = true;
                  let matchesStatus = true;
                  let matchesSourceType = true;

                  if (searchTerm) {
                    matchesSearch = (
                      (request.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (request.requester_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (request.id || "").toLowerCase().includes(searchTerm.toLowerCase())
                    );
                  }

                  if (statusFilter && statusFilter !== "all") {
                    matchesStatus = request.status?.toLowerCase() === statusFilter.toLowerCase();
                  }

                  if (sourceTypeFilter && sourceTypeFilter !== "all") {
                    matchesSourceType = request.source_type === sourceTypeFilter;
                  }

                  return matchesSearch && matchesStatus && matchesSourceType;
                })}
                onTakeAction={handleTakeAction}
              />
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
              {/* Search and Filter Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Monitoring Locations</span>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                      <select
                        value={sourceTypeFilter}
                        onChange={(e) => setSourceTypeFilter(e.target.value)}
                        className="border rounded px-3 py-2"
                      >
                        <option value="all">All Sources</option>
                        {SOURCE_TYPE_OPTIONS.map(type => (
                          <option key={type} value={type}>
                            {SOURCE_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded px-3 py-2"
                      >
                        <option value="all">All Status</option>
                        {MONITORING_REQUEST_STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MapView
                    requests={requests
                      .filter((r) => typeof r.title === "string")
                      .map((r) => ({
                        ...r,
                        title: r.title as string,
                      }))
                      .filter((request) => {
                        let matchesSearch = true;
                        let matchesStatus = true;
                        let matchesSourceType = true;

                        if (searchTerm) {
                          matchesSearch = (
                            (request.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (request.requester_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (request.id || "").toLowerCase().includes(searchTerm.toLowerCase())
                          );
                        }

                        if (statusFilter && statusFilter !== "all") {
                          matchesStatus = request.status?.toLowerCase() === statusFilter.toLowerCase();
                        }

                        if (sourceTypeFilter && sourceTypeFilter !== "all") {
                          matchesSourceType = request.source_type === sourceTypeFilter;
                        }

                        return matchesSearch && matchesStatus && matchesSourceType;
                      })}
                    onSelectRequest={handleSelectRequest}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Data Table Section */}
                <div className="col-span-2">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>
                          {mode === "adding"
                            ? "New Monitoring Request"
                            : mode === "editing"
                              ? "Edit Monitoring Request"
                              : "Monitoring Requests Data"}
                        </span>
                        <div className="flex items-center gap-2">
                          {mode === "viewing" && (
                            <>
                              <Button onClick={handleOpenAddModal} size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                New Request
                              </Button>
                              <Input
                                placeholder="Search requests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-48"
                              />
                              <select
                                value={sourceTypeFilter}
                                onChange={(e) => setSourceTypeFilter(e.target.value)}
                                className="border rounded px-3 py-2 text-sm"
                              >
                                <option value="all">All Sources</option>
                                {SOURCE_TYPE_OPTIONS.map(type => (
                                  <option key={type} value={type}>
                                    {SOURCE_TYPE_LABELS[type]}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border rounded px-3 py-2 text-sm"
                              >
                                <option value="all">All Status</option>
                                {MONITORING_REQUEST_STATUS_OPTIONS.map(status => (
                                  <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mode === "adding" || mode === "editing" ? (
                        <MonitoringRequestForm
                          mode={mode}
                          initialValues={
                            mode === "editing" && selectedRequest
                              ? {
                                ...selectedRequest,
                                date: new Date(selectedRequest.date),
                                status: selectedRequest.status
                              }
                              : {}
                          }
                          location={formLocation || { lat: 0, lng: 0 }}
                          onLocationChange={setFormLocation}
                          onSave={handleSaveRequest}
                          onCancel={handleCancel}
                        />
                      ) : (
                        <MonitoringRequestsTable
                          requests={requests.filter((request) => {
                            let matchesSearch = true;
                            let matchesStatus = true;
                            let matchesSourceType = true;

                            if (searchTerm) {
                              matchesSearch = (
                                (request.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (request.id || "").toLowerCase().includes(searchTerm.toLowerCase())
                              );
                            }

                            if (statusFilter && statusFilter !== "all") {
                              matchesStatus = request.status?.toLowerCase() === statusFilter.toLowerCase();
                            }

                            if (sourceTypeFilter && sourceTypeFilter !== "all") {
                              matchesSourceType = request.source_type === sourceTypeFilter;
                            }

                            return matchesSearch && matchesStatus && matchesSourceType;
                          })}
                          selectedRequestId={selectedRequestId}
                          onSelectRequest={handleSelectRequest}
                          searchTerm={searchTerm}
                          onSearchTermChange={setSearchTerm}
                          statusFilter={statusFilter}
                          onStatusFilterChange={setStatusFilter}
                          onEdit={handleOpenEditModal}
                          onDelete={handleOpenDeleteModal}
                          onUpdateSourceType={handleUpdateSourceType}
                          onUpdateTitle={handleUpdateTitle}
                          getStatusColor={getStatusColor}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar - Related Data or Details */}
                <div className="col-span-1">
                  {selectedRequest && mode === "viewing" ? (
                    <RelatedDataView
                      selectedRequest={selectedRequest}
                      onNavigateToRecord={handleNavigateToRecord}
                      onUpdateMonitoringStatus={handleUpdateMonitoringStatus}
                    />
                  ) : (
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <div className="text-center text-gray-500">
                          {mode === "adding" || mode === "editing"
                            ? "Complete the form to see related data"
                            : "Select a monitoring request from the table to view details and related environmental data"
                          }
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Action Workflow Dialog */}
      <ActionWorkflowDialog
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog({ isOpen: false, actionType: '', requests: [] })}
        actionType={actionDialog.actionType}
        requests={actionDialog.requests}
        onExecuteAction={handleExecuteAction}
      />

      {/* Monitoring Request Modal */}
      <MonitoringRequestModal
        isOpen={isRequestModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        initialValues={
          modalMode === "editing" && selectedRequest
            ? {
              ...selectedRequest,
              date: new Date(selectedRequest.date),
              status: selectedRequest.status
            }
            : {}
        }
        location={formLocation || { lat: 0, lng: 0 }}
        onLocationChange={setFormLocation}
        onSave={handleSaveRequest}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Monitoring Request"
        itemName={
          requestToDelete
            ? requests.find(r => r.id === requestToDelete)?.title
            : undefined
        }
      />
    </div>
  );
};

export default MonitoringRequests;
