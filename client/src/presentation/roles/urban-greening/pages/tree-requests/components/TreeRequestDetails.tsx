// client/src/presentation/roles/urban-greening/pages/tree-requests/components/TreeRequestDetails.tsx
/**
 * Tree Request Details Component
 * Shows request details with actions for approval, completion, and fee creation
 */

import React, { useState } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import {
  TreePine,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  DollarSign,
  Axe,
  Scissors,
  AlertTriangle,
  Clock,
  Edit,
  ArrowRight,
  Leaf,
} from "lucide-react";
import {
  TreeManagementRequest,
  RequestType,
  RequestStatus,
} from "@/core/api/tree-management-request-api";
import { useTreeManagementRequestMutations } from "../logic/useTreeManagementRequests";
import { fetchUrbanGreeningFeeRecords, UrbanGreeningFeeRecord } from "@/core/api/fee-api";
import { useTreeInventory } from "../../tree-inventory/logic/useTreeInventory";
import { useQuery } from "@tanstack/react-query";

interface TreeRequestDetailsProps {
  request: TreeManagementRequest;
  onClose: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}

const REQUEST_TYPE_CONFIG: Record<RequestType, { label: string; icon: React.ReactNode; color: string }> = {
  cutting: { label: "Tree Cutting", icon: <Axe className="w-4 h-4" />, color: "bg-red-100 text-red-800" },
  pruning: { label: "Pruning", icon: <Scissors className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-800" },
  violation: { label: "Violation", icon: <AlertTriangle className="w-4 h-4" />, color: "bg-orange-100 text-orange-800" },
};

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string }> = {
  filed: { label: "Filed", color: "bg-gray-100 text-gray-800" },
  on_hold: { label: "On Hold", color: "bg-yellow-100 text-yellow-800" },
  for_signature: { label: "For Signature", color: "bg-blue-100 text-blue-800" },
  payment_pending: { label: "Payment Pending", color: "bg-orange-100 text-orange-800" },
};

