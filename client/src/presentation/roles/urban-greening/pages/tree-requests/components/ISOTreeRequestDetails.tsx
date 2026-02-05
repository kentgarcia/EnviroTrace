// client/src/presentation/roles/urban-greening/pages/tree-requests/components/ISOTreeRequestDetails.tsx
/**
 * ISO Tree Request Details with Inline Editing
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/components/shared/ui/alert-dialog";
import { 
  TreeRequestWithAnalytics, 
  TreeRequestCreate,
  ISORequestType,
  ISOOverallStatus,
  RequirementChecklistItem,
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
  Copy,
  Building,
  Save,
} from "lucide-react";
import { cn } from "@/core/utils/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { calculateTreeRequestDays } from "@/core/utils/tree-request-utils";
import { CreatableCombobox, ComboboxItem } from "@/presentation/components/shared/ui/creatable-combobox";

// ==================== Constants ====================

const REQUEST_TYPES: ComboboxItem[] = [
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

type FieldRendererType = 'text' | 'date' | 'select' | 'textarea' | 'creatable-select';

interface FieldRendererProps {
  label: string;
  fieldKey: keyof TreeRequestCreate;
  value: any;
  type?: FieldRendererType;
  options?: any[];
  onChange: (field: keyof TreeRequestCreate, value: any, meta?: { type?: FieldRendererType }) => void;
}

const FieldRenderer = React.memo(({
  label,
  fieldKey,
  value,
  type = 'text',
  options,
  onChange,
}: FieldRendererProps) => {
  const handleValueChange = (val: any) => {
    onChange(fieldKey, val, { type });
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {type === 'creatable-select' && options ? (
        <CreatableCombobox
          items={options as ComboboxItem[]}
          value={value?.toString() || ""}
          onChange={(val) => handleValueChange(val)}
          placeholder={`Select or enter ${label.toLowerCase()}`}
          className="h-8"
        />
      ) : type === 'select' && options ? (
        <Select
          value={value?.toString() || ""}
          onValueChange={(val) => handleValueChange(val)}
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
          onChange={(e) => handleValueChange(e.target.value)}
          className="min-h-[60px] rounded-lg"
        />
      ) : (
        <Input
          type={type}
          value={value?.toString() || ""}
          onChange={(e) => handleValueChange(e.target.value)}
          className="h-8 rounded-lg"
        />
      )}
    </div>
  );
});

FieldRenderer.displayName = "FieldRenderer";

const REQUEST_FORM_FIELDS: (keyof TreeRequestCreate)[] = [
  "request_type",
  "overall_status",
  "is_archived",
  "receiving_date_received",
  "receiving_month",
  "receiving_received_through",
  "receiving_date_received_by_dept_head",
  "receiving_name",
  "receiving_organization",
  "receiving_address",
  "receiving_contact",
  "receiving_request_status",
  "inspection_date_received_by_inspectors",
  "inspection_date_of_inspection",
  "inspection_month",
  "inspection_proponent_present",
  "inspection_date_submitted_to_dept_head",
  "inspection_date_released_to_inspectors",
  "inspection_report_control_number",
  "inspection_remarks",
  "requirements_checklist",
  "requirements_remarks",
  "requirements_status",
  "requirements_date_completion",
  "clearance_date_issued",
  "clearance_date_of_payment",
  "clearance_control_number",
  "clearance_or_number",
  "clearance_date_received",
  "clearance_status",
  "denr_date_received_by_inspectors",
  "denr_date_submitted_to_dept_head",
  "denr_date_released_to_inspectors",
  "denr_date_received",
  "denr_status",
];

const cloneChecklist = (list?: RequirementChecklistItem[]): RequirementChecklistItem[] => {
  if (!list) {
    return [];
  }
  return list.map((item) => ({
    requirement_name: item.requirement_name,
    is_checked: !!item.is_checked,
    date_submitted: item.date_submitted ?? undefined,
  }));
};

const buildFormData = (source: TreeRequestWithAnalytics | TreeRequestCreate): TreeRequestCreate => {
  const form: TreeRequestCreate = {
    request_type: source.request_type,
  };

  REQUEST_FORM_FIELDS.forEach((field) => {
    if (field === "request_type") {
      return;
    }

    const value = (source as any)[field];
    if (field === "requirements_checklist") {
      if (value) {
        form.requirements_checklist = cloneChecklist(value as RequirementChecklistItem[]);
      }
      return;
    }

    if (value !== undefined) {
      (form as any)[field] = value;
    }
  });

  if ((source as any).overall_status) {
    form.overall_status = (source as any).overall_status;
  }
  if ((source as any).is_archived !== undefined) {
    form.is_archived = (source as any).is_archived;
  }

  return form;
};

const cloneFormData = (data: TreeRequestCreate): TreeRequestCreate => {
  const cloned: TreeRequestCreate = {
    request_type: data.request_type,
  };

  REQUEST_FORM_FIELDS.forEach((field) => {
    if (field === "request_type") {
      return;
    }

    const value = data[field];
    if (field === "requirements_checklist") {
      if (value) {
        cloned.requirements_checklist = cloneChecklist(value);
      }
      return;
    }

    if (value !== undefined) {
      (cloned as any)[field] = value;
    }
  });

  return cloned;
};

const normalizeForCompare = (data: TreeRequestCreate) => {
  const normalized: Record<string, any> = {};
  REQUEST_FORM_FIELDS.forEach((field) => {
    const value = data[field];
    if (field === "requirements_checklist") {
      normalized[field] = cloneChecklist(value);
      return;
    }
    normalized[field] = value ?? null;
  });
  return normalized;
};

const isFormEqual = (a: TreeRequestCreate, b: TreeRequestCreate) => {
  return JSON.stringify(normalizeForCompare(a)) === JSON.stringify(normalizeForCompare(b));
};

const deriveOverallStatus = (
  data: TreeRequestCreate,
  fallback: ISOOverallStatus
): ISOOverallStatus => {
  if (data.clearance_status && data.clearance_status !== "pending") {
    return "clearance";
  }
  if (data.requirements_status && data.requirements_status !== "pending") {
    return "requirements";
  }
  if (data.inspection_date_of_inspection) {
    return "inspection";
  }
  if (data.receiving_date_received) {
    return "receiving";
  }
  return data.overall_status ?? fallback;
};

// ==================== Main Component ====================

interface ISOTreeRequestDetailsProps {
  request: TreeRequestWithAnalytics;
  onClose: () => void;
  onUpdate?: () => void;
  canEdit?: boolean;
}

const ISOTreeRequestDetails: React.FC<ISOTreeRequestDetailsProps> = React.memo(({
  request,
  onClose,
  onUpdate,
  canEdit = true,
}) => {
  const queryClient = useQueryClient();
  const isReadOnly = !canEdit;
  const [displayData, setDisplayData] = useState<TreeRequestWithAnalytics>(request);
  const [initialData, setInitialData] = useState<TreeRequestCreate>(() => buildFormData(request));
  const [draftData, setDraftData] = useState<TreeRequestCreate>(() => buildFormData(request));
  const initialDataRef = useRef<TreeRequestCreate>(buildFormData(request));
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<'close' | null>(null);

  useEffect(() => {
    const nextForm = buildFormData(request);
    setInitialData(nextForm);
    setDraftData(nextForm);
    initialDataRef.current = nextForm;
    setDisplayData(request);
    setIsDirty(false);
    setSaveState('idle');
  }, [request]);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const calculatedDays = useMemo(() => calculateTreeRequestDays(displayData), [displayData]);

  // Use longer staleTime to prevent unnecessary background refetches on every open
  const { data: receivedThroughOptions = [] } = useQuery({
    queryKey: ["dropdown-options", "received_through"],
    queryFn: () => fetchDropdownOptions("received_through"),
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  const { data: statusReceiving = [] } = useQuery({
    queryKey: ["dropdown-options", "status_receiving"],
    queryFn: () => fetchDropdownOptions("status_receiving"),
    staleTime: 1000 * 60 * 30,
  });

  const { data: statusRequirements = [] } = useQuery({
    queryKey: ["dropdown-options", "status_requirements"],
    queryFn: () => fetchDropdownOptions("status_requirements"),
    staleTime: 1000 * 60 * 30,
  });

  const { data: statusClearance = [] } = useQuery({
    queryKey: ["dropdown-options", "status_clearance"],
    queryFn: () => fetchDropdownOptions("status_clearance"),
    staleTime: 1000 * 60 * 30,
  });

  const { data: statusDenr = [] } = useQuery({
    queryKey: ["dropdown-options", "status_denr"],
    queryFn: () => fetchDropdownOptions("status_denr"),
    staleTime: 1000 * 60 * 30,
  });

  const toItems = (opts: any[]) => opts.map((opt: any) => ({
    value: opt.option_value,
    label: opt.option_value
  }));

  const receivedThroughItems = useMemo(() => toItems(receivedThroughOptions), [receivedThroughOptions]);
  const statusReceivingItems = useMemo(() => toItems(statusReceiving), [statusReceiving]);
  const statusRequirementsItems = useMemo(() => toItems(statusRequirements), [statusRequirements]);
  const statusClearanceItems = useMemo(() => toItems(statusClearance), [statusClearance]);
  const statusDenrItems = useMemo(() => toItems(statusDenr), [statusDenr]);

  const updateDirtyState = useCallback((nextForm: TreeRequestCreate) => {
    setIsDirty(!isFormEqual(nextForm, initialDataRef.current));
  }, []);

  const applyPartialToDisplay = useCallback((partial: Partial<TreeRequestCreate>) => {
    setDisplayData((prev) => {
      const next = { ...prev } as TreeRequestWithAnalytics;
      Object.entries(partial).forEach(([key, value]) => {
        if (key === "requirements_checklist") {
          next.requirements_checklist = value
            ? cloneChecklist(value as RequirementChecklistItem[])
            : undefined;
        } else {
          (next as any)[key] = value;
        }
      });
      return next;
    });
  }, []);

  const handleFieldChange = useCallback(
    (field: keyof TreeRequestCreate, value: any, meta?: { type?: FieldRendererType }) => {
      if (isReadOnly) return;
      setDraftData((prev) => {
        const next: TreeRequestCreate = { ...prev };
        let processedValue: any = value;
        if (meta?.type === "date") {
          processedValue = value ? value : null;
        } else if (processedValue === "") {
          processedValue = null;
        }

        (next as any)[field] = processedValue;

        const fallbackStatus = (displayData.overall_status ?? request.overall_status ?? "receiving") as ISOOverallStatus;
        next.overall_status = deriveOverallStatus(next, fallbackStatus);
        updateDirtyState(next);

        const partial: Partial<TreeRequestCreate> = { overall_status: next.overall_status };
        (partial as any)[field] = processedValue;
        applyPartialToDisplay(partial);

        return next;
      });
    },
    [applyPartialToDisplay, displayData.overall_status, request.overall_status, updateDirtyState]
  );

  const handleRequirementChange = useCallback(
    (index: number, field: "is_checked" | "date_submitted", value: any) => {
      if (isReadOnly) return;
      setDraftData((prev) => {
        const currentChecklist = cloneChecklist(prev.requirements_checklist);
        if (!currentChecklist[index]) {
          return prev;
        }

        const updatedItem = { ...currentChecklist[index] };
        if (field === "is_checked") {
          const isChecked = Boolean(value);
          updatedItem.is_checked = isChecked;
          updatedItem.date_submitted = isChecked
            ? new Date().toISOString().split("T")[0]
            : undefined;
        } else {
          updatedItem.date_submitted = value ? value : null;
        }

        currentChecklist[index] = updatedItem;

        const next: TreeRequestCreate = {
          ...prev,
          requirements_checklist: currentChecklist,
        };

        const fallbackStatus = (displayData.overall_status ?? request.overall_status ?? "receiving") as ISOOverallStatus;
        next.overall_status = deriveOverallStatus(next, fallbackStatus);
        updateDirtyState(next);
        applyPartialToDisplay({
          requirements_checklist: currentChecklist,
          overall_status: next.overall_status,
        });

        return next;
      });
    },
    [applyPartialToDisplay, displayData.overall_status, request.overall_status, updateDirtyState]
  );

  const getValue = useCallback(
    <K extends keyof TreeRequestCreate>(field: K): TreeRequestCreate[K] | null => {
      return draftData[field] ?? null;
    },
    [draftData]
  );

  const saveMutation = useMutation({
    mutationFn: (payload: TreeRequestCreate) => updateTreeRequest(request.id, payload),
    onSuccess: (updatedRequest) => {
      const nextForm = buildFormData(updatedRequest);
      setInitialData(nextForm);
      setDraftData(nextForm);
      initialDataRef.current = nextForm;
      setDisplayData(updatedRequest);
      setIsDirty(false);
      setSaveState("success");
      queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
      toast.success("Request saved");
      onUpdate?.();
      setTimeout(() => setSaveState("idle"), 2000);
    },
    onError: (error: any) => {
      setSaveState("error");
      toast.error(error?.response?.data?.detail || "Failed to save request");
      setTimeout(() => setSaveState("idle"), 3000);
    },
  });

  const handleSave = useCallback(() => {
    if (isReadOnly) return;
    const payload = cloneFormData(draftData);
    const fallbackStatus = (displayData.overall_status ?? request.overall_status ?? "receiving") as ISOOverallStatus;
    payload.overall_status = deriveOverallStatus(payload, fallbackStatus);
    setSaveState("saving");
    saveMutation.mutate(payload);
  }, [draftData, displayData.overall_status, isReadOnly, request.overall_status, saveMutation]);

  const applyInitialState = useCallback(() => {
    const reset = cloneFormData(initialDataRef.current);
    if (initialDataRef.current.overall_status) {
      reset.overall_status = initialDataRef.current.overall_status;
    }
    setDraftData(reset);
    applyPartialToDisplay(reset);
    setIsDirty(false);
    setSaveState("idle");
  }, [applyPartialToDisplay]);

  const handleDiscard = useCallback(() => {
    applyInitialState();
  }, [applyInitialState]);

  const handleAttemptClose = useCallback(() => {
    if (isDirty) {
      setPendingAction("close");
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleConfirmDiscard = useCallback(() => {
    applyInitialState();
    setShowUnsavedPrompt(false);
    if (pendingAction === "close") {
      onClose();
    }
    setPendingAction(null);
  }, [applyInitialState, onClose, pendingAction]);

  const handleCancelDiscard = useCallback(() => {
    setShowUnsavedPrompt(false);
    setPendingAction(null);
  }, []);

  const handleDialogChange = useCallback((open: boolean) => {
    if (!open) {
      handleAttemptClose();
    }
  }, [handleAttemptClose]);

  const handleCopyDetails = useCallback(() => {
    const formatDate = (date?: string | null) => (date ? new Date(date).toLocaleDateString() : "—");
    const data = `TREE REQUEST DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Request Number: ${displayData.request_number}
Request Type: ${REQUEST_TYPES.find((t) => t.value === draftData.request_type)?.label || draftData.request_type}
Current Phase: ${displayData.overall_status}
Status: ${displayData.is_delayed ? '⚠️ DELAYED' : '✓ On Track'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECEIVING PHASE (${calculatedDays.days_in_receiving} days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date Received: ${formatDate(draftData.receiving_date_received)}
Month: ${draftData.receiving_month || "—"}
Received Through: ${draftData.receiving_received_through || "—"}
Date Received by Dept. Head: ${formatDate(draftData.receiving_date_received_by_dept_head)}
Name: ${draftData.receiving_name || "—"}
Organization: ${draftData.receiving_organization || "—"}
Address: ${draftData.receiving_address || "—"}
Contact: ${draftData.receiving_contact || "—"}
Status: ${draftData.receiving_request_status || "—"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSPECTION PHASE (${calculatedDays.days_in_inspection} days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date Received by Inspectors: ${formatDate(draftData.inspection_date_received_by_inspectors)}
Date of Inspection: ${formatDate(draftData.inspection_date_of_inspection)}
Month: ${draftData.inspection_month || "—"}
Proponent Present: ${draftData.inspection_proponent_present || "—"}
Date Submitted to Dept. Head: ${formatDate(draftData.inspection_date_submitted_to_dept_head)}
Date Released to Inspectors: ${formatDate(draftData.inspection_date_released_to_inspectors)}
Report Control Number: ${draftData.inspection_report_control_number || "—"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIREMENTS PHASE (${calculatedDays.days_in_requirements} days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Remarks: ${draftData.requirements_remarks || "—"}
Status: ${draftData.requirements_status || "—"}
Date of Completion: ${formatDate(draftData.requirements_date_completion)}

Checklist:
${(draftData.requirements_checklist || []).map((item) => `  ${item.is_checked ? '☑' : '☐'} ${item.requirement_name} ${item.date_submitted ? `(${formatDate(item.date_submitted)})` : ''}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLEARANCE PHASE (${calculatedDays.days_in_clearance} days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date Issued: ${formatDate(draftData.clearance_date_issued)}
Date of Payment: ${formatDate(draftData.clearance_date_of_payment)}
Control Number: ${draftData.clearance_control_number || "—"}
OR Number: ${draftData.clearance_or_number || "—"}
Date Received: ${formatDate(draftData.clearance_date_received)}
Status: ${draftData.clearance_status || "—"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Processing Days: ${calculatedDays.total_days}
Receiving: ${calculatedDays.days_in_receiving} days (Standard: ${displayData.receiving_standard_days || 'N/A'})
Inspection: ${calculatedDays.days_in_inspection} days (Standard: ${displayData.inspection_standard_days || 'N/A'})
Requirements: ${calculatedDays.days_in_requirements} days (Standard: ${displayData.requirements_standard_days || 'N/A'})
Clearance: ${calculatedDays.days_in_clearance} days (Standard: ${displayData.clearance_standard_days || 'N/A'})

Created: ${new Date(displayData.created_at).toLocaleString()}
Last Updated: ${displayData.updated_at ? new Date(displayData.updated_at).toLocaleString() : '—'}`;
    navigator.clipboard.writeText(data);
    toast.success("Request details copied to clipboard");
  }, [calculatedDays, displayData, draftData]);

  const isSaving = saveState === "saving" || saveMutation.isPending;
  const hasChecklist = (draftData.requirements_checklist?.length ?? 0) > 0;

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
    <>
      <Dialog open onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] rounded-2xl flex flex-col">
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700 px-6 pt-6 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl">
                Request #{displayData.request_number}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                {displayData.is_delayed && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Delayed
                  </Badge>
                )}
                {isDirty && !isSaving && (
                  <Badge variant="outline" className="flex items-center gap-1 border-amber-200 bg-amber-50 text-amber-700">
                    <AlertCircle className="w-3 h-3" />
                    Unsaved changes
                  </Badge>
                )}
                {isSaving && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </div>
                )}
                {saveState === 'success' && (
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
            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={handleDiscard}
                    disabled={!isDirty || isSaving}
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-lg bg-[#0033a0] hover:bg-[#002a80] text-white"
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save changes
                  </Button>
                </>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="rounded-lg"
                onClick={handleCopyDetails}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Details
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Request Type</Label>
                  <CreatableCombobox
                    items={REQUEST_TYPES}
                    value={getValue('request_type')?.toString() || ""}
                    onChange={(value) => handleFieldChange('request_type', value, { type: 'select' })}
                    placeholder="Select or enter request type"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Current Phase</Label>
                  <div className="flex items-center h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                    <Badge className={cn("capitalize", getStatusColor((getValue('overall_status')?.toString() || displayData.overall_status) ?? 'receiving'))}>
                      {getValue('overall_status') || displayData.overall_status}
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
                      (displayData.overall_status === "receiving") || getValue("receiving_date_received")
                        ? "bg-blue-500 border-blue-500 text-white" 
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    )}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">Receiving</h3>
                        {calculatedDays.days_in_receiving > 0 && (
                          <div className={cn("text-sm", getDelayColor(calculatedDays.days_in_receiving, displayData.receiving_standard_days))}>
                            {calculatedDays.days_in_receiving} days
                            {displayData.receiving_standard_days && calculatedDays.days_in_receiving > displayData.receiving_standard_days && (
                              <span className="ml-1">({calculatedDays.days_in_receiving - displayData.receiving_standard_days} over)</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <FieldRenderer label="Date Received" fieldKey="receiving_date_received" type="date" value={getValue("receiving_date_received")} onChange={handleFieldChange} />
                        <FieldRenderer label="Month" fieldKey="receiving_month" type="select" options={MONTHS} value={getValue("receiving_month")} onChange={handleFieldChange} />
                        <FieldRenderer label="Received Through" fieldKey="receiving_received_through" type="creatable-select" options={receivedThroughItems} value={getValue("receiving_received_through")} onChange={handleFieldChange} />
                        <FieldRenderer label="Date Received by Dept. Head" fieldKey="receiving_date_received_by_dept_head" type="date" value={getValue("receiving_date_received_by_dept_head")} onChange={handleFieldChange} />
                        <FieldRenderer label="Name" fieldKey="receiving_name" type="text" value={getValue("receiving_name")} onChange={handleFieldChange} />
                        <FieldRenderer label="Organization" fieldKey="receiving_organization" type="text" value={getValue("receiving_organization")} onChange={handleFieldChange} />
                        <FieldRenderer label="Address" fieldKey="receiving_address" type="text" value={getValue("receiving_address")} onChange={handleFieldChange} />
                        <FieldRenderer label="Contact" fieldKey="receiving_contact" type="text" value={getValue("receiving_contact")} onChange={handleFieldChange} />
                        <FieldRenderer label="Status" fieldKey="receiving_request_status" type="creatable-select" options={statusReceivingItems} value={getValue("receiving_request_status")} onChange={handleFieldChange} />
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
                      (displayData.overall_status === "inspection") || getValue("inspection_date_received_by_inspectors") 
                        ? "bg-purple-500 border-purple-500 text-white" 
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    )}>
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">Inspection</h3>
                        {calculatedDays.days_in_inspection > 0 && (
                          <div className={cn("text-sm", getDelayColor(calculatedDays.days_in_inspection, displayData.inspection_standard_days))}>
                            {calculatedDays.days_in_inspection} days
                            {displayData.inspection_standard_days && calculatedDays.days_in_inspection > displayData.inspection_standard_days && (
                              <span className="ml-1">({calculatedDays.days_in_inspection - displayData.inspection_standard_days} over)</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <FieldRenderer label="Date Received by Inspectors" fieldKey="inspection_date_received_by_inspectors" type="date" value={getValue("inspection_date_received_by_inspectors")} onChange={handleFieldChange} />
                        <FieldRenderer label="Date of Inspection" fieldKey="inspection_date_of_inspection" type="date" value={getValue("inspection_date_of_inspection")} onChange={handleFieldChange} />
                        <FieldRenderer label="Month" fieldKey="inspection_month" type="select" options={MONTHS} value={getValue("inspection_month")} onChange={handleFieldChange} />
                        <FieldRenderer label="Proponent Present" fieldKey="inspection_proponent_present" type="text" value={getValue("inspection_proponent_present")} onChange={handleFieldChange} />
                        <FieldRenderer label="Date Submitted to Dept. Head" fieldKey="inspection_date_submitted_to_dept_head" type="date" value={getValue("inspection_date_submitted_to_dept_head")} onChange={handleFieldChange} />
                        <FieldRenderer label="Date Released to Inspectors" fieldKey="inspection_date_released_to_inspectors" type="date" value={getValue("inspection_date_released_to_inspectors")} onChange={handleFieldChange} />
                        <FieldRenderer label="Report Control Number" fieldKey="inspection_report_control_number" type="text" value={getValue("inspection_report_control_number")} onChange={handleFieldChange} />
                        <FieldRenderer label="Remarks" fieldKey="inspection_remarks" type="textarea" value={getValue("inspection_remarks")} onChange={handleFieldChange} />
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
                      (displayData.overall_status === "requirements") || getValue("requirements_date_completion")
                        ? "bg-yellow-500 border-yellow-500 text-white" 
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    )}>
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">Requirements</h3>
                        {calculatedDays.days_in_requirements > 0 && (
                          <div className={cn("text-sm", getDelayColor(calculatedDays.days_in_requirements, displayData.requirements_standard_days))}>
                            {calculatedDays.days_in_requirements} days
                            {displayData.requirements_standard_days && calculatedDays.days_in_requirements > displayData.requirements_standard_days && (
                              <span className="ml-1">({calculatedDays.days_in_requirements - displayData.requirements_standard_days} over)</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-3">
                        <FieldRenderer label="Remarks" fieldKey="requirements_remarks" type="textarea" value={getValue("requirements_remarks")} onChange={handleFieldChange} />
                        <FieldRenderer label="Status" fieldKey="requirements_status" type="creatable-select" options={statusRequirementsItems} value={getValue("requirements_status")} onChange={handleFieldChange} />
                        <FieldRenderer label="Date of Completion" fieldKey="requirements_date_completion" type="date" value={getValue("requirements_date_completion")} onChange={handleFieldChange} />
                      </div>
                      
                      {/* Requirements Checklist */}
                      {hasChecklist && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                          <div className="text-sm font-medium mb-2">Requirements Checklist:</div>
                          <div className="space-y-2">
                            {(draftData.requirements_checklist || []).map((item, idx) => (
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
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                  <div className="flex gap-4">
                    <div className={cn(
                      "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2",
                      (displayData.overall_status === "clearance") || getValue("clearance_date_issued")
                        ? "bg-orange-500 border-orange-500 text-white" 
                        : displayData.overall_status === "completed"
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    )}>
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">Clearance</h3>
                        {calculatedDays.days_in_clearance > 0 && (
                          <div className={cn("text-sm", getDelayColor(calculatedDays.days_in_clearance, displayData.clearance_standard_days))}>
                            {calculatedDays.days_in_clearance} days
                            {displayData.clearance_standard_days && calculatedDays.days_in_clearance > displayData.clearance_standard_days && (
                              <span className="ml-1">({calculatedDays.days_in_clearance - displayData.clearance_standard_days} over)</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <FieldRenderer label="Date Issued" fieldKey="clearance_date_issued" type="date" value={getValue("clearance_date_issued")} onChange={handleFieldChange} />
                        <FieldRenderer label="Date of Payment" fieldKey="clearance_date_of_payment" type="date" value={getValue("clearance_date_of_payment")} onChange={handleFieldChange} />
                        <FieldRenderer label="Control Number" fieldKey="clearance_control_number" type="text" value={getValue("clearance_control_number")} onChange={handleFieldChange} />
                        <FieldRenderer label="OR Number" fieldKey="clearance_or_number" type="text" value={getValue("clearance_or_number")} onChange={handleFieldChange} />
                        <FieldRenderer label="Date Received" fieldKey="clearance_date_received" type="date" value={getValue("clearance_date_received")} onChange={handleFieldChange} />
                        <FieldRenderer label="Status" fieldKey="clearance_status" type="creatable-select" options={statusClearanceItems} value={getValue("clearance_status")} onChange={handleFieldChange} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 5: DENR */}
                <div className="relative">
                  <div className="flex gap-4">
                    <div className={cn(
                      "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2",
                      getValue("denr_date_received_by_inspectors")
                        ? "bg-slate-700 border-slate-700 text-white" 
                        : displayData.overall_status === "completed"
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    )}>
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">DENR</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <FieldRenderer label="Date Received by Inspectors" fieldKey="denr_date_received_by_inspectors" type="date" value={getValue("denr_date_received_by_inspectors")} onChange={handleFieldChange} />
                        <FieldRenderer label="Date Submitted to Dept. Head" fieldKey="denr_date_submitted_to_dept_head" type="date" value={getValue("denr_date_submitted_to_dept_head")} onChange={handleFieldChange} />
                        <FieldRenderer label="Date Released to Inspectors" fieldKey="denr_date_released_to_inspectors" type="date" value={getValue("denr_date_released_to_inspectors")} onChange={handleFieldChange} />
                        <FieldRenderer label="Date Received" fieldKey="denr_date_received" type="date" value={getValue("denr_date_received")} onChange={handleFieldChange} />
                        <FieldRenderer label="Status" fieldKey="denr_status" type="creatable-select" options={statusDenrItems} value={getValue("denr_status")} onChange={handleFieldChange} />
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
                  {new Date(displayData.created_at).toLocaleString()}
                </span>
              </div>
              {displayData.updated_at && (
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="ml-2 font-medium">
                    {new Date(displayData.updated_at).toLocaleString()}
                  </span>
                </div>
              )}
              {displayData.created_by && (
                <div className="col-span-2">
                  <UserDisplay userId={displayData.created_by} label="Created by" />
                </div>
              )}
              {displayData.editors && displayData.editors.length > 0 && (
                <div className="col-span-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Edited by</Label>
                    <div className="flex flex-wrap gap-2">
                      {displayData.editors.map((editorId, index) => (
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

      <AlertDialog open={showUnsavedPrompt} onOpenChange={(open) => { if (!open) handleCancelDiscard(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have pending edits that are not saved yet. Discarding will remove those changes permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDiscard}>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>Discard changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

ISOTreeRequestDetails.displayName = 'ISOTreeRequestDetails';

export default ISOTreeRequestDetails;
