// client/src/presentation/roles/urban-greening/pages/tree-requests/components/ISOTreeRequestDetails.tsx
/**
 * ISO Tree Request Details with Inline Editing
 */

import React, { useState, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Label } from "@/presentation/components/shared/ui/label";
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import { useUser } from "@/core/api/admin-api";
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
} from "@/presentation/components/shared/ui/dialog";
import { 
  TreeRequestWithAnalytics, 
  TreeRequestCreate,
  ISORequestType,
  updateTreeRequest,
  fetchDropdownOptions,
} from "@/core/api/tree-management-request-api";
import { 
  FileText, 
  ClipboardCheck, 
  CheckCircle, 
  DollarSign, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Copy
} from "lucide-react";
import { cn } from "@/core/utils/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { calculateTreeRequestDays } from "@/core/utils/tree-request-utils";

// ==================== Constants ====================

const REQUEST_TYPES: { value: ISORequestType; label: string }[] = [
  { value: "cutting", label: "Tree Cutting" },
  { value: "pruning", label: "Tree Pruning" },
  { value: "ball_out", label: "Tree Ball-out" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// ==================== Sub-components ====================

interface UserDisplayProps {
  userId: string;
  label?: string;
  variant?: "outline" | "secondary";
}

const UserDisplay: React.FC<UserDisplayProps> = ({ userId, label, variant = "outline" }) => {
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        {label && <span className="text-sm text-muted-foreground">{label}:</span>}
        <Badge variant={variant} className="text-xs">Loading...</Badge>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        {label && <span className="text-sm text-muted-foreground">{label}:</span>}
        <Badge variant={variant} className="text-xs">Unknown User</Badge>
      </div>
    );
  }

  const displayName = user.profile?.first_name && user.profile?.last_name
    ? `${user.profile.first_name} ${user.profile.last_name}`
    : user.email;

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-muted-foreground">{label}:</span>}
      <Badge variant={variant} className="text-xs">
        {displayName}
      </Badge>
      {user.profile?.first_name && user.profile?.last_name && (
        <span className="text-xs text-muted-foreground">({user.email})</span>
      )}
    </div>
  );
};

interface FieldRendererProps {
  label: string;
  fieldKey: string;
  value: any;
  fieldState?: 'idle' | 'saving' | 'saved' | 'error';
  type?: 'text' | 'date' | 'select' | 'textarea';
  options?: any[];
  onChange: (field: any, value: any) => void;
}

const FieldRenderer = React.memo(({
  label,
  fieldKey,
  value,
  fieldState = 'idle',
  type = 'text',
  options,
  onChange
}: FieldRendererProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        {fieldState === 'saved' && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            SAVED
          </span>
        )}
        {fieldState === 'saving' && (
          <span className="text-xs text-blue-600 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </span>
        )}
      </div>
      {type === 'select' && options ? (
        <Select
          value={value?.toString() || ""}
          onValueChange={(val) => onChange(fieldKey, val)}
        >
          <SelectTrigger className="h-8 rounded-lg">
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={typeof opt === 'string' ? opt : opt.id} value={typeof opt === 'string' ? opt : opt.option_value}>
                {typeof opt === 'string' ? opt : opt.option_value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === 'textarea' ? (
        <Textarea
          value={value?.toString() || ""}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          onBlur={(e) => onChange(fieldKey, e.target.value)}
          className="min-h-[60px] rounded-lg"
        />
      ) : (
        <Input
          type={type}
          value={value?.toString() || ""}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          className="h-8 rounded-lg"
        />
      )}
    </div>
  );
});

FieldRenderer.displayName = "FieldRenderer";

// ==================== Main Component ====================

interface ISOTreeRequestDetailsProps {
  request: TreeRequestWithAnalytics;
  onClose: () => void;
  onUpdate: () => void;
}

