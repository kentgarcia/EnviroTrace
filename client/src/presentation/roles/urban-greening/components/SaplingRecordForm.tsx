import React, { useState } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Button } from "@/presentation/components/shared/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/shared/ui/select";
import { DatePicker } from "@/presentation/components/shared/ui/date-picker";
import { toast } from "sonner";

interface SaplingRecordFormProps {
    mode: "add" | "edit" | "view";
    initialData?: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const SaplingRecordForm: React.FC<SaplingRecordFormProps> = ({
    mode,
    initialData,
    onSave,
    onCancel,
}) => {
    const [formData, setFormData] = useState({
        species: initialData?.species || "",
        quantity: initialData?.quantity || 1,
        collectionDate: initialData?.collectionDate ? new Date(initialData.collectionDate) : new Date(),
        source: initialData?.source || "replacement",
        condition: initialData?.condition || "good",
        plantingDate: initialData?.plantingDate ? new Date(initialData.plantingDate) : null,
        location: initialData?.location || "",
        notes: initialData?.notes || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.species || formData.quantity <= 0) {
            toast.error("Please fill in all required fields");
            return;
        }

        onSave({
            ...formData,
            collectionDate: formData.collectionDate.toISOString().split('T')[0],
            plantingDate: formData.plantingDate ? formData.plantingDate.toISOString().split('T')[0] : undefined,
            id: initialData?.id || `SR-${Date.now()}`,
        });

        toast.success(mode === "add" ? "Sapling record added successfully" : "Sapling record updated successfully");
    };

    const isReadOnly = mode === "view";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="species">Species *</Label>
                    <Select
                        value={formData.species}
                        onValueChange={(value) => setFormData({ ...formData, species: value })}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Narra">Narra</SelectItem>
                            <SelectItem value="Acacia">Acacia</SelectItem>
                            <SelectItem value="Mahogany">Mahogany</SelectItem>
                            <SelectItem value="Mango">Mango</SelectItem>
                            <SelectItem value="Ipil-Ipil">Ipil-Ipil</SelectItem>
                            <SelectItem value="Fire Tree">Fire Tree</SelectItem>
                            <SelectItem value="Molave">Molave</SelectItem>
                            <SelectItem value="Bougainvillea">Bougainvillea</SelectItem>
                            <SelectItem value="Hibiscus">Hibiscus</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        placeholder="Enter quantity"
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">        <div>
                <Label htmlFor="collectionDate">Collection Date</Label>
                <DatePicker
                    selected={formData.collectionDate}
                    onSelect={isReadOnly ? undefined : (date) => date && setFormData({ ...formData, collectionDate: date })}
                />
            </div>
                <div>
                    <Label htmlFor="source">Source</Label>
                    <Select
                        value={formData.source}
                        onValueChange={(value) => setFormData({ ...formData, source: value })}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="replacement">Tree Replacement</SelectItem>
                            <SelectItem value="donation">Donation</SelectItem>
                            <SelectItem value="purchase">Purchase</SelectItem>
                            <SelectItem value="nursery">Government Nursery</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                        value={formData.condition}
                        onValueChange={(value) => setFormData({ ...formData, condition: value })}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>        <div>
                    <Label htmlFor="plantingDate">Planting Date</Label>
                    <DatePicker
                        selected={formData.plantingDate || undefined}
                        onSelect={isReadOnly ? undefined : (date) => setFormData({ ...formData, plantingDate: date || null })}
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="location">Planting Location</Label>
                <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter planting location (if planted)"
                    disabled={isReadOnly}
                />
            </div>

            <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about the saplings"
                    rows={3}
                    disabled={isReadOnly}
                />
            </div>

            {!isReadOnly && (
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {mode === "add" ? "Add Sapling Record" : "Save Changes"}
                    </Button>
                </div>
            )}
        </form>
    );
};

export default SaplingRecordForm;
