import React, { useState, useMemo } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/shared/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/presentation/components/shared/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllProcessingStandards,
  updateProcessingStandards,
  deleteProcessingStandards,
  ProcessingStandards,
  ISORequestType,
  fetchTreeRequests, // Need to import this to scan for types
} from "@/core/api/tree-management-request-api";
import { toast } from "sonner";
import { Clock, Plus, Trash2, Save, RefreshCw, AlertTriangle, ScanSearch } from "lucide-react";

const StandardsConfiguration: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingStandards, setEditingStandards] = useState<Record<string, Partial<ProcessingStandards>>>({});
  const [isAddStandardOpen, setIsAddStandardOpen] = useState(false);
  const [newStandardName, setNewStandardName] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
    description: string;
  }>({
    isOpen: false,
    id: '',
    title: '',
    description: '',
  });

  const { data: standards = [], isLoading } = useQuery({
    queryKey: ["processing-standards"],
    queryFn: fetchAllProcessingStandards,
  });

  // Fetch recent requests to find unconfigured types
  const { data: recentRequests = [] } = useQuery({
    queryKey: ["tree-requests-scan"],
    queryFn: () => fetchTreeRequests({ limit: 100 }), // Fetch last 100 requests to scan
    staleTime: 60 * 1000, 
  });

  // Derived list of detected but unconfigured types
  const detectedMissingTypes = useMemo(() => {
    if (!standards || !recentRequests) return [];
    
    const configuredTypes = new Set(standards.map(s => s.request_type));
    const usedTypes = new Set(recentRequests.map(r => r.request_type));
    
    // Filter types that are used but not in configuredTypes
    return Array.from(usedTypes).filter(type => !configuredTypes.has(type));
  }, [standards, recentRequests]);

  const updateMutation = useMutation({
    mutationFn: ({ requestType, data }: { requestType: ISORequestType; data: any }) =>
      updateProcessingStandards(requestType, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processing-standards"] });
      queryClient.invalidateQueries({ queryKey: ["tree-requests"] }); // To update SLA flags
      toast.success("Processing standards updated successfully");
      setEditingStandards({});
    },
    onError: (error: any) => {
      toast.error(`Failed to update standards: ${error.message}`);
    },
  });

  const deleteStandardMutation = useMutation({
    mutationFn: (requestType: ISORequestType) => deleteProcessingStandards(requestType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processing-standards"] });
      queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
      toast.success("Processing standards deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete standards: ${error.message}`);
    },
  });

  const handleFieldChange = (requestType: string, field: string, value: string) => {
    setEditingStandards(prev => ({
      ...prev,
      [requestType]: {
        ...prev[requestType],
        [field]: parseInt(value) || 0,
      },
    }));
  };

  const handleSave = (standard: ProcessingStandards) => {
    const updates = editingStandards[standard.request_type];
    if (!updates || Object.keys(updates).length === 0) {
      toast.info("No changes to save");
      return;
    }

    updateMutation.mutate({
      requestType: standard.request_type as ISORequestType,
      data: updates,
    });
  };

  const handleDeleteStandard = (requestType: ISORequestType) => {
    setDeleteDialog({
      isOpen: true,
      id: requestType,
      title: "Delete Processing Standard",
      description: `Are you sure you want to delete processing standards for "${requestType}"? This will remove standard processing day constraints for this request type.`
    });
  };

  const confirmDelete = () => {
    deleteStandardMutation.mutate(deleteDialog.id as ISORequestType);
    setDeleteDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleAddStandard = () => {
    if (!newStandardName.trim()) {
      toast.error("Request type name is required");
      return;
    }

    createStandard(newStandardName.trim());
    setIsAddStandardOpen(false);
    setNewStandardName("");
  };

  const createStandard = (type: string) => {
    updateMutation.mutate({
      requestType: type as ISORequestType,
      data: {
        receiving_standard_days: 3,
        inspection_standard_days: 7,
        requirements_standard_days: 10,
        clearance_standard_days: 5,
      },
    });
  };

  const getDisplayValue = (standard: ProcessingStandards, field: keyof ProcessingStandards): number => {
    const editing = editingStandards[standard.request_type];
    if (editing && field in editing) {
      return editing[field] as number;
    }
    return standard[field] as number;
  };

  const hasChanges = (requestType: string): boolean => {
    const changes = editingStandards[requestType];
    return changes && Object.keys(changes).length > 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Standard Processing Days
              </CardTitle>
              <CardDescription className="mt-1">
                Configure allowed processing time (in days) for each phase.
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddStandardOpen(true)}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Request Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
           {/* Detected Types Alert */}
           {detectedMissingTypes.length > 0 && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
               <div className="flex items-start gap-3">
                  <ScanSearch className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                     <h4 className="text-sm font-semibold text-amber-800">Detected Unconfigured Request Types</h4>
                     <p className="text-sm text-amber-700 mt-1 mb-2">
                        The following request types were found in recent records but don't have processing standards set:
                     </p>
                     <div className="flex flex-wrap gap-2">
                        {detectedMissingTypes.map(type => (
                           <div key={type} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-amber-200 text-sm shadow-sm">
                              <span className="font-medium">{type}</span>
                              <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 -mr-1"
                                 onClick={() => createStandard(type)}
                              >
                                 Add Configuration
                              </Button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground/50" />
              <p>Loading standards configuration...</p>
            </div>
          ) : standards && standards.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[200px]">Request Type</TableHead>
                    <TableHead className="text-center w-[120px]">Receiving</TableHead>
                    <TableHead className="text-center w-[120px]">Inspection</TableHead>
                    <TableHead className="text-center w-[120px]">Requirements</TableHead>
                    <TableHead className="text-center w-[120px]">Clearance</TableHead>
                    <TableHead className="text-center w-[80px]">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standards.map((standard) => {
                    const receiving = getDisplayValue(standard, 'receiving_standard_days');
                    const inspection = getDisplayValue(standard, 'inspection_standard_days');
                    const requirements = getDisplayValue(standard, 'requirements_standard_days');
                    const clearance = getDisplayValue(standard, 'clearance_standard_days');
                    const total = receiving + inspection + requirements + clearance;
                    const isChanged = hasChanges(standard.request_type);

                    return (
                      <TableRow key={standard.id} className={isChanged ? "bg-muted/30" : ""}>
                        <TableCell className="font-medium capitalize py-4">
                          <div className="flex items-center gap-2">
                            {standard.request_type}
                            {isChanged && <span className="w-2 h-2 rounded-full bg-yellow-500" title="Unsaved changes" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={receiving}
                            onChange={(e) => handleFieldChange(standard.request_type, 'receiving_standard_days', e.target.value)}
                            className="w-16 mx-auto text-center h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={inspection}
                            onChange={(e) => handleFieldChange(standard.request_type, 'inspection_standard_days', e.target.value)}
                            className="w-16 mx-auto text-center h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={requirements}
                            onChange={(e) => handleFieldChange(standard.request_type, 'requirements_standard_days', e.target.value)}
                            className="w-16 mx-auto text-center h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={clearance}
                            onChange={(e) => handleFieldChange(standard.request_type, 'clearance_standard_days', e.target.value)}
                            className="w-16 mx-auto text-center h-8"
                          />
                        </TableCell>
                        <TableCell className="text-center font-semibold text-muted-foreground">
                          {total}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isChanged ? (
                              <Button
                                size="sm"
                                onClick={() => handleSave(standard)}
                                disabled={updateMutation.isPending}
                                className="h-8"
                              >
                                <Save className="w-3.5 h-3.5 mr-1" />
                                Save
                              </Button>
                            ) : (
                                <div className="w-[68px]" />
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteStandard(standard.request_type)}
                              disabled={deleteStandardMutation.isPending}
                              className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              title="Delete Configuration"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">No processing standards found</p>
              <Button onClick={() => setIsAddStandardOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Request Type
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Configuration Guidelines</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <strong className="text-foreground block mb-1">Receiving Phase</strong>
                Time from initial receipt to forwarding to inspectors
              </div>
              <div>
                <strong className="text-foreground block mb-1">Inspection Phase</strong>
                Time for site inspection and report submission
              </div>
              <div>
                <strong className="text-foreground block mb-1">Requirements Phase</strong>
                Time for applicant to submit all required documents
              </div>
              <div>
                <strong className="text-foreground block mb-1">Clearance Phase</strong>
                Time for final approval and clearance issuance
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Add Standard Dialog */}
      <Dialog open={isAddStandardOpen} onOpenChange={setIsAddStandardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Request Type Standard</DialogTitle>
            <DialogDescription>
              Add a configuration for a new request type. Default values will be set and can be modified later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Request Type Name</Label>
              <Input
                value={newStandardName}
                onChange={(e) => setNewStandardName(e.target.value)}
                placeholder="Enter request type (e.g., Bamboo Planting)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStandardOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStandard}>
              Add Request Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {deleteDialog.title}
            </DialogTitle>
            <DialogDescription>
              {deleteDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StandardsConfiguration;
