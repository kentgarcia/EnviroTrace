import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Button } from "@/presentation/components/shared/ui/button";
import { SaplingRequest } from "@/core/api/sapling-requests-api";
import { fetchTreeSpecies, createTreeSpecies, TreeSpeciesCreate } from "@/core/api/tree-inventory-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/presentation/components/shared/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/core/hooks/ui/use-toast";

interface Props {
    mode: "add" | "edit";
    initialData?: SaplingRequest;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const SaplingRequestForm: React.FC<Props> = ({ mode, initialData, onSave, onCancel }) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [form, setForm] = useState({
        date_received: new Date().toISOString().split("T")[0],
        requester_name: "",
        address: "",
        saplings: [{ name: "", qty: 1, plant_type: "" }],
    });
    const [speciesSearch, setSpeciesSearch] = useState("");
    const [showSpeciesDropdown, setShowSpeciesDropdown] = useState<number | null>(null);
    const [isAddSpeciesOpen, setIsAddSpeciesOpen] = useState(false);
    const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
    const [newSpeciesForm, setNewSpeciesForm] = useState<TreeSpeciesCreate>({
        common_name: "",
        scientific_name: "",
        description: "",
    });

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
            if (currentItemIndex !== null) {
                handleItemChange(currentItemIndex, "name", newSpecies.common_name);
            }
            toast({
                title: "Success",
                description: "Species added successfully",
            });
            setIsAddSpeciesOpen(false);
            setNewSpeciesForm({ common_name: "", scientific_name: "", description: "" });
            setCurrentItemIndex(null);
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
            setForm({
                date_received: initialData.date_received?.split("T")[0] || initialData.date_received,
                requester_name: initialData.requester_name,
                address: initialData.address,
                saplings: items.length ? items : [{ name: "", qty: 1, plant_type: "" }],
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setForm((p) => ({ ...p, [id]: value }));
    };

    const handleItemChange = (idx: number, field: "name" | "qty" | "plant_type", value: string) => {
        setForm((p) => ({
            ...p,
            saplings: p.saplings.map((it, i) => i === idx ? { ...it, [field]: field === "qty" ? Number(value) : value } : it)
        }));
    };

    const addItem = () => setForm((p) => ({ ...p, saplings: [...p.saplings, { name: "", qty: 1, plant_type: "" }] }));
    const removeItem = (idx: number) => setForm((p) => ({ ...p, saplings: p.saplings.filter((_, i) => i !== idx) }));

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = () => setShowSpeciesDropdown(null);
        if (showSpeciesDropdown !== null) {
            document.addEventListener("click", handleClickOutside);
            return () => document.removeEventListener("click", handleClickOutside);
        }
    }, [showSpeciesDropdown]);

    const handleAddNewSpecies = (idx: number) => {
        setCurrentItemIndex(idx);
        setNewSpeciesForm({
            common_name: speciesSearch || "",
            scientific_name: "",
            description: "",
        });
        setIsAddSpeciesOpen(true);
        setShowSpeciesDropdown(null);
    };

    const handleCreateSpecies = (e: React.FormEvent) => {
        e.preventDefault();
        createSpeciesMutation.mutate(newSpeciesForm);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate that all saplings have plant_type selected
        const invalidItems = form.saplings.filter(s => !s.plant_type || s.plant_type === "");
        if (invalidItems.length > 0) {
            toast({
                title: "Validation Error",
                description: "Please select a type for all sapling items",
                variant: "destructive",
            });
            return;
        }
        
        onSave({
            date_received: form.date_received,
            requester_name: form.requester_name,
            address: form.address,
            saplings: form.saplings,
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="date_received">Date Received</Label>
                    <Input 
                        id="date_received" 
                        type="date" 
                        value={form.date_received} 
                        onChange={handleChange} 
                        required 
                        className="rounded-lg"
                    />
                </div>
                <div>
                    <Label htmlFor="requester_name">Name of Requester</Label>
                    <Input 
                        id="requester_name" 
                        value={form.requester_name} 
                        onChange={handleChange} 
                        required 
                        className="rounded-lg"
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="address">Address</Label>
                <Textarea 
                    id="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    required 
                    rows={3} 
                    className="rounded-lg"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Requested Saplings</Label>
                    <Button 
                        type="button" 
                        size="sm" 
                        onClick={addItem}
                        className="rounded-lg"
                    >Add Item</Button>
                </div>
                {form.saplings.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2">
                        <div className="col-span-5 relative">
                            <Input 
                                placeholder="Search species..." 
                                value={it.name} 
                                onChange={(e) => {
                                    handleItemChange(idx, "name", e.target.value);
                                    setSpeciesSearch(e.target.value);
                                    setShowSpeciesDropdown(idx);
                                }}
                                onFocus={() => setShowSpeciesDropdown(idx)}
                                className="rounded-lg"
                                required
                            />
                            {showSpeciesDropdown === idx && it.name && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {speciesList.length > 0 ? (
                                        <>
                                            {speciesList.map((species) => (
                                                <button
                                                    key={species.id}
                                                    type="button"
                                                    onClick={() => {
                                                        handleItemChange(idx, "name", species.common_name);
                                                        setShowSpeciesDropdown(null);
                                                    }}
                                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100"
                                                >
                                                    <div className="font-medium">{species.common_name}</div>
                                                    {species.scientific_name && (
                                                        <div className="text-xs text-gray-500 italic">{species.scientific_name}</div>
                                                    )}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => handleAddNewSpecies(idx)}
                                                className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm bg-blue-50/50 text-blue-600 font-medium"
                                            >
                                                <Plus className="w-4 h-4 inline mr-2" />
                                                Add "{it.name}" as new species
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleAddNewSpecies(idx)}
                                            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm text-blue-600 font-medium"
                                        >
                                            <Plus className="w-4 h-4 inline mr-2" />
                                            Add "{it.name}" as new species
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="col-span-3">
                            <select
                                value={it.plant_type || ""}
                                onChange={(e) => handleItemChange(idx, "plant_type", e.target.value)}
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm"
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="tree">Trees</option>
                                <option value="ornamental">Ornamental Plants</option>
                                <option value="ornamental_private">Ornamental Plants (Private)</option>
                                <option value="seeds">Seeds</option>
                                <option value="seeds_private">Seeds (Private)</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <Input 
                                type="number" 
                                min={1} 
                                placeholder="Qty" 
                                value={it.qty} 
                                onChange={(e) => handleItemChange(idx, "qty", e.target.value)} 
                                className="rounded-lg"
                                required
                            />
                        </div>
                        <div className="col-span-1">
                            <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon"
                                onClick={() => removeItem(idx)}
                                className="rounded-lg h-9 w-9"
                            >×</Button>
                        </div>
                    </div>
                ))}
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
                >{mode === "add" ? "Create" : "Save"}</Button>
            </div>

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
        </form>
    );
};

export default SaplingRequestForm;
