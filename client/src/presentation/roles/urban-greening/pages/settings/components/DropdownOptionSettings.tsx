import React, { useState } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/presentation/components/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/shared/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDropdownOptions,
  createDropdownOption,
  updateDropdownOption,
  deleteDropdownOption,
  DropdownOption,
  DropdownOptionCreate,
  DropdownOptionUpdate,
} from "@/core/api/tree-management-request-api";
import { toast } from "sonner";
import { List, Plus, Trash2, GripVertical, Pencil, AlertTriangle } from "lucide-react";
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

// Sortable item component
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
          size="icon"
          variant="ghost"
          onClick={() => onEdit(option)}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Edit option"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(option.id)}
          className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          title="Delete option"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

const DropdownOptionSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("receiving");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<DropdownOption | null>(null);
  const [targetFieldKey, setTargetFieldKey] = useState<string>(''); // e.g., 'status_receiving'
  const [targetFieldLabel, setTargetFieldLabel] = useState<string>(''); // e.g., 'Status'
  const [formData, setFormData] = useState({ option_value: '' });
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

  // Phases configuration
  const phases = {
    receiving: { 
        label: "Receiving Phase", 
        fields: [
            { key: "status_receiving", label: "Status Options" },
            { key: "received_through", label: "Received Through Options" }
        ]
    },
    requirements: { 
        label: "Requirements Phase", 
        fields: [
            { key: "status_requirements", label: "Status Options" }
        ]
    },
    clearance: { 
        label: "Clearance Phase", 
        fields: [
            { key: "status_clearance", label: "Status Options" }
        ]
    },
    denr: { 
        label: "DENR Phase", 
        fields: [
            { key: "status_denr", label: "Status Options" }
        ]
    }
  };

  // Fetch all needed queries
  // We can just fetch them dynamically or use a single query that filters.
  // Ideally, react-query should handle caching.
  
  // Helper to fetch options for a specific field key
  const useOptions = (fieldKey: string) => {
      return useQuery({
          queryKey: ["dropdown-options", fieldKey],
          queryFn: () => fetchDropdownOptions(fieldKey),
      });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent, fieldKey: string, currentOptions: DropdownOption[]) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = currentOptions.findIndex((item) => item.id === active.id);
    const newIndex = currentOptions.findIndex((item) => item.id === over.id);

    const reorderedOptions = arrayMove(currentOptions, oldIndex, newIndex);

    const updates = reorderedOptions.map((option, index) => ({
      id: option.id,
      data: { display_order: index + 1 },
    }));

    Promise.all(
      updates.map(({ id, data }) => updateDropdownOption(id, data))
    ).then(() => {
      queryClient.invalidateQueries({ queryKey: ["dropdown-options", fieldKey] });
      toast.success("Options reordered successfully");
    }).catch((error) => {
      toast.error(`Failed to reorder: ${error.message}`);
    });
  };

  const handleOpenDialog = (fieldKey: string, fieldLabel: string, option?: DropdownOption) => {
    setTargetFieldKey(fieldKey);
    setTargetFieldLabel(fieldLabel);
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
      // Need current options count for display_order. We can fetch it or just default to 0 and let reorder fix it?
      // Better to fetch. But react-query cache should have it. 
      // Simplified: Just put at end or 0. Since we invalidate, it's fine.
      // To get accurate length, we'd need to access the query data.
      // For now, we'll let existing logic handle it or 0.
      const currentOptions = queryClient.getQueryData<DropdownOption[]>(["dropdown-options", targetFieldKey]) || [];
      
      createOptionMutation.mutate({ 
        field_name: targetFieldKey, 
        option_value: formData.option_value,
        display_order: currentOptions.length + 1,
      });
    }
  };

  const handleDeleteOption = (id: string) => {
    setDeleteDialog({
      isOpen: true,
      id: id,
      title: "Delete Option",
      description: "Are you sure you want to delete this option? This action cannot be undone."
    });
  };

  const confirmDelete = () => {
    deleteOptionMutation.mutate(deleteDialog.id);
    setDeleteDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Helper component to render a list for a field
  const OptionList = ({ fieldKey, fieldLabel }: { fieldKey: string, fieldLabel: string }) => {
      const { data: options = [], isLoading } = useOptions(fieldKey);
      
      return (
        <Card className="mb-6">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <List className="w-4 h-4" />
                        {fieldLabel}
                    </CardTitle>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(fieldKey, fieldLabel)}
                        className="h-8"
                    >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                 <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, fieldKey, options)}
                 >
                     <div className="rounded-md border max-h-[400px] overflow-y-auto">
                        <Table>
                            <TableBody>
                                <SortableContext
                                    items={options.map(o => o.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                     {isLoading ? (
                                          <TableRow>
                                            <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-sm">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                     ) : options.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-sm">
                                                No options configured.
                                            </TableCell>
                                        </TableRow>
                                     ) : (
                                         options.map((option) => (
                                            <SortableItem
                                                key={option.id}
                                                id={option.id}
                                                option={option}
                                                onDelete={handleDeleteOption}
                                                onEdit={(opt) => handleOpenDialog(fieldKey, fieldLabel, opt)}
                                            />
                                         ))
                                     )}
                                </SortableContext>
                            </TableBody>
                        </Table>
                     </div>
                 </DndContext>
            </CardContent>
        </Card>
      );
  };

  return (
    <div className="space-y-6">
       <Tabs defaultValue="receiving" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
                <TabsTrigger value="receiving">Receiving</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="clearance">Clearance</TabsTrigger>
                <TabsTrigger value="denr">DENR</TabsTrigger>
            </TabsList>
            
            {Object.entries(phases).map(([key, phase]) => (
                <TabsContent key={key} value={key}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {phase.fields.map(field => (
                            <OptionList key={field.key} fieldKey={field.key} fieldLabel={field.label} />
                        ))}
                    </div>
                </TabsContent>
            ))}
       </Tabs>

       {/* Editor Dialog */}
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOption ? 'Edit' : 'Add'} Option
            </DialogTitle>
            <DialogDescription>
              {editingOption ? `Update the option for ${targetFieldLabel}.` : `Add a new option to ${targetFieldLabel}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
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

      {/* Delete Dialog */}
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

export default DropdownOptionSettings;
