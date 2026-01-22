import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Button } from "@/presentation/components/shared/ui/button";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/presentation/components/shared/ui/form";
import { SaplingRequest } from "@/core/api/sapling-requests-api";
import { fetchTreeSpecies, createTreeSpecies, TreeSpeciesCreate } from "@/core/api/tree-inventory-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/presentation/components/shared/ui/dialog";
import { Plus, Trash2, Copy, X } from "lucide-react";
import { useToast } from "@/core/hooks/ui/use-toast";
import { CreatableCombobox } from "@/presentation/components/shared/ui/creatable-combobox";

interface Props {
    mode: "add" | "edit";
    initialData?: SaplingRequest;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const formSchema = z.object({
  date_received: z.string(),
  requester_name: z.string().min(1, "Requester name is required"),
  address: z.string().min(1, "Address is required"),
  received_through: z.string().optional(),
  status: z.string(),
  date_donated: z.string().optional(),
  categories: z.array(
    z.object({
      plant_type: z.string().min(1, "Plant type is required"),
      items: z.array(
        z.object({
          name: z.string().min(1, "Species name is required"),
          qty: z.number().min(1, "Quantity must be at least 1"),
        })
      ).min(1, "At least one item is required"),
    })
  ).min(1, "At least one category is required"),
});

type FormValues = z.infer<typeof formSchema>;

// Options for Plant Type
const PLANT_TYPE_OPTIONS = [
    { value: "tree", label: "Trees" },
    { value: "ornamental", label: "Ornamental" },
    { value: "fruit_tree", label: "Fruit Tree" },
    { value: "seeds", label: "Seeds" },
    { value: "other", label: "Other" },
];

const CategoryItem = ({ 
  index, 
  control, 
  remove, 
  speciesList, 
  onAddSpecies 
}: { 
  index: number; 
  control: Control<FormValues>; 
  remove: (index: number) => void; 
  speciesList: any[];
  onAddSpecies: (catIndex: number, itemIndex: number, currentName: string) => void;
}) => {
  const { fields, append, remove: removeItem } = useFieldArray({
    control,
    name: `categories.${index}.items`,
  });

  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(null);
    if (showDropdown !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <Card className="border shadow-sm mb-4">
      <CardContent className="p-4 bg-gray-50/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-xs">
             <FormField
                control={control}
                name={`categories.${index}.plant_type`}
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormControl>
                        <CreatableCombobox
                          items={PLANT_TYPE_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select Plant Type..."
                          className="bg-white font-medium"
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
             />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(index)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-4"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remove Category
          </Button>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-[1fr,100px,32px] gap-2 w-full pr-[140px] text-sm text-gray-500 font-medium">
                <div>Species</div>
                <div>Quantity</div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", qty: 1 })}
              className="h-7 text-xs absolute right-8"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Species
            </Button>
          </div>
          
          {fields.map((item, itemIndex) => (
            <div key={item.id} className="flex gap-2 items-start">
               <div className="flex-1">
               <FormField
                  control={control}
                  name={`categories.${index}.items.${itemIndex}.name`}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Species Name"
                            className="bg-white"
                            onFocus={(e) => {
                              e.stopPropagation();
                              setShowDropdown(itemIndex);
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDropdown(itemIndex);
                            }}
                            onChange={(e) => {
                              field.onChange(e);
                              setShowDropdown(itemIndex);
                            }}
                          />
                          {showDropdown === itemIndex && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto left-0">
                              {speciesList.length > 0 ? (
                                <>
                                  {speciesList
                                    .filter((s) => 
                                        !field.value || 
                                        s.common_name.toLowerCase().includes(field.value.toLowerCase()) || 
                                        (s.scientific_name && s.scientific_name.toLowerCase().includes(field.value.toLowerCase()))
                                    )
                                    .slice(0, 10)
                                    .map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          field.onChange(s.common_name);
                                          setShowDropdown(null);
                                        }}
                                        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100"
                                    >
                                        <div className="font-medium">{s.common_name}</div>
                                        {s.scientific_name && (
                                          <div className="text-xs text-gray-500 italic">{s.scientific_name}</div>
                                        )}
                                    </button>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onAddSpecies(index, itemIndex, field.value);
                                        setShowDropdown(null);
                                      }}
                                      className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm bg-blue-50/50 text-blue-600 font-medium"
                                    >
                                      <Plus className="w-4 h-4 inline mr-2" />
                                      Add "{field.value}" as new species
                                    </button>
                                </>
                              ) : (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddSpecies(index, itemIndex, field.value);
                                        setShowDropdown(null);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm text-blue-600 font-medium"
                                >
                                    <Plus className="w-4 h-4 inline mr-2" />
                                    Add "{field.value}" as new species
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>

                <div className="w-[100px]">
                <FormField
                  control={control}
                  name={`categories.${index}.items.${itemIndex}.qty`}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(itemIndex)}
                  className="h-10 w-8 text-gray-400 hover:text-red-500 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SaplingRequestForm: React.FC<Props> = ({ mode, initialData, onSave, onCancel }) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    
    const [speciesSearch, setSpeciesSearch] = useState("");
    const [isAddSpeciesOpen, setIsAddSpeciesOpen] = useState(false);
    const [addSpeciesTarget, setAddSpeciesTarget] = useState<{catIndex: number, itemIndex: number} | null>(null);
    const [newSpeciesForm, setNewSpeciesForm] = useState<TreeSpeciesCreate>({
        common_name: "",
        scientific_name: "",
        description: "",
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date_received: new Date().toISOString().split("T")[0],
            requester_name: "",
            address: "",
            received_through: "",
            status: "pending",
            date_donated: "",
            categories: [{ plant_type: "tree", items: [{ name: "", qty: 1 }] }],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "categories"
    });

    // Options for Received Through
    const receivedThroughOptions = [
        { value: "walk_in", label: "Walk-in" },
        { value: "social_media", label: "Social Media" },
        { value: "phone", label: "Phone" },
        { value: "referral", label: "Referral" },
        { value: "letter", label: "Letter" },
        { value: "event", label: "Event" },
    ];

    const statusOptions = [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "ready", label: "Ready for Pickup" },
        { value: "completed", label: "Completed / Donated" },
        { value: "declined", label: "Declined" },
        { value: "cancelled", label: "Cancelled" },
    ];

    // Fetch species for autocomplete
    const { data: speciesList = [] } = useQuery({
        queryKey: ["tree-species", speciesSearch],
        queryFn: () => fetchTreeSpecies(speciesSearch),
    });

    // Create species mutation
    const createSpeciesMutation = useMutation({
        mutationFn: createTreeSpecies,
        onSuccess: (newSpecies) => {
            queryClient.invalidateQueries({ queryKey: ["tree-species"] });
            if (addSpeciesTarget) {
                form.setValue(`categories.${addSpeciesTarget.catIndex}.items.${addSpeciesTarget.itemIndex}.name`, newSpecies.common_name);
            }
            toast({
                title: "Success",
                description: "Species added successfully",
            });
            setIsAddSpeciesOpen(false);
            setNewSpeciesForm({ common_name: "", scientific_name: "", description: "" });
            setAddSpeciesTarget(null);
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to add species",
                variant: "destructive",
            });
        },
    });

    useEffect(() => {
        if (initialData) {
            let items: any[] = [];
            try {
                items = typeof initialData.saplings === "string" ? JSON.parse(initialData.saplings) : (initialData.saplings as any[]);
            } catch { }
            
            // Group items by plant_type
            const categorizedItems: Record<string, any[]> = {};
            
            if (items.length) {
                items.forEach((item) => {
                   const type = item.plant_type || "Uncategorized";
                   if (!categorizedItems[type]) {
                       categorizedItems[type] = [];
                   }
                   categorizedItems[type].push({
                       name: item.name,
                       qty: item.qty
                   });
                });
            }

            const categories = Object.entries(categorizedItems).map(([type, list]) => ({
                plant_type: type === "Uncategorized" ? "tree" : type,
                items: list
            }));

            form.reset({
                date_received: initialData.date_received?.split("T")[0] || initialData.date_received,
                requester_name: initialData.requester_name,
                address: initialData.address,
                received_through: initialData.received_through || "",
                status: initialData.status || "pending",
                date_donated: initialData.date_donated ? initialData.date_donated.split("T")[0] : "",
                categories: categories.length ? categories : [{ plant_type: "tree", items: [{ name: "", qty: 1 }] }]
            });
        }
    }, [initialData, form]);

    const handleCreateSpecies = (e: React.FormEvent) => {
        e.preventDefault();
        createSpeciesMutation.mutate(newSpeciesForm);
    };

    const submit = (data: FormValues) => {
        // Flatten categories back to list
        const flattenedItems = data.categories.flatMap(cat => 
            cat.items.map(item => ({
                name: item.name,
                qty: item.qty,
                plant_type: cat.plant_type
            }))
        );

        onSave({
            date_received: data.date_received,
            requester_name: data.requester_name,
            address: data.address,
            saplings: flattenedItems,
            received_through: data.received_through,
            status: data.status,
            date_donated: data.date_donated || null,
            total_qty: flattenedItems.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0)
        });
    };

    return (
        <>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="date_received"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date Received</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} className="rounded-lg" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="received_through"
                    render={({ field }) => (
                        <FormItem>
                             <FormLabel>Received Through</FormLabel>
                             <FormControl>
                                <CreatableCombobox
                                    items={receivedThroughOptions}
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    placeholder="Select or type..."
                                    className="bg-white"
                                />
                             </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                             <FormLabel>Status</FormLabel>
                             <FormControl>
                                <CreatableCombobox
                                    items={statusOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select status..."
                                    className="bg-white"
                                />
                             </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date_donated"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date Donated (Optional)</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} className="rounded-lg" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1">
                <FormField
                    control={form.control}
                    name="requester_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name of Requester</FormLabel>
                            <FormControl>
                                <Input {...field} className="rounded-lg" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div>
                 <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location / Address</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={2} className="rounded-lg" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base font-semibold">Requested Items</Label>
                        <p className="text-sm text-gray-500">Group items by plant type (e.g. Trees, Seeds)</p>
                    </div>
                    <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => append({ plant_type: "tree", items: [{ name: "", qty: 1 }] })}
                        className="rounded-lg"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                    </Button>
                </div>
                
                <div className="space-y-4">
                     {fields.map((field, index) => (
                         <CategoryItem
                            key={field.id}
                            index={index}
                            control={form.control}
                            remove={remove}
                            speciesList={speciesList}
                            onAddSpecies={(catIdx, itemIdx, name) => {
                                setAddSpeciesTarget({ catIndex: catIdx, itemIndex: itemIdx });
                                setNewSpeciesForm({ ...newSpeciesForm, common_name: name });
                                setIsAddSpeciesOpen(true);
                            }}
                         />
                     ))}
                </div>
                
                <div className="flex justify-end pt-2 text-sm font-medium text-gray-700">
                     Total Qty: {form.watch("categories").reduce((catAcc, cat) => catAcc + cat.items.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0), 0)}
                </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel}
                    className="rounded-lg"
                >Cancel</Button>
                <Button 
                    type="submit"
                    className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
                >{mode === "add" ? "Create Request" : "Save Changes"}</Button>
            </div>
        </form>
        </Form>

            {/* Add Species Dialog */}
            <Dialog open={isAddSpeciesOpen} onOpenChange={setIsAddSpeciesOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Species</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSpecies}>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="new_species_name">
                                    Species Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="new_species_name"
                                    value={newSpeciesForm.common_name}
                                    onChange={(e) =>
                                        setNewSpeciesForm({ ...newSpeciesForm, common_name: e.target.value })
                                    }
                                    className="rounded-lg"
                                    placeholder="e.g., Mahogany, Narra, Mango"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <Label htmlFor="new_species_scientific">Scientific Name (Optional)</Label>
                                <Input
                                    id="new_species_scientific"
                                    value={newSpeciesForm.scientific_name}
                                    onChange={(e) =>
                                        setNewSpeciesForm({ ...newSpeciesForm, scientific_name: e.target.value })
                                    }
                                    className="rounded-lg italic"
                                    placeholder="e.g., Swietenia macrophylla"
                                />
                            </div>

                            <div>
                                <Label htmlFor="new_species_description">Notes (Optional)</Label>
                                <Textarea
                                    id="new_species_description"
                                    value={newSpeciesForm.description}
                                    onChange={(e) =>
                                        setNewSpeciesForm({ ...newSpeciesForm, description: e.target.value })
                                    }
                                    className="rounded-lg"
                                    rows={2}
                                    placeholder="Any additional information"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddSpeciesOpen(false)}
                                className="rounded-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createSpeciesMutation.isPending}
                                className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
                            >
                                Add Species
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SaplingRequestForm;
