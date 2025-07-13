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
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import { toast } from "sonner";

interface TreeRecordFormProps {
    mode: "add" | "edit" | "view";
    initialData?: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const TreeRecordForm: React.FC<TreeRecordFormProps> = ({
    mode,
    initialData,
    onSave,
    onCancel,
}) => {
    const [formData, setFormData] = useState({
        species: initialData?.species || "",
        location: initialData?.location || "",
        coordinates: initialData?.coordinates || { lat: 0, lng: 0 },
        diameter: initialData?.diameter || 0,
        height: initialData?.height || 0,
        condition: initialData?.condition || "healthy",
        action: initialData?.action || "none",
        permitNumber: initialData?.permitNumber || "",
        actionDate: initialData?.actionDate ? new Date(initialData.actionDate) : null,
        replacementRequired: initialData?.replacementRequired || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.species || !formData.location) {
            toast.error("Please fill in all required fields");
            return;
        }

        onSave({
            ...formData,
            actionDate: formData.actionDate ? formData.actionDate.toISOString().split('T')[0] : undefined,
            id: initialData?.id || `TR-${Date.now()}`,
        });

        toast.success(mode === "add" ? "Tree record added successfully" : "Tree record updated successfully");
    };

    const isReadOnly = mode === "view";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="species">Tree Species *</Label>
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
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter location"
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.coordinates.lat}
                        onChange={(e) => setFormData({
                            ...formData,
                            coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="14.5995"
                        disabled={isReadOnly}
                    />
                </div>
                <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.coordinates.lng}
                        onChange={(e) => setFormData({
                            ...formData,
                            coordinates: { ...formData.coordinates, lng: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="120.9842"
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="diameter">Diameter (cm)</Label>
                    <Input
                        id="diameter"
                        type="number"
                        min="0"
                        value={formData.diameter}
                        onChange={(e) => setFormData({ ...formData, diameter: parseInt(e.target.value) || 0 })}
                        placeholder="Enter diameter"
                        disabled={isReadOnly}
                    />
                </div>
                <div>
                    <Label htmlFor="height">Height (meters)</Label>
                    <Input
                        id="height"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                        placeholder="Enter height"
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="condition">Tree Condition</Label>
                    <Select
                        value={formData.condition}
                        onValueChange={(value) => setFormData({ ...formData, condition: value })}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="healthy">Healthy</SelectItem>
                            <SelectItem value="diseased">Diseased</SelectItem>
                            <SelectItem value="damaged">Damaged</SelectItem>
                            <SelectItem value="dead">Dead</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="action">Required Action</Label>
                    <Select
                        value={formData.action}
                        onValueChange={(value) => setFormData({ ...formData, action: value })}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Action Required</SelectItem>
                            <SelectItem value="pruning">Pruning</SelectItem>
                            <SelectItem value="cutting">Tree Cutting</SelectItem>
                            <SelectItem value="treatment">Treatment</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {(formData.action === "pruning" || formData.action === "cutting") && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="permitNumber">Permit Number</Label>
                        <Input
                            id="permitNumber"
                            value={formData.permitNumber}
                            onChange={(e) => setFormData({ ...formData, permitNumber: e.target.value })}
                            placeholder="Enter permit number"
                            disabled={isReadOnly}
                        />
                    </div>          <div>
                        <Label htmlFor="actionDate">Action Date</Label>
                        <DatePicker
                            selected={formData.actionDate || undefined}
                            onSelect={isReadOnly ? undefined : (date) => setFormData({ ...formData, actionDate: date || null })}
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="replacementRequired"
                    checked={formData.replacementRequired}
                    onCheckedChange={(checked) => setFormData({ ...formData, replacementRequired: !!checked })}
                    disabled={isReadOnly}
                />
                <Label htmlFor="replacementRequired">Replacement required</Label>
            </div>

            {!isReadOnly && (
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {mode === "add" ? "Add Tree Record" : "Save Changes"}
                    </Button>
                </div>
            )}
        </form>
    );
};

export default TreeRecordForm;
