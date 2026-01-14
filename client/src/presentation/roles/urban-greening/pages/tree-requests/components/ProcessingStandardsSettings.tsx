// client/src/presentation/roles/urban-greening/pages/tree-requests/components/ProcessingStandardsSettings.tsx
/**
 * Processing Standards Configuration
 * Admin page for setting standard processing timeframes for each request type
 * and managing dropdown options for form fields with drag-and-drop reordering
 */

import React, { useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllProcessingStandards,
  updateProcessingStandards,
  ProcessingStandards,
  ISORequestType,
  fetchDropdownOptions,
  createDropdownOption,
  updateDropdownOption,
  deleteDropdownOption,
  DropdownOption,
  DropdownOptionCreate,
  DropdownOptionUpdate,
} from "@/core/api/tree-management-request-api";
import { toast } from "sonner";
import { Settings, Save, Clock, Plus, Trash2, GripVertical, List } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable item component for drag and drop
interface SortableItemProps {
  id: string;
  option: DropdownOption;
  onDelete: (id: string) => void;
  onEdit: (option: DropdownOption) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, option, onDelete, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-10">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell>{option.option_value}</TableCell>
      <TableCell className="text-right space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(option)}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(option.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

const ProcessingStandardsSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingStandards, setEditingStandards] = useState<Record<string, Partial<ProcessingStandards>>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<DropdownOption | null>(null);
  const [selectedField, setSelectedField] = useState<'received_through' | 'status'>('received_through');
  const [formData, setFormData] = useState({ option_value: '' });
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: standards, isLoading } = useQuery({
    queryKey: ["processing-standards"],
    queryFn: fetchAllProcessingStandards,
  });

  const { data: receivedThroughOptions = [] } = useQuery({
    queryKey: ["dropdown-options", "received_through"],
    queryFn: () => fetchDropdownOptions("received_through"),
  });

  const { data: statusOptions = [] } = useQuery({
    queryKey: ["dropdown-options", "status"],
    queryFn: () => fetchDropdownOptions("status"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ requestType, data }: { requestType: ISORequestType; data: any }) =>
      updateProcessingStandards(requestType, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processing-standards"] });
      queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
      toast.success("Processing standards updated successfully");
      setEditingStandards({});
    },
    onError: (error: any) => {
      toast.error(`Failed to update standards: ${error.message}`);
    },
  });

  const createOptionMutation = useMutation({
    mutationFn: (data: DropdownOptionCreate) => createDropdownOption(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dropdown-options"] });
      toast.success("Option created successfully");
      setIsDialogOpen(false);
      setFormData({ option_value: '' });
    },
    onError: (error: any) => {
      toast.error(`Failed to create option: ${error.message}`);
    },
  });

  const updateOptionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DropdownOptionUpdate }) =>
      updateDropdownOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dropdown-options"] });
      toast.success("Option updated successfully");
      setIsDialogOpen(false);
      setEditingOption(null);
      setFormData({ option_value: '' });
    },
    onError: (error: any) => {
      toast.error(`Failed to update option: ${error.message}`);
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: (id: string) => deleteDropdownOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dropdown-options"] });
      toast.success("Option deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete option: ${error.message}`);
    },
  });
  
  // Handle drag end for reordering
  const handleDragEnd = (event: DragEndEvent, fieldName: 'received_through' | 'status') => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const options = fieldName === 'received_through' ? receivedThroughOptions : statusOptions;
    const oldIndex = options.findIndex((item) => item.id === active.id);
    const newIndex = options.findIndex((item) => item.id === over.id);

    const reorderedOptions = arrayMove(options, oldIndex, newIndex);

    // Update display_order for all affected items
    const updates = reorderedOptions.map((option, index) => ({
      id: option.id,
      data: { display_order: index + 1 },
    }));

    // Execute all updates
    Promise.all(
      updates.map(({ id, data }) => updateDropdownOption(id, data))
    ).then(() => {
      queryClient.invalidateQueries({ queryKey: ["dropdown-options"] });
      toast.success("Options reordered successfully");
    }).catch((error) => {
      toast.error(`Failed to reorder: ${error.message}`);
    });
  };

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

  const handleOpenDialog = (field: 'received_through' | 'status', option?: DropdownOption) => {
    setSelectedField(field);
    if (option) {
      setEditingOption(option);
      setFormData({ option_value: option.option_value });
    } else {
      setEditingOption(null);
      setFormData({ option_value: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSaveOption = () => {
    if (!formData.option_value.trim()) {
      toast.error("Option value is required");
      return;
    }

    if (editingOption) {
      updateOptionMutation.mutate({ id: editingOption.id, data: formData });
    } else {
      const currentOptions = selectedField === 'received_through' ? receivedThroughOptions : statusOptions;
      createOptionMutation.mutate({ 
        field_name: selectedField, 
        option_value: formData.option_value,
        display_order: currentOptions.length + 1,
      });
    }
  };

  const handleDeleteOption = (id: string) => {
    if (confirm("Are you sure you want to delete this option?")) {
      deleteOptionMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Processing Standards Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure the standard processing timeframes for each phase of tree requests. 
            These standards are used to determine if a request is delayed.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Standard Processing Days by Request Type
          </CardTitle>
          <CardDescription>
            Set the expected number of days for each processing phase. Requests exceeding these timeframes will be flagged as delayed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : standards && standards.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Type</TableHead>
                  <TableHead className="text-center">Receiving Phase (days)</TableHead>
                  <TableHead className="text-center">Inspection Phase (days)</TableHead>
                  <TableHead className="text-center">Requirements Phase (days)</TableHead>
                  <TableHead className="text-center">Clearance Phase (days)</TableHead>
                  <TableHead className="text-center">Total Days</TableHead>
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

                  return (
                    <TableRow key={standard.id}>
                      <TableCell className="font-medium capitalize">
                        {standard.request_type}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={receiving}
                          onChange={(e) => handleFieldChange(standard.request_type, 'receiving_standard_days', e.target.value)}
                          className="w-20 mx-auto text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={inspection}
                          onChange={(e) => handleFieldChange(standard.request_type, 'inspection_standard_days', e.target.value)}
                          className="w-20 mx-auto text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={requirements}
                          onChange={(e) => handleFieldChange(standard.request_type, 'requirements_standard_days', e.target.value)}
                          className="w-20 mx-auto text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={clearance}
                          onChange={(e) => handleFieldChange(standard.request_type, 'clearance_standard_days', e.target.value)}
                          className="w-20 mx-auto text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {total}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleSave(standard)}
                          disabled={!hasChanges(standard.request_type) || updateMutation.isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No processing standards found
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Received Through Options */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Received Through Options
              </CardTitle>
              <Button
                size="sm"
                onClick={() => handleOpenDialog('received_through')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
            <CardDescription>
              Manage dropdown options for how requests are received. Drag items to reorder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(event, 'received_through')}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Option</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={receivedThroughOptions.map(o => o.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {receivedThroughOptions.map((option) => (
                      <SortableItem
                        key={option.id}
                        id={option.id}
                        option={option}
                        onDelete={handleDeleteOption}
                        onEdit={(opt) => handleOpenDialog('received_through', opt)}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </CardContent>
        </Card>

        {/* Status Options */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Status Options
              </CardTitle>
              <Button
                size="sm"
                onClick={() => handleOpenDialog('status')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
            <CardDescription>
              Manage dropdown options for request status. Drag items to reorder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(event, 'status')}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Option</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={statusOptions.map(o => o.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {statusOptions.map((option) => (
                      <SortableItem
                        key={option.id}
                        id={option.id}
                        option={option}
                        onDelete={handleDeleteOption}
                        onEdit={(opt) => handleOpenDialog('status', opt)}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOption ? 'Edit' : 'Add'} {selectedField === 'received_through' ? 'Received Through' : 'Status'} Option
            </DialogTitle>
            <DialogDescription>
              {editingOption ? 'Update the option value below' : 'Add a new option to the dropdown. Use drag and drop to reorder options.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Option Value</Label>
              <Input
                value={formData.option_value}
                onChange={(e) => setFormData({ ...formData, option_value: e.target.value })}
                placeholder="Enter option value"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOption}>
              {editingOption ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">Receiving Phase:</strong> Time from initial receipt to forwarding to inspectors
          </div>
          <div>
            <strong className="text-foreground">Inspection Phase:</strong> Time for site inspection and report submission
          </div>
          <div>
            <strong className="text-foreground">Requirements Phase:</strong> Time for applicant to submit all required documents
          </div>
          <div>
            <strong className="text-foreground">Clearance Phase:</strong> Time for final approval and clearance issuance
          </div>
          <div className="pt-3 border-t">
            <strong className="text-foreground">Note:</strong> These standards are based on the Citizen's Charter and should be updated according to official policy changes.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingStandardsSettings;