const ISOTreeRequestDetails: React.FC<ISOTreeRequestDetailsProps> = React.memo(({
  request,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [editedData, setEditedData] = useState<Partial<TreeRequestCreate>>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [fieldSaveStates, setFieldSaveStates] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});
  const [optimisticData, setOptimisticData] = useState<TreeRequestWithAnalytics>(request);

  // Calculate days in realtime using frontend logic for instant updates
  const calculatedDays = useMemo(() => {
    return calculateTreeRequestDays(optimisticData);
  }, [optimisticData]);

  // Use longer staleTime to prevent unnecessary background refetches on every open
  const { data: receivedThroughOptions = [] } = useQuery({
    queryKey: ["dropdown-options", "received_through"],
    queryFn: () => fetchDropdownOptions("received_through"),
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  const { data: statusOptions = [] } = useQuery({
    queryKey: ["dropdown-options", "status"],
    queryFn: () => fetchDropdownOptions("status"),
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<TreeRequestCreate>) => updateTreeRequest(request.id, data),
    onMutate: async (updates) => {
      const updatingFields = Object.keys(updates);
      setFieldSaveStates(prev => {
        const newStates = { ...prev };
        updatingFields.forEach(field => { newStates[field] = 'saving'; });
        return newStates;
      });
      
      // Cancel outgoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ["tree-requests"] });
      
      const updatedData = { ...updates };
      if (updatedData.clearance_status && updatedData.clearance_status !== 'pending') {
        updatedData.overall_status = 'clearance';
      } else if (updatedData.requirements_status && updatedData.requirements_status !== 'pending') {
        updatedData.overall_status = 'requirements';
      } else if (updatedData.inspection_date_of_inspection) {
        updatedData.overall_status = 'inspection';
      } else if (updatedData.receiving_date_received) {
        updatedData.overall_status = 'receiving';
      }
      
      // Update local optimistic state for instant UI feedback
      setOptimisticData(prev => ({ ...prev, ...updatedData }));
      setSaveState('saving');
      
      return { updatingFields };
    },
    onSuccess: (updatedRequest, _variables, context) => {
      // Update local optimistic state
      setOptimisticData(updatedRequest);
      setSaveState('saved');
      
      // Invalidate all tree-requests queries to ensure parent component refetches with latest data
      queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
      
      if (context?.updatingFields) {
        setFieldSaveStates(prev => {
          const newStates = { ...prev };
          context.updatingFields.forEach(field => { newStates[field] = 'saved'; });
          return newStates;
        });
        
        setTimeout(() => {
          setFieldSaveStates(prev => {
            const newStates = { ...prev };
            context.updatingFields.forEach(field => { newStates[field] = 'idle'; });
            return newStates;
          });
        }, 3000);
      }
      
      setTimeout(() => setSaveState('idle'), 2000);
    },
    onError: (error: any, _variables, context) => {
      setSaveState('error');
      
      if (context?.updatingFields) {
        setFieldSaveStates(prev => {
          const newStates = { ...prev };
          context.updatingFields.forEach(field => { newStates[field] = 'error'; });
          return newStates;
        });
        
        setTimeout(() => {
          setFieldSaveStates(prev => {
            const newStates = { ...prev };
            context.updatingFields.forEach(field => { newStates[field] = 'idle'; });
            return newStates;
          });
        }, 3000);
      }
      
      toast.error(`Failed to save: ${error.message}`);
      setTimeout(() => setSaveState('idle'), 3000);
      
      // Refetch to ensure we have latest server data after error
      queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
    },
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback((updates: Partial<TreeRequestCreate>) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSaveState('idle'); 
    debounceTimerRef.current = setTimeout(() => {
      updateMutation.mutate(updates);
    }, 500); 
  }, [updateMutation]);

  const handleInputChange = useCallback((field: keyof TreeRequestCreate, value: any) => {
    // Convert empty strings to null for date fields to avoid backend validation errors
    const processedValue = value === "" ? null : value;
    const updates = { [field]: processedValue };
    
    // Update optimistic data immediately for visual feedback (including clearing dates)
    setOptimisticData(prev => ({ ...prev, [field]: processedValue }));
    
    setEditedData(prev => ({ ...prev, ...updates }));
    debouncedSave(updates);
  }, [debouncedSave]);

  const handleRequirementChange = useCallback((index: number, field: 'is_checked' | 'date_submitted', value: any) => {
    setOptimisticData(prev => {
        const updatedChecklist = [...(prev.requirements_checklist || [])];
        const currentItem = updatedChecklist[index];

        if (field === 'is_checked' && value === true) {
            updatedChecklist[index] = {
                ...currentItem,
                is_checked: true,
                date_submitted: new Date().toISOString().split('T')[0],
            };
        } else {
            updatedChecklist[index] = {
                ...currentItem,
                [field]: field === 'date_submitted' ? (value || null) : value,
            };
        }
        
        // This is safe because we're returning the new state. 
        // We need to trigger the side effect (saving) separately though.
        // But doing side effects in setState is risky.
        // Let's use a temporary calculation.
        return prev;
    });

    setOptimisticData(currentPrev => {
        const updatedChecklist = [...(currentPrev.requirements_checklist || [])];
        const currentItem = updatedChecklist[index];
        
        if (field === 'is_checked' && value === true) {
            updatedChecklist[index] = {
                ...currentItem,
                is_checked: true,
                date_submitted: new Date().toISOString().split('T')[0],
            };
        } else {
            updatedChecklist[index] = {
                ...currentItem,
                [field]: field === 'date_submitted' ? (value || null) : value,
            };
        }
        
        const updates = { requirements_checklist: updatedChecklist };
        setEditedData(prev => ({ ...prev, ...updates }));
        debouncedSave(updates);
        return { ...currentPrev, ...updates };
    });
  }, [debouncedSave]);

  const getValue = useCallback((field: keyof TreeRequestCreate) => {
    return (optimisticData as any)[field] ?? (editedData as any)[field] ?? (request as any)[field];
  }, [optimisticData, editedData, request]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "receiving": return "bg-blue-500";
      case "inspection": return "bg-purple-500";
      case "requirements": return "bg-yellow-500";
      case "clearance": return "bg-orange-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDelayColor = (days: number, standardDays?: number) => {
    if (!standardDays) return "text-gray-600";
    if (days > standardDays) return "text-red-600 font-semibold";
    if (days > standardDays * 0.8) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] rounded-2xl flex flex-col">
        <DialogHeader className="pb-4 border-b px-6 pt-6 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                Request #{request.request_number}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                {request.is_delayed && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Delayed
                  </Badge>
                )}
                {saveState === 'saving' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </div>
                )}
                {saveState === 'saved' && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Saved
                  </div>
                )}
                {saveState === 'error' && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Error
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-lg"
              onClick={() => {
                  const formatDate = (date: any) => date ? new Date(date).toLocaleDateString() : "—";
                  const data = `TREE REQUEST DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Request Number: ${request.request_number}
Request Type: ${REQUEST_TYPES.find(t => t.value === request.request_type)?.label || request.request_type}
Current Phase: ${request.overall_status}
Status: ${request.is_delayed ? '⚠️ DELAYED' : '✓ On Track'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECEIVING PHASE (${calculatedDays.days_in_receiving} days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date Received: ${formatDate(request.receiving_date_received)}
Month: ${request.receiving_month || "—"}
Received Through: ${request.receiving_received_through || "—"}
Date Received by Dept. Head: ${formatDate(request.receiving_date_received_by_dept_head)}
Name: ${request.receiving_name || "—"}
Address: ${request.receiving_address || "—"}
Contact: ${request.receiving_contact || "—"}
Status: ${request.receiving_request_status || "—"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSPECTION PHASE (${calculatedDays.days_in_inspection} days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date Received by Inspectors: ${formatDate(request.inspection_date_received_by_inspectors)}
Date of Inspection: ${formatDate(request.inspection_date_of_inspection)}
Month: ${request.inspection_month || "—"}
Proponent Present: ${request.inspection_proponent_present || "—"}
Date Submitted to Dept. Head: ${formatDate(request.inspection_date_submitted_to_dept_head)}
Date Released to Inspectors: ${formatDate(request.inspection_date_released_to_inspectors)}
Report Control Number: ${request.inspection_report_control_number || "—"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIREMENTS PHASE (${calculatedDays.days_in_requirements} days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Remarks: ${request.requirements_remarks || "—"}
Status: ${request.requirements_status || "—"}
Date of Completion: ${formatDate(request.requirements_date_completion)}

Checklist:
${(request.requirements_checklist || []).map(item => `  ${item.is_checked ? '☑' : '☐'} ${item.requirement_name} ${item.date_submitted ? `(${formatDate(item.date_submitted)})` : ''}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLEARANCE PHASE (${calculatedDays.days_in_clearance} days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date Issued: ${formatDate(request.clearance_date_issued)}
Date of Payment: ${formatDate(request.clearance_date_of_payment)}
Control Number: ${request.clearance_control_number || "—"}
OR Number: ${request.clearance_or_number || "—"}
Date Received: ${formatDate(request.clearance_date_received)}
Status: ${request.clearance_status || "—"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Processing Days: ${calculatedDays.total_days}
Receiving: ${calculatedDays.days_in_receiving} days (Standard: ${request.receiving_standard_days || 'N/A'})
Inspection: ${calculatedDays.days_in_inspection} days (Standard: ${request.inspection_standard_days || 'N/A'})
Requirements: ${calculatedDays.days_in_requirements} days (Standard: ${request.requirements_standard_days || 'N/A'})
Clearance: ${calculatedDays.days_in_clearance} days (Standard: ${request.clearance_standard_days || 'N/A'})

Created: ${new Date(request.created_at).toLocaleString()}
Last Updated: ${request.updated_at ? new Date(request.updated_at).toLocaleString() : '—'}`;
                  navigator.clipboard.writeText(data);
                  toast.success("Request details copied to clipboard");
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Details
              </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Request Type</Label>
                    {fieldSaveStates['request_type'] === 'saved' && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        SAVED
                      </span>
                    )}
                  </div>
                  <Select
                    value={getValue('request_type')?.toString() || ""}
                    onValueChange={(value) => handleInputChange('request_type', value)}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REQUEST_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Current Phase</Label>
                  <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                    <Badge className={cn("capitalize", getStatusColor(getValue('overall_status')?.toString() || request.overall_status))}>
                      {getValue('overall_status') || request.overall_status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Processing Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Phase 1: Receiving */}
                <div className="relative">
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                  <div className="flex gap-4">
                    <div className={cn(
                      "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2",
                      request.overall_status === "receiving" || request.receiving_date_received 
                        ? "bg-blue-500 border-blue-500 text-white" 
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    )}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">Receiving</h3>
                        {calculatedDays.days_in_receiving > 0 && (
                          <div className={cn("text-sm", getDelayColor(calculatedDays.days_in_receiving, request.receiving_standard_days))}>
                            {calculatedDays.days_in_receiving} days
                            {request.receiving_standard_days && calculatedDays.days_in_receiving > request.receiving_standard_days && (
                              <span className="ml-1">({calculatedDays.days_in_receiving - request.receiving_standard_days} over)</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <FieldRenderer label="Date Received" fieldKey="receiving_date_received" type="date" value={getValue("receiving_date_received")} onChange={handleInputChange} fieldState={fieldSaveStates["receiving_date_received"]} />
                        <FieldRenderer label="Month" fieldKey="receiving_month" type="select" options={MONTHS} value={getValue("receiving_month")} onChange={handleInputChange} fieldState={fieldSaveStates["receiving_month"]} />
                        <FieldRenderer label="Received Through" fieldKey="receiving_received_through" type="select" options={receivedThroughOptions} value={getValue("receiving_received_through")} onChange={handleInputChange} fieldState={fieldSaveStates["receiving_received_through"]} />
                        <FieldRenderer label="Date Received by Dept. Head" fieldKey="receiving_date_received_by_dept_head" type="date" value={getValue("receiving_date_received_by_dept_head")} onChange={handleInputChange} fieldState={fieldSaveStates["receiving_date_received_by_dept_head"]} />
                        <FieldRenderer label="Name" fieldKey="receiving_name" type="text" value={getValue("receiving_name")} onChange={handleInputChange} fieldState={fieldSaveStates["receiving_name"]} />
                        <FieldRenderer label="Address" fieldKey="receiving_address" type="text" value={getValue("receiving_address")} onChange={handleInputChange} fieldState={fieldSaveStates["receiving_address"]} />
                        <FieldRenderer label="Contact" fieldKey="receiving_contact" type="text" value={getValue("receiving_contact")} onChange={handleInputChange} fieldState={fieldSaveStates["receiving_contact"]} />
                        <FieldRenderer label="Status" fieldKey="receiving_request_status" type="select" options={statusOptions} value={getValue("receiving_request_status")} onChange={handleInputChange} fieldState={fieldSaveStates["receiving_request_status"]} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 2: Inspection */}
                <div className="relative">
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                  <div className="flex gap-4">
                    <div className={cn(
                      "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2",
                      request.overall_status === "inspection" || request.inspection_date_received_by_inspectors 
                        ? "bg-purple-500 border-purple-500 text-white" 
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    )}>
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">Inspection</h3>
                        {calculatedDays.days_in_inspection > 0 && (
                          <div className={cn("text-sm", getDelayColor(calculatedDays.days_in_inspection, request.inspection_standard_days))}>
                            {calculatedDays.days_in_inspection} days
                            {request.inspection_standard_days && calculatedDays.days_in_inspection > request.inspection_standard_days && (
                              <span className="ml-1">({calculatedDays.days_in_inspection - request.inspection_standard_days} over)</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <FieldRenderer label="Date Received by Inspectors" fieldKey="inspection_date_received_by_inspectors" type="date" value={getValue("inspection_date_received_by_inspectors")} onChange={handleInputChange} fieldState={fieldSaveStates["inspection_date_received_by_inspectors"]} />
                        <FieldRenderer label="Date of Inspection" fieldKey="inspection_date_of_inspection" type="date" value={getValue("inspection_date_of_inspection")} onChange={handleInputChange} fieldState={fieldSaveStates["inspection_date_of_inspection"]} />
                        <FieldRenderer label="Month" fieldKey="inspection_month" type="select" options={MONTHS} value={getValue("inspection_month")} onChange={handleInputChange} fieldState={fieldSaveStates["inspection_month"]} />
                        <FieldRenderer label="Proponent Present" fieldKey="inspection_proponent_present" type="text" value={getValue("inspection_proponent_present")} onChange={handleInputChange} fieldState={fieldSaveStates["inspection_proponent_present"]} />
                        <FieldRenderer label="Date Submitted to Dept. Head" fieldKey="inspection_date_submitted_to_dept_head" type="date" value={getValue("inspection_date_submitted_to_dept_head")} onChange={handleInputChange} fieldState={fieldSaveStates["inspection_date_submitted_to_dept_head"]} />
                        <FieldRenderer label="Date Released to Inspectors" fieldKey="inspection_date_released_to_inspectors" type="date" value={getValue("inspection_date_released_to_inspectors")} onChange={handleInputChange} fieldState={fieldSaveStates["inspection_date_released_to_inspectors"]} />
                        <FieldRenderer label="Report Control Number" fieldKey="inspection_report_control_number" type="text" value={getValue("inspection_report_control_number")} onChange={handleInputChange} fieldState={fieldSaveStates["inspection_report_control_number"]} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 3: Requirements */}
                <div className="relative">
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                  <div className="flex gap-4">
                    <div className={cn(
                      "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2",
                      request.overall_status === "requirements" || request.requirements_date_completion
                        ? "bg-yellow-500 border-yellow-500 text-white" 
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    )}>
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">Requirements</h3>
                        {calculatedDays.days_in_requirements > 0 && (
                          <div className={cn("text-sm", getDelayColor(calculatedDays.days_in_requirements, request.requirements_standard_days))}>
                            {calculatedDays.days_in_requirements} days
                            {request.requirements_standard_days && calculatedDays.days_in_requirements > request.requirements_standard_days && (
                              <span className="ml-1">({calculatedDays.days_in_requirements - request.requirements_standard_days} over)</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-3">
                        <FieldRenderer label="Remarks" fieldKey="requirements_remarks" type="textarea" value={getValue("requirements_remarks")} onChange={handleInputChange} fieldState={fieldSaveStates["requirements_remarks"]} />
                        <FieldRenderer label="Status" fieldKey="requirements_status" type="select" options={statusOptions} value={getValue("requirements_status")} onChange={handleInputChange} fieldState={fieldSaveStates["requirements_status"]} />
                        <FieldRenderer label="Date of Completion" fieldKey="requirements_date_completion" type="date" value={getValue("requirements_date_completion")} onChange={handleInputChange} fieldState={fieldSaveStates["requirements_date_completion"]} />
                      </div>
                      
                      {/* Requirements Checklist */}
                      {(request.requirements_checklist?.length ?? 0) > 0 && (
                        <div className="border-t pt-3">
                          <div className="text-sm font-medium mb-2">Requirements Checklist:</div>
                          <div className="space-y-2">
                            {(optimisticData.requirements_checklist || []).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={item.is_checked}
                                  onCheckedChange={(checked) => handleRequirementChange(idx, 'is_checked', checked)}
                                />
                                <span className={cn("flex-1", item.is_checked ? "line-through text-muted-foreground" : "")}>
                                  {item.requirement_name}
                                </span>
                                <Input
                                  type="date"
                                  value={item.date_submitted || ""}
                                  onChange={(e) => handleRequirementChange(idx, 'date_submitted', e.target.value)}
                                  className="h-7 text-xs w-36"
                                  placeholder="Date submitted"
                                />
                                {fieldSaveStates['requirements_checklist'] === 'saving' && (
                                  <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                                )}
                                {fieldSaveStates['requirements_checklist'] === 'saved' && (
                                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phase 4: Clearance */}
                <div className="relative">
                  <div className="flex gap-4">
                    <div className={cn(
                      "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2",
                      request.overall_status === "clearance" || request.clearance_date_issued
                        ? "bg-orange-500 border-orange-500 text-white" 
                        : request.overall_status === "completed"
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    )}>
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">Clearance</h3>
                        {calculatedDays.days_in_clearance > 0 && (
                          <div className={cn("text-sm", getDelayColor(calculatedDays.days_in_clearance, request.clearance_standard_days))}>
                            {calculatedDays.days_in_clearance} days
                            {request.clearance_standard_days && calculatedDays.days_in_clearance > request.clearance_standard_days && (
                              <span className="ml-1">({calculatedDays.days_in_clearance - request.clearance_standard_days} over)</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <FieldRenderer label="Date Issued" fieldKey="clearance_date_issued" type="date" value={getValue("clearance_date_issued")} onChange={handleInputChange} fieldState={fieldSaveStates["clearance_date_issued"]} />
                        <FieldRenderer label="Date of Payment" fieldKey="clearance_date_of_payment" type="date" value={getValue("clearance_date_of_payment")} onChange={handleInputChange} fieldState={fieldSaveStates["clearance_date_of_payment"]} />
                        <FieldRenderer label="Control Number" fieldKey="clearance_control_number" type="text" value={getValue("clearance_control_number")} onChange={handleInputChange} fieldState={fieldSaveStates["clearance_control_number"]} />
                        <FieldRenderer label="OR Number" fieldKey="clearance_or_number" type="text" value={getValue("clearance_or_number")} onChange={handleInputChange} fieldState={fieldSaveStates["clearance_or_number"]} />
                        <FieldRenderer label="Date Received" fieldKey="clearance_date_received" type="date" value={getValue("clearance_date_received")} onChange={handleInputChange} fieldState={fieldSaveStates["clearance_date_received"]} />
                        <FieldRenderer label="Status" fieldKey="clearance_status" type="select" options={statusOptions} value={getValue("clearance_status")} onChange={handleInputChange} fieldState={fieldSaveStates["clearance_status"]} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2 font-medium">
                  {new Date(request.created_at).toLocaleString()}
                </span>
              </div>
              {request.updated_at && (
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="ml-2 font-medium">
                    {new Date(request.updated_at).toLocaleString()}
                  </span>
                </div>
              )}
              {request.created_by && (
                <div className="col-span-2">
                  <UserDisplay userId={request.created_by} label="Created by" />
                </div>
              )}
              {request.editors && request.editors.length > 0 && (
                <div className="col-span-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Edited by</Label>
                    <div className="flex flex-wrap gap-2">
                      {request.editors.map((editorId, index) => (
                        <UserDisplay key={index} userId={editorId} variant="secondary" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Stats - Compact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Processing Time Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold">{calculatedDays.total_days}</div>
                  <div className="text-xs text-muted-foreground mt-1">Total Days</div>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg">
                  <div className={cn("text-xl font-bold", getDelayColor(calculatedDays.days_in_receiving, request.receiving_standard_days))}>
                    {calculatedDays.days_in_receiving}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Receiving</div>
                  <div className="text-xs text-gray-500">({request.receiving_standard_days}d std)</div>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-lg">
                  <div className={cn("text-xl font-bold", getDelayColor(calculatedDays.days_in_inspection, request.inspection_standard_days))}>
                    {calculatedDays.days_in_inspection}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Inspection</div>
                  <div className="text-xs text-gray-500">({request.inspection_standard_days}d std)</div>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-yellow-50 rounded-lg">
                  <div className={cn("text-xl font-bold", getDelayColor(calculatedDays.days_in_requirements, request.requirements_standard_days))}>
                    {calculatedDays.days_in_requirements}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Requirements</div>
                  <div className="text-xs text-gray-500">({request.requirements_standard_days}d std)</div>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-orange-50 rounded-lg">
                  <div className={cn("text-xl font-bold", getDelayColor(calculatedDays.days_in_clearance, request.clearance_standard_days))}>
                    {calculatedDays.days_in_clearance}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Clearance</div>
                  <div className="text-xs text-gray-500">({request.clearance_standard_days}d std)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ISOTreeRequestDetails.displayName = 'ISOTreeRequestDetails';

export default ISOTreeRequestDetails;
