// client/src/presentation/roles/urban-greening/pages/tree-requests/components/TreeRequestForm.tsx
/**
 * Tree Request Form Component
 * For creating/editing cutting, pruning, violation requests
 * Links to existing trees or creates new tree records
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/presentation/components/shared/ui/dialog";
import {
  Axe,
  Scissors,
  AlertTriangle,
  Plus,
  X,
  Search,
  TreePine,
  MapPin,
  DollarSign,
  Link as LinkIcon,
} from "lucide-react";
import {
  TreeManagementRequest,
  TreeManagementRequestCreate,
  RequestType,
  NewTreeEntry,
} from "@/core/api/tree-management-request-api";
import { useTreeManagementRequestMutations } from "../logic/useTreeManagementRequests";
import { useTreeInventory } from "../../tree-inventory/logic/useTreeInventory";
import { TreeInventory } from "@/core/api/tree-inventory-api";
import { fetchUrbanGreeningFeeRecords, UrbanGreeningFeeRecord, createUrbanGreeningFeeRecord, UrbanGreeningFeeRecordCreate } from "@/core/api/fee-api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TreeRequestFormProps {
  mode: "add" | "edit";
  initialData?: TreeManagementRequest | null;
  onClose: () => void;
  onSuccess: () => void;
}

const REQUEST_TYPES: { value: RequestType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "cutting",
    label: "Tree Cutting",
    icon: <Axe className="w-5 h-5" />,
    description: "Request to cut down a tree",
  },
  {
    value: "pruning",
    label: "Pruning",
    icon: <Scissors className="w-5 h-5" />,
    description: "Request to trim or prune branches",
  },
  {
    value: "violation",
    label: "Violation Report",
    icon: <AlertTriangle className="w-5 h-5" />,
    description: "Report illegal cutting or damage",
  },
];

const TreeRequestForm: React.FC<TreeRequestFormProps> = ({
  mode,
  initialData,
  onClose,
  onSuccess,
}) => {
  const { createMutation, updateMutation } = useTreeManagementRequestMutations();
  const queryClient = useQueryClient();
  
  // Fee creation mutation
  const createFeeMutation = useMutation({
    mutationFn: createUrbanGreeningFeeRecord,
    onSuccess: (newFee) => {
      queryClient.invalidateQueries({ queryKey: ["fee-records"] });
      setLinkedFeeId(newFee.id);
      setShowCreateFee(false);
      setNewFeeData({
        type: "cutting_permit",
        amount: 0,
        payer_name: "",
        date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "pending",
      });
    },
  });
  
  // Form state
  const [requestType, setRequestType] = useState<RequestType>(initialData?.request_type || "cutting");
  const [requesterName, setRequesterName] = useState(initialData?.requester_name || "");
  const [requesterContact, setRequesterContact] = useState(initialData?.requester_contact || "");
  const [requesterEmail, setRequesterEmail] = useState(initialData?.requester_email || "");
  const [propertyAddress, setPropertyAddress] = useState(initialData?.property_address || "");
  const [barangay, setBarangay] = useState(initialData?.barangay || "");
  const [reason, setReason] = useState(initialData?.reason || "");
  const [urgency, setUrgency] = useState<"low" | "normal" | "high" | "emergency">(
    initialData?.urgency || "normal"
  );
  const [notes, setNotes] = useState(initialData?.approval_notes || "");
  const [inspectors, setInspectors] = useState<string[]>(initialData?.inspectors || []);
  const [newInspectorName, setNewInspectorName] = useState("");

  // Fee state
  const [linkedFeeId, setLinkedFeeId] = useState<string | undefined>(initialData?.fee_record_id);
  const [showFeeSearch, setShowFeeSearch] = useState(false);
  const [feeSearchTerm, setFeeSearchTerm] = useState("");
  const [showCreateFee, setShowCreateFee] = useState(false);
  const [newFeeData, setNewFeeData] = useState<UrbanGreeningFeeRecordCreate>({
    type: "cutting_permit",
    amount: 0,
    payer_name: "",
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "pending",
  });

  // Tree selection state
  const [selectedTreeIds, setSelectedTreeIds] = useState<string[]>(initialData?.linked_tree_ids || []);
  const [newTrees, setNewTrees] = useState<NewTreeEntry[]>(initialData?.new_trees || []);
  const [treeSearchTerm, setTreeSearchTerm] = useState("");
  const [showTreeSearch, setShowTreeSearch] = useState(false);

  // Fetch existing trees for linking
  const { data: existingTrees = [] } = useTreeInventory({ status: "alive" });

  // Fetch fee records for linking
  const { data: feeRecords = [] } = useQuery({
    queryKey: ["fee-records"],
    queryFn: () => fetchUrbanGreeningFeeRecords(),
  });

  // Filter trees for search
  const filteredTrees = existingTrees.filter((tree) => {
    if (!treeSearchTerm) return true;
    const search = treeSearchTerm.toLowerCase();
    return (
      tree.tree_code.toLowerCase().includes(search) ||
      tree.common_name.toLowerCase().includes(search) ||
      tree.address?.toLowerCase().includes(search) ||
      tree.barangay?.toLowerCase().includes(search)
    );
  });

  // Filter fee records for search
  const filteredFeeRecords = feeRecords.filter((fee) => {
    if (!feeSearchTerm) return true;
    const search = feeSearchTerm.toLowerCase();
    return (
      fee.reference_number.toLowerCase().includes(search) ||
      fee.payer_name.toLowerCase().includes(search) ||
      fee.type.toLowerCase().includes(search)
    );
  });

  const handleAddExistingTree = (tree: TreeInventory) => {
    if (!selectedTreeIds.includes(tree.id)) {
      setSelectedTreeIds([...selectedTreeIds, tree.id]);
    }
    setShowTreeSearch(false);
    setTreeSearchTerm("");
  };

  const handleRemoveExistingTree = (treeId: string) => {
    setSelectedTreeIds(selectedTreeIds.filter((id) => id !== treeId));
  };

  const handleAddNewTree = () => {
    setNewTrees([
      ...newTrees,
      {
        common_name: "",
        species: "",
        address: propertyAddress,
        condition: "healthy",
        notes: "",
      },
    ]);
  };

  const handleUpdateNewTree = (index: number, field: keyof NewTreeEntry, value: any) => {
    const updated = [...newTrees];
    updated[index] = { ...updated[index], [field]: value };
    setNewTrees(updated);
  };

  const handleRemoveNewTree = (index: number) => {
    setNewTrees(newTrees.filter((_, i) => i !== index));
  };

  const handleCreateFee = async () => {
    if (!newFeeData.payer_name || newFeeData.amount <= 0) return;
    await createFeeMutation.mutateAsync(newFeeData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: TreeManagementRequestCreate = {
      fee_record_id: linkedFeeId,
      request_type: requestType,
      requester_name: requesterName,
      requester_contact: requesterContact || undefined,
      requester_email: requesterEmail || undefined,
      property_address: propertyAddress,
      barangay: barangay || undefined,
      reason,
      urgency,
      linked_tree_ids: selectedTreeIds.length > 0 ? selectedTreeIds : undefined,
      new_trees: newTrees.length > 0 ? newTrees.filter((t) => t.common_name) : undefined,
      inspectors: inspectors.length > 0 ? inspectors : undefined,
      notes: notes || undefined,
    };

    try {
      if (mode === "add") {
        await createMutation.mutateAsync(data);
      } else if (initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: {
            inspection_notes: notes || undefined,
          },
        });
      }
      onSuccess();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const selectedTreesData = existingTrees.filter((t) => selectedTreeIds.includes(t.id));
  const totalTrees = selectedTreeIds.length + newTrees.filter((t) => t.common_name).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Request Type Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Request Type</Label>
        <div className="grid grid-cols-3 gap-3">
          {REQUEST_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setRequestType(type.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                requestType === type.value
                  ? "border-[#0033a0] bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={requestType === type.value ? "text-[#0033a0]" : "text-gray-500"}>
                  {type.icon}
                </span>
                <span className="font-medium">{type.label}</span>
              </div>
              <p className="text-xs text-gray-500">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Requester Information */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Requester Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requesterName">Full Name *</Label>
              <Input
                id="requesterName"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="Juan Dela Cruz"
                required
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requesterContact">Contact Number</Label>
              <Input
                id="requesterContact"
                value={requesterContact}
                onChange={(e) => setRequesterContact(e.target.value)}
                placeholder="09XX XXX XXXX"
                className="rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requesterEmail">Email</Label>
              <Input
                id="requesterEmail"
                type="email"
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
                placeholder="email@example.com"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barangay">Barangay</Label>
              <Input
                id="barangay"
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                placeholder="Barangay name"
                className="rounded-lg"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="propertyAddress">Property Address *</Label>
            <Textarea
              id="propertyAddress"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="Complete address where the tree is located"
              required
              className="rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trees Selection */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TreePine className="w-5 h-5" />
              Trees ({totalTrees})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTreeSearch(true)}
                className="rounded-lg"
              >
                <Search className="w-4 h-4 mr-1" />
                Link Existing
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewTree}
                className="rounded-lg"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Existing Trees */}
          {selectedTreesData.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Linked Trees from Inventory</Label>
              <div className="space-y-2">
                {selectedTreesData.map((tree) => (
                  <div
                    key={tree.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <TreePine className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">{tree.common_name}</div>
                        <div className="text-xs text-gray-500">
                          {tree.tree_code} • {tree.address || tree.barangay || "No location"}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExistingTree(tree.id)}
                      className="h-8 w-8 text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Trees */}
          {newTrees.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">New Tree Records</Label>
              <div className="space-y-3">
                {newTrees.map((tree, index) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-white">
                        New Tree #{index + 1}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveNewTree(index)}
                        className="h-8 w-8 text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Common Name *</Label>
                        <Input
                          value={tree.common_name}
                          onChange={(e) => handleUpdateNewTree(index, "common_name", e.target.value)}
                          placeholder="e.g., Mango"
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Scientific Name</Label>
                        <Input
                          value={tree.species || ""}
                          onChange={(e) => handleUpdateNewTree(index, "species", e.target.value)}
                          placeholder="e.g., Mangifera indica"
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Condition</Label>
                        <select
                          value={tree.condition || "healthy"}
                          onChange={(e) => handleUpdateNewTree(index, "condition", e.target.value)}
                          className="h-9 w-full px-3 rounded-lg border border-gray-200 text-sm"
                        >
                          <option value="healthy">Healthy</option>
                          <option value="diseased">Diseased</option>
                          <option value="damaged">Damaged</option>
                          <option value="dead">Dead</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Address</Label>
                        <Input
                          value={tree.address || ""}
                          onChange={(e) => handleUpdateNewTree(index, "address", e.target.value)}
                          placeholder="Tree location"
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        value={tree.notes || ""}
                        onChange={(e) => handleUpdateNewTree(index, "notes", e.target.value)}
                        placeholder="Additional information about this tree"
                        rows={2}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedTreeIds.length === 0 && newTrees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <TreePine className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No trees added yet</p>
              <p className="text-xs">Link existing trees or add new ones</p>
            </div>
          )}

          {/* Tree Search Modal */}
          {showTreeSearch && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Search Trees in Inventory</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowTreeSearch(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={treeSearchTerm}
                    onChange={(e) => setTreeSearchTerm(e.target.value)}
                    placeholder="Search by code, species, or location..."
                    className="pl-9 rounded-lg"
                    autoFocus
                  />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {filteredTrees.slice(0, 20).map((tree) => (
                    <button
                      key={tree.id}
                      type="button"
                      onClick={() => handleAddExistingTree(tree)}
                      disabled={selectedTreeIds.includes(tree.id)}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        selectedTreeIds.includes(tree.id)
                          ? "bg-gray-100 border-gray-200 opacity-50"
                          : "border-gray-200 hover:border-[#0033a0] hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <TreePine className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <div className="font-medium">{tree.common_name}</div>
                          <div className="text-xs text-gray-500">
                            {tree.tree_code} • {tree.species || "No scientific name"}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {tree.address || tree.barangay || "No location"}
                          </div>
                        </div>
                        {selectedTreeIds.includes(tree.id) && (
                          <Badge variant="secondary">Added</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                  {filteredTrees.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No trees found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Request</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this request is being made..."
              rows={4}
              className="rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <select
                id="urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="h-9 w-full px-3 rounded-lg border border-gray-200 text-sm"
              >
                <option value="low">Low - Can wait</option>
                <option value="normal">Normal</option>
                <option value="high">High - Urgent</option>
                <option value="emergency">Emergency - Immediate</option>
              </select>
            </div>
          </div>
          
          {/* Inspectors Section */}
          <div className="space-y-2">
            <Label>Inspectors</Label>
            <div className="space-y-2">
              {inspectors.map((inspector, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={inspector}
                    onChange={(e) => {
                      const updated = [...inspectors];
                      updated[index] = e.target.value;
                      setInspectors(updated);
                    }}
                    placeholder="Inspector name"
                    className="rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setInspectors(inspectors.filter((_, i) => i !== index))}
                    className="text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newInspectorName}
                  onChange={(e) => setNewInspectorName(e.target.value)}
                  placeholder="Add inspector name"
                  className="rounded-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newInspectorName.trim()) {
                        setInspectors([...inspectors, newInspectorName.trim()]);
                        setNewInspectorName("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newInspectorName.trim()) {
                      setInspectors([...inspectors, newInspectorName.trim()]);
                      setNewInspectorName("");
                    }
                  }}
                  disabled={!newInspectorName.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other information..."
              rows={2}
              className="rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fee Record Section */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Fee Record
            </CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreateFee(true);
                  setShowFeeSearch(false);
                  setNewFeeData({
                    ...newFeeData,
                    payer_name: requesterName,
                    type: requestType === "cutting" ? "cutting_permit" : requestType === "pruning" ? "pruning_permit" : "violation_fine",
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Create New Fee
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowFeeSearch(!showFeeSearch);
                  setShowCreateFee(false);
                }}
              >
                {linkedFeeId ? <X className="w-4 h-4 mr-1" /> : <LinkIcon className="w-4 h-4 mr-1" />}
                {linkedFeeId ? "Unlink Fee" : "Link Existing Fee"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {linkedFeeId && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-green-800">
                    Fee Record Linked
                  </div>
                  <div className="text-xs text-green-600">
                    {feeRecords.find(f => f.id === linkedFeeId)?.reference_number || linkedFeeId}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLinkedFeeId(undefined);
                    setShowFeeSearch(false);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {showFeeSearch && !linkedFeeId && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search fee records by reference number, payer name, or type..."
                  value={feeSearchTerm}
                  onChange={(e) => setFeeSearchTerm(e.target.value)}
                  className="pl-9 rounded-lg"
                />
              </div>
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                {filteredFeeRecords.slice(0, 20).map((fee) => (
                  <button
                    key={fee.id}
                    type="button"
                    onClick={() => {
                      setLinkedFeeId(fee.id);
                      setShowFeeSearch(false);
                      setFeeSearchTerm("");
                    }}
                    className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">
                            {fee.reference_number}
                          </span>
                          <Badge
                            className={
                              fee.type === "cutting_permit"
                                ? "bg-red-100 text-red-800"
                                : fee.type === "pruning_permit"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-orange-100 text-orange-800"
                            }
                          >
                            {fee.type.replace("_", " ")}
                          </Badge>
                          <Badge
                            className={
                              fee.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : fee.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {fee.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {fee.payer_name} • ₱{fee.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(fee.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredFeeRecords.length === 0 && (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No fee records found
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Or create a new fee record in the Fee Management page
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending || totalTrees === 0}
          className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : mode === "add"
            ? "Submit Request"
            : "Update Request"}
        </Button>
      </div>

      {/* Create Fee Dialog */}
      <Dialog open={showCreateFee} onOpenChange={setShowCreateFee}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle>Create New Fee Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feeType">Fee Type *</Label>
              <select
                id="feeType"
                value={newFeeData.type}
                onChange={(e) => setNewFeeData({ ...newFeeData, type: e.target.value as any })}
                className="h-9 w-full px-3 rounded-lg border border-gray-200 text-sm"
              >
                <option value="cutting_permit">Cutting Permit</option>
                <option value="pruning_permit">Pruning Permit</option>
                <option value="violation_fine">Violation Fine</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feePayerName">Payer Name *</Label>
                <Input
                  id="feePayerName"
                  value={newFeeData.payer_name}
                  onChange={(e) => setNewFeeData({ ...newFeeData, payer_name: e.target.value })}
                  placeholder="Full name"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeAmount">Amount (₱) *</Label>
                <Input
                  id="feeAmount"
                  type="number"
                  min={0}
                  step={0.01}
                  value={newFeeData.amount}
                  onChange={(e) => setNewFeeData({ ...newFeeData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feeDate">Date *</Label>
                <Input
                  id="feeDate"
                  type="date"
                  value={newFeeData.date}
                  onChange={(e) => setNewFeeData({ ...newFeeData, date: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeDueDate">Due Date *</Label>
                <Input
                  id="feeDueDate"
                  type="date"
                  value={newFeeData.due_date}
                  onChange={(e) => setNewFeeData({ ...newFeeData, due_date: e.target.value })}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeStatus">Status *</Label>
              <select
                id="feeStatus"
                value={newFeeData.status}
                onChange={(e) => setNewFeeData({ ...newFeeData, status: e.target.value as any })}
                className="h-9 w-full px-3 rounded-lg border border-gray-200 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {newFeeData.status === "paid" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feeOrNumber">OR Number</Label>
                  <Input
                    id="feeOrNumber"
                    value={newFeeData.or_number || ""}
                    onChange={(e) => setNewFeeData({ ...newFeeData, or_number: e.target.value })}
                    placeholder="Official Receipt Number"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feePaymentDate">Payment Date</Label>
                  <Input
                    id="feePaymentDate"
                    type="date"
                    value={newFeeData.payment_date || ""}
                    onChange={(e) => setNewFeeData({ ...newFeeData, payment_date: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateFee(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateFee}
              disabled={!newFeeData.payer_name || newFeeData.amount <= 0 || createFeeMutation.isPending}
              className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
            >
              {createFeeMutation.isPending ? "Creating..." : "Create & Link Fee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default TreeRequestForm;