const TreeRequestDetails: React.FC<TreeRequestDetailsProps> = ({
  request,
  onClose,
  onEdit,
  onRefresh,
}) => {
  const { approveMutation, completeMutation, updateMutation } = useTreeManagementRequestMutations();
  
  // Fetch fee records to display linked fee
  const { data: feeRecords = [] } = useQuery({
    queryKey: ["fee-records"],
    queryFn: () => fetchUrbanGreeningFeeRecords(),
  });

  // Fetch tree inventory to display linked trees
  const { data: allTrees = [] } = useTreeInventory({});
  
  // Approval dialog state
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvedBy, setApprovedBy] = useState("");
  const [feeAmount, setFeeAmount] = useState<number | undefined>(undefined);
  const [approvalNotes, setApprovalNotes] = useState("");
  
  // Complete dialog state
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");

  const typeConfig = REQUEST_TYPE_CONFIG[request.request_type] || { label: request.request_type || "Unknown", icon: <FileText className="w-4 h-4" />, color: "bg-gray-100 text-gray-800" };
  const statusConfig = STATUS_CONFIG[request.status] || { label: request.status || "Unknown", color: "bg-gray-100 text-gray-800" };

  // Get linked fee record
  const linkedFee = request.fee_record_id ? feeRecords.find(f => f.id === request.fee_record_id) : null;

  // Get linked trees from inventory
  const linkedTreesFromInventory = (request.linked_tree_ids || []).map(treeId => {
    return allTrees.find(t => t.id === treeId);
  }).filter(Boolean);

  const linkedTrees = request.linked_trees || [];
  const newTrees = request.new_trees || [];
  const totalTrees = linkedTrees.length + newTrees.length + linkedTreesFromInventory.length;

  const handleApprove = async () => {
    if (!approvedBy) return;
    await approveMutation.mutateAsync({
      id: request.id,
      data: {
        approved_by: approvedBy,
        fee_amount: feeAmount,
        notes: approvalNotes || undefined,
      },
    });
    setShowApprovalDialog(false);
    onRefresh();
  };

  const handleReject = async () => {
    await updateMutation.mutateAsync({
      id: request.id,
      data: { status: "rejected" },
    });
    onRefresh();
  };

  const handleComplete = async () => {
    await completeMutation.mutateAsync({
      id: request.id,
      data: { completion_notes: completionNotes || undefined },
    });
    setShowCompleteDialog(false);
    onRefresh();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-lg font-semibold">{request.request_number}</span>
            <Badge className={typeConfig.color}>
              {typeConfig.icon}
              <span className="ml-1">{typeConfig.label}</span>
            </Badge>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          </div>
          <div className="text-sm text-gray-500">
            Submitted on {formatDate(request.request_date)}
          </div>
        </div>
        {request.status === "filed" && (
          <Button variant="outline" size="sm" onClick={onEdit} className="rounded-lg">
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </div>

      {/* Requester Information */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-5 h-5" />
            Requester Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="font-medium">{request.requester_name}</div>
            </div>
            {request.requester_contact && (
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Contact
                </div>
                <div className="font-medium">{request.requester_contact}</div>
              </div>
            )}
          </div>
          {request.requester_email && (
            <div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </div>
              <div className="font-medium">{request.requester_email}</div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Address
            </div>
            <div className="font-medium">
              {request.property_address}
              {request.barangay && `, ${request.barangay}`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trees */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TreePine className="w-5 h-5" />
            Trees ({totalTrees})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Linked Trees from Inventory */}
          {linkedTreesFromInventory.map((tree, index) => (
            <div
              key={tree.id || index}
              className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <TreePine className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-medium">{tree.common_name}</div>
                  <div className="text-xs text-gray-500">
                    {tree.tree_code} • {tree.species || "No scientific name"}
                  </div>
                  {tree.address && (
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {tree.address}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-emerald-100">
                  From Inventory
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    tree.health === "healthy"
                      ? "bg-green-50 text-green-700"
                      : tree.health === "needs_attention"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700"
                  }
                >
                  {tree.health}
                </Badge>
              </div>
            </div>
          ))}
          {/* Linked Trees */}
          {linkedTrees.map((tree, index) => (
            <div
              key={tree.tree_id || index}
              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <TreePine className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">{tree.common_name}</div>
                  <div className="text-xs text-gray-500">
                    {tree.tree_code} • {tree.species || "No scientific name"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {tree.action}
                </Badge>
                <Badge variant="outline" className={
                  tree.health === "healthy" ? "bg-green-50 text-green-700" :
                  tree.health === "needs_attention" ? "bg-yellow-50 text-yellow-700" :
                  "bg-red-50 text-red-700"
                }>
                  {tree.health}
                </Badge>
              </div>
            </div>
          ))}
          
          {/* New Trees */}
          {newTrees.map((tree, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <TreePine className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">{tree.common_name}</div>
                  <div className="text-xs text-gray-500">
                    {tree.species || "No scientific name"} • New Record
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs bg-blue-100">
                New
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Request Details */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Request Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm text-gray-500">Reason</div>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">{request.reason}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Urgency</div>
              <Badge variant="outline" className={
                request.urgency === "emergency" ? "bg-red-100 text-red-800" :
                request.urgency === "high" ? "bg-orange-100 text-orange-800" :
                request.urgency === "normal" ? "bg-blue-100 text-blue-800" :
                "bg-gray-100 text-gray-800"
              }>
                {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-500">Replacement Required</div>
              <Badge variant="outline" className={
                request.replacement_required ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
              }>
                {request.replacement_required ? `Yes (${request.replacement_count || 0} trees)` : "No"}
              </Badge>
            </div>
          </div>
          {request.inspectors && request.inspectors.length > 0 && (
            <div>
              <div className="text-sm text-gray-500 mb-2">Inspectors</div>
              <div className="flex flex-wrap gap-2">
                {request.inspectors.map((inspector, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-800">
                    <User className="w-3 h-3 mr-1" />
                    {inspector}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {request.notes && (
            <div>
              <div className="text-sm text-gray-500">Notes</div>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">{request.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Information */}
      {linkedFee && (
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Linked Fee Record
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-medium">{linkedFee.reference_number}</span>
                <Badge
                  className={
                    linkedFee.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : linkedFee.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : linkedFee.status === "overdue"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {linkedFee.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">Type</div>
                  <div className="font-medium capitalize">{linkedFee.type.replace("_", " ")}</div>
                </div>
                <div>
                  <div className="text-gray-500">Amount</div>
                  <div className="font-medium">₱{linkedFee.amount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Payer</div>
                  <div className="font-medium">{linkedFee.payer_name}</div>
                </div>
                <div>
                  <div className="text-gray-500">Date</div>
                  <div className="font-medium">{new Date(linkedFee.date).toLocaleDateString()}</div>
                </div>
                {linkedFee.or_number && (
                  <div className="col-span-2">
                    <div className="text-gray-500">OR Number</div>
                    <div className="font-medium">{linkedFee.or_number}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee Information */}
      {(request.fee_amount || request.fee_status) && (
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Fee Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Amount</div>
                <div className="text-2xl font-bold">₱{(request.fee_amount || 0).toLocaleString()}</div>
              </div>
              <Badge className={
                request.fee_status === "paid" ? "bg-green-100 text-green-800" :
                request.fee_status === "pending" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-600"
              }>
                {request.fee_status?.charAt(0).toUpperCase() + (request.fee_status?.slice(1) || "")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex gap-2">
          {request.status === "pending" && (
            <>
              <Button
                onClick={() => setShowApprovalDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          {request.status === "approved" && (
            <Button
              onClick={() => setShowCompleteDialog(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Mark Complete
            </Button>
          )}
          {request.status === "completed" && request.replacement_required && !request.replacement_project_id && (
            <a href="/urban-greening/greening-projects?action=add&type=replacement">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-lg">
                <Leaf className="w-4 h-4 mr-1" />
                Create Replacement Project
              </Button>
            </a>
          )}
        </div>
        <Button variant="outline" onClick={onClose} className="rounded-lg">
          Close
        </Button>
      </div>

      {/* Approval Dialog */}
      {showApprovalDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">Approve Request</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Approved By *</Label>
                <Input
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  placeholder="Your name"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Fee Amount (₱)</Label>
                <Input
                  type="number"
                  value={feeAmount || ""}
                  onChange={(e) => setFeeAmount(parseFloat(e.target.value) || undefined)}
                  placeholder="0.00"
                  className="rounded-lg"
                />
                <p className="text-xs text-gray-500">This will create a fee record automatically</p>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Approval notes..."
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowApprovalDialog(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={!approvedBy || approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                {approveMutation.isPending ? "Approving..." : "Approve Request"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Dialog */}
      {showCompleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">Complete Request</h3>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <p className="text-sm text-amber-800">
                This will mark all linked trees as "{request.request_type === "cutting" ? "cut" : "processed"}" 
                in the tree inventory.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Completion Notes</Label>
                <Textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Notes about completion..."
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCompleteDialog(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                disabled={completeMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                {completeMutation.isPending ? "Completing..." : "Mark Complete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeRequestDetails;
