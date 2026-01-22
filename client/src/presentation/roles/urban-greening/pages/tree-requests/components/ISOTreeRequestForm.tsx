// client/src/presentation/roles/urban-greening/pages/tree-requests/components/ISOTreeRequestForm.tsx
/**
 * ISO-Compliant Tree Request Form
 * Multi-phase form for Receiving, Inspection, Requirements, and Clearance tracking
 */

import React, { useState, useMemo } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/presentation/components/shared/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/shared/ui/tabs";
import { FileText, ClipboardCheck, CheckCircle, DollarSign, Building } from "lucide-react";
import {
  TreeRequestCreate,
  TreeRequestWithAnalytics,
  ISORequestType,
  RequirementChecklistItem,
  fetchDropdownOptions,
  fetchAllProcessingStandards,
} from "@/core/api/tree-management-request-api";
import { createTreeRequest, updateTreeRequest } from "@/core/api/tree-management-request-api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreatableCombobox, ComboboxItem } from "@/presentation/components/shared/ui/creatable-combobox";

interface ISOTreeRequestFormProps {
  mode: "add" | "edit";
  initialData?: TreeRequestWithAnalytics | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_REQUIREMENTS: string[] = [
  "Application Letter",
  "Photos",
  "Sketchmap",
  "Brgy. Endorsement Letter",
  "HOA Endorsement Letter",
  "Replacement",
  "TCT",
  "ECC"
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ISOTreeRequestForm: React.FC<ISOTreeRequestFormProps> = ({
  mode,
  initialData,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

    // Initialize form data
  const [formData, setFormData] = useState<TreeRequestCreate>(() => {
    if (mode === "edit" && initialData) {
      return {
        request_type: initialData.request_type,
        overall_status: initialData.overall_status,
        receiving_date_received: initialData.receiving_date_received,
        receiving_month: initialData.receiving_month,
        receiving_received_through: initialData.receiving_received_through,
        receiving_date_received_by_dept_head: initialData.receiving_date_received_by_dept_head,
        receiving_name: initialData.receiving_name,
        receiving_address: initialData.receiving_address,
        receiving_contact: initialData.receiving_contact,
        receiving_request_status: initialData.receiving_request_status,
        inspection_date_received_by_inspectors: initialData.inspection_date_received_by_inspectors,
        inspection_date_of_inspection: initialData.inspection_date_of_inspection,
        inspection_month: initialData.inspection_month,
        inspection_proponent_present: initialData.inspection_proponent_present,
        inspection_date_submitted_to_dept_head: initialData.inspection_date_submitted_to_dept_head,
        inspection_date_released_to_inspectors: initialData.inspection_date_released_to_inspectors,
        inspection_report_control_number: initialData.inspection_report_control_number,
        requirements_checklist: initialData.requirements_checklist || [],
        requirements_remarks: initialData.requirements_remarks,
        requirements_status: initialData.requirements_status,
        requirements_date_completion: initialData.requirements_date_completion,
        clearance_date_issued: initialData.clearance_date_issued,
        clearance_date_of_payment: initialData.clearance_date_of_payment,
        clearance_control_number: initialData.clearance_control_number,
        clearance_or_number: initialData.clearance_or_number,
        clearance_date_received: initialData.clearance_date_received,
        clearance_status: initialData.clearance_status,

        // DENR Phase
        denr_date_received_by_inspectors: initialData.denr_date_received_by_inspectors,
        denr_date_submitted_to_dept_head: initialData.denr_date_submitted_to_dept_head,
        denr_date_released_to_inspectors: initialData.denr_date_released_to_inspectors,
        denr_date_received: initialData.denr_date_received,
        denr_status: initialData.denr_status,
      };
    }
    // Initialize with default requirements checklist for new requests
    return {
      request_type: "cutting",
      overall_status: "receiving",
      requirements_checklist: DEFAULT_REQUIREMENTS.map(req => ({
        requirement_name: req,
        is_checked: false,
      })),
    };
  });

  // Fetch configured Request Types (Standards)
  const { data: standards = [] } = useQuery({
    queryKey: ["processing-standards"],
    queryFn: fetchAllProcessingStandards,
  });

  const requestTypeOptions: ComboboxItem[] = useMemo(() => {
    // Start with defaults
    const defaults = [
        { value: "cutting", label: "Tree Cutting" },
        { value: "pruning", label: "Tree Pruning" },
        { value: "ball_out", label: "Tree Ball-out" },
    ];
    // Map standards to items
    const fromStandards = standards.map(s => ({ value: s.request_type, label: s.request_type }));
    // Merge unique by value
    const map = new Map();
    defaults.forEach(i => map.set(i.value, i));
    fromStandards.forEach(i => map.set(i.value, i));
    return Array.from(map.values());
  }, [standards]);

  // Fetch dropdown options for each phase
  const { data: receivedThroughOptions = [] } = useQuery({
    queryKey: ["dropdown-options", "received_through"],
    queryFn: () => fetchDropdownOptions("received_through"),
  });

  const { data: statusReceiving = [] } = useQuery({
    queryKey: ["dropdown-options", "status_receiving"],
    queryFn: () => fetchDropdownOptions("status_receiving"),
  });

  const { data: statusRequirements = [] } = useQuery({
    queryKey: ["dropdown-options", "status_requirements"],
    queryFn: () => fetchDropdownOptions("status_requirements"),
  });

  const { data: statusClearance = [] } = useQuery({
    queryKey: ["dropdown-options", "status_clearance"],
    queryFn: () => fetchDropdownOptions("status_clearance"),
  });

  const { data: statusDenr = [] } = useQuery({
    queryKey: ["dropdown-options", "status_denr"],
    queryFn: () => fetchDropdownOptions("status_denr"),
  });

  // Helper to convert options to items
  const toItems = (opts: any[]) => opts.map(o => ({ value: o.option_value, label: o.option_value }));

  const receivedThroughItems = toItems(receivedThroughOptions);
  const statusReceivingItems = toItems(statusReceiving);
  const statusRequirementsItems = toItems(statusRequirements);
  const statusClearanceItems = toItems(statusClearance);
  const statusDenrItems = toItems(statusDenr);
  
  const [activeTab, setActiveTab] = useState<string>("receiving");

  // Mutations
  const createMutation = useMutation({
    mutationFn: createTreeRequest,
    onSuccess: (newRequest) => {
      // Add the new request to the cache
      queryClient.setQueryData<TreeRequestWithAnalytics[]>(
        ["tree-requests", "all", "all"],
        (old = []) => [newRequest, ...old]
      );
      toast.success("Tree request created successfully");
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Failed to create request: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TreeRequestCreate> }) =>
      updateTreeRequest(id, data),
    onSuccess: (updatedRequest) => {
      // Update the specific request in the cache
      queryClient.setQueryData<TreeRequestWithAnalytics[]>(
        ["tree-requests", "all", "all"],
        (old = []) => old.map(req => req.id === updatedRequest.id ? updatedRequest : req)
      );
      toast.success("Tree request updated successfully");
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Failed to update request: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.request_type) {
      toast.error("Please select a request type");
      return;
    }

    if (mode === "add") {
      createMutation.mutate(formData);
    } else if (initialData) {
      updateMutation.mutate({ id: initialData.id, data: formData });
    }
  };

  const handleInputChange = (field: keyof TreeRequestCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper to get month name from date string
  const getMonthFromDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    return months[date.getMonth()];
  };

  // Auto-update receiving_month when receiving_date_received changes
  const handleReceivingDateChange = (dateString: string) => {
    handleInputChange('receiving_date_received', dateString);
    if (dateString) {
      handleInputChange('receiving_month', getMonthFromDate(dateString));
    }
  };

  // Auto-update inspection_month when inspection_date_of_inspection changes
  const handleInspectionDateChange = (dateString: string) => {
    handleInputChange('inspection_date_of_inspection', dateString);
    if (dateString) {
      handleInputChange('inspection_month', getMonthFromDate(dateString));
    }
  };

  const handleRequirementChange = (index: number, checked: boolean) => {
    const newChecklist = [...(formData.requirements_checklist || [])];
    const today = new Date().toISOString().split('T')[0];
    newChecklist[index] = {
      ...newChecklist[index],
      is_checked: checked,
      date_submitted: checked ? today : undefined,
    };
    handleInputChange('requirements_checklist', newChecklist);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 rounded-2xl border-none max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="bg-[#0033a0] px-6 py-5 m-0 border-none shrink-0">
          <DialogTitle className="text-xl font-bold text-white">
            {mode === "add" ? "Create New Tree Request" : "Edit Tree Request"}
          </DialogTitle>
        </DialogHeader>

        <form id="tree-request-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Request Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Request Type *</Label>
            <CreatableCombobox
              items={requestTypeOptions}
              value={formData.request_type}
              onChange={(value) => handleInputChange('request_type', value as ISORequestType)}
              placeholder="Select or enter request type"
              emptyMessage="No request type found."
              disabled={mode === "edit"}
            />
          </div>

          {/* Multi-phase Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="receiving" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Receiving
              </TabsTrigger>
              <TabsTrigger value="inspection" className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Inspection
              </TabsTrigger>
              <TabsTrigger value="requirements" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Requirements
              </TabsTrigger>
              <TabsTrigger value="clearance" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Clearance
              </TabsTrigger>
              <TabsTrigger value="denr" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                DENR
              </TabsTrigger>
            </TabsList>

            {/* Phase 1: Receiving */}
            <TabsContent value="receiving" className="space-y-4 mt-4">
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Phase 1: Receiving</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date Received</Label>
                      <Input
                        type="date"
                        className="rounded-lg"
                        value={formData.receiving_date_received || ""}
                        onChange={(e) => handleReceivingDateChange(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Month</Label>
                      <Select
                        value={formData.receiving_month || ""}
                        onValueChange={(value) => handleInputChange('receiving_month', value)}
                      >
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Received Through</Label>
                    <CreatableCombobox
                      items={receivedThroughItems}
                      value={formData.receiving_received_through || ""}
                      onChange={(value) => handleInputChange('receiving_received_through', value)}
                      placeholder="Select or enter option"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date Received by Dept. Head</Label>
                    <Input
                      type="date"
                      className="rounded-lg"
                      value={formData.receiving_date_received_by_dept_head || ""}
                      onChange={(e) => handleInputChange('receiving_date_received_by_dept_head', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Name</Label>
                    <Input
                      className="rounded-lg"
                      value={formData.receiving_name || ""}
                      onChange={(e) => handleInputChange('receiving_name', e.target.value)}
                      placeholder="Requester name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Address</Label>
                    <Textarea
                      className="rounded-lg"
                      value={formData.receiving_address || ""}
                      onChange={(e) => handleInputChange('receiving_address', e.target.value)}
                      placeholder="Property address"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Contact Number / Email</Label>
                    <Input
                      className="rounded-lg"
                      value={formData.receiving_contact || ""}
                      onChange={(e) => handleInputChange('receiving_contact', e.target.value)}
                      placeholder="Contact information"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status of Request</Label>
                    <CreatableCombobox
                      items={statusReceivingItems}
                      value={formData.receiving_request_status || ""}
                      onChange={(value) => handleInputChange('receiving_request_status', value)}
                      placeholder="Select or enter status"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Phase 2: Inspection */}
            <TabsContent value="inspection" className="space-y-4 mt-4">
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Phase 2: Inspection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date Received by Inspectors (Request Letter)</Label>
                      <Input
                        type="date"
                        className="rounded-lg"
                        value={formData.inspection_date_received_by_inspectors || ""}
                        onChange={(e) => handleInputChange('inspection_date_received_by_inspectors', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date of Inspection</Label>
                      <Input
                        type="date"
                        className="rounded-lg"
                        value={formData.inspection_date_of_inspection || ""}
                        onChange={(e) => handleInspectionDateChange(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Month</Label>
                    <Select
                      value={formData.inspection_month || ""}
                      onValueChange={(value) => handleInputChange('inspection_month', value)}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Name of Proponent Present (during inspection)</Label>
                    <Input
                      className="rounded-lg"
                      value={formData.inspection_proponent_present || ""}
                      onChange={(e) => handleInputChange('inspection_proponent_present', e.target.value)}
                      placeholder="Person present during inspection"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date Submitted to Dept. Head (Inspection Report)</Label>
                      <Input
                        type="date"
                        className="rounded-lg"
                        value={formData.inspection_date_submitted_to_dept_head || ""}
                        onChange={(e) => handleInputChange('inspection_date_submitted_to_dept_head', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date Released to Inspectors (Inspection Report)</Label>
                      <Input
                        type="date"
                        className="rounded-lg"
                        value={formData.inspection_date_released_to_inspectors || ""}
                        onChange={(e) => handleInputChange('inspection_date_released_to_inspectors', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Inspection Report Control Number</Label>
                    <Input
                      className="rounded-lg"
                      value={formData.inspection_report_control_number || ""}
                      onChange={(e) => handleInputChange('inspection_report_control_number', e.target.value)}
                      placeholder="Control number"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Phase 3: Requirements */}
            <TabsContent value="requirements" className="space-y-4 mt-4">
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Phase 3: Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium mb-3 block">Requirements Checklist</Label>
                    <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                      {(formData.requirements_checklist || []).map((item, index) => (
                        <div key={index} className="flex items-start space-x-3 p-2 hover:bg-white rounded transition-colors">
                          <Checkbox
                            id={`req-${index}`}
                            checked={item.is_checked}
                            onCheckedChange={(checked) => handleRequirementChange(index, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`req-${index}`} className="cursor-pointer font-normal">
                              {item.requirement_name}
                            </Label>
                            {item.date_submitted && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Submitted: {new Date(item.date_submitted).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Remarks and Recommendations</Label>
                    <Textarea
                      className="rounded-lg"
                      value={formData.requirements_remarks || ""}
                      onChange={(e) => handleInputChange('requirements_remarks', e.target.value)}
                      placeholder="Enter remarks and recommendations"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <CreatableCombobox
                      items={statusRequirementsItems}
                      value={formData.requirements_status || ""}
                      onChange={(value) => handleInputChange('requirements_status', value)}
                      placeholder="Select or enter status"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date of Completion Requirements</Label>
                    <Input
                      type="date"
                      className="rounded-lg"
                      value={formData.requirements_date_completion || ""}
                      onChange={(e) => handleInputChange('requirements_date_completion', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Phase 4: Clearance */}
            <TabsContent value="clearance" className="space-y-4 mt-4">
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Phase 4: Clearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date Issued</Label>
                      <Input
                        type="date"
                        className="rounded-lg"
                        value={formData.clearance_date_issued || ""}
                        onChange={(e) => handleInputChange('clearance_date_issued', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date of Payment</Label>
                      <Input
                        type="date"
                        className="rounded-lg"
                        value={formData.clearance_date_of_payment || ""}
                        onChange={(e) => handleInputChange('clearance_date_of_payment', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Clearance Control No.</Label>
                    <Input
                      className="rounded-lg"
                      value={formData.clearance_control_number || ""}
                      onChange={(e) => handleInputChange('clearance_control_number', e.target.value)}
                      placeholder="Control number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">OR Number</Label>
                    <Input
                      className="rounded-lg"
                      value={formData.clearance_or_number || ""}
                      onChange={(e) => handleInputChange('clearance_or_number', e.target.value)}
                      placeholder="Official receipt number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date Received</Label>
                    <Input
                      type="date"
                      className="rounded-lg"
                      value={formData.clearance_date_received || ""}
                      onChange={(e) => handleInputChange('clearance_date_received', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <CreatableCombobox
                      items={statusClearanceItems}
                      value={formData.clearance_status || ""}
                      onChange={(value) => handleInputChange('clearance_status', value)}
                      placeholder="Select or enter status"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Phase 5: DENR */}
            <TabsContent value="denr" className="space-y-4 mt-4">
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Phase 5: DENR</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date Received by Inspectors</Label>
                      <Input
                        type="date"
                        className="rounded-lg"
                        value={formData.denr_date_received_by_inspectors || ""}
                        onChange={(e) => handleInputChange('denr_date_received_by_inspectors', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date Submitted to Dept. Head</Label>
                      <Input
                        type="date"
                        className="rounded-lg"
                        value={formData.denr_date_submitted_to_dept_head || ""}
                        onChange={(e) => handleInputChange('denr_date_submitted_to_dept_head', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <Label className="text-sm font-medium">Date Released to Inspectors</Label>
                      <Input
                        type="date"
                        className="rounded-lg"
                        value={formData.denr_date_released_to_inspectors || ""}
                        onChange={(e) => handleInputChange('denr_date_released_to_inspectors', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date Received</Label>
                      <Input
                        type="date"
                        className="rounded-lg"
                        value={formData.denr_date_received || ""}
                        onChange={(e) => handleInputChange('denr_date_received', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <CreatableCombobox
                      items={statusDenrItems}
                      value={formData.denr_status || ""}
                      onChange={(value) => handleInputChange('denr_status', value)}
                      placeholder="Select or enter status"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>

        <DialogFooter className="px-6 py-4 bg-gray-50 border-t shrink-0">
          <Button type="button" variant="outline" className="rounded-lg" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="tree-request-form" className="rounded-lg bg-[#0033a0] hover:bg-[#002a80]" disabled={isLoading}>
            {isLoading ? "Saving..." : mode === "add" ? "Create Request" : "Update Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ISOTreeRequestForm;
