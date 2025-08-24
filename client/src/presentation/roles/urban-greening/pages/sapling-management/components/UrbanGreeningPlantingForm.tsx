import React, { useState, useEffect } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import { Separator } from "@/presentation/components/shared/ui/separator";
import { UrbanGreeningPlanting } from "@/core/api/planting-api";
import LocationPickerMap from "../../LocationPickerMap";
import { createMonitoringRequest, fetchMonitoringRequests, MonitoringRequest } from "@/core/api/monitoring-request-service";
import { toast } from "sonner";
import { CalendarDays, MapPin, User, Sprout, FileText, Plus, Trash2, Unlink } from "lucide-react";
import { PLANT_STATUS_OPTIONS, DEFAULT_PLANT_STATUS } from "../../../constants";

// Monitoring Request Search Component
const MonitoringRequestSearch: React.FC<{
    value: string | null;
    onChange: (value: string | null) => void;
    disabled?: boolean;
    onCreateNew?: () => void;
}> = ({ value, onChange, disabled, onCreateNew }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<MonitoringRequest[]>([]);
    const [searching, setSearching] = useState(false);

    // Search monitoring requests with debounce
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setSearching(true);
            try {
                const data = await fetchMonitoringRequests({ search: searchQuery.trim(), limit: 10 });
                setSearchResults(data.reports || []);
            } catch (error) {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <div className="space-y-2">
            <Label>Monitoring Request (optional)</Label>
            {value ? (
                <div className="flex items-center gap-2">
                    <Input
                        readOnly
                        value={value}
                        className="bg-gray-50 text-xs flex-1"
                    />
                    {!disabled && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onChange(null)}
                        >
                            <Unlink className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    {!disabled && (
                        <div className="relative">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Search monitoring requests..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (!searchOpen) setSearchOpen(true);
                                    }}
                                    onFocus={() => setSearchOpen(true)}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onCreateNew}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    New
                                </Button>
                            </div>
                            {searchOpen && searchQuery.trim() && (
                                <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-white shadow-lg">
                                    {searching && (
                                        <div className="p-2 text-sm text-gray-500">Searching...</div>
                                    )}
                                    {!searching && searchResults.length === 0 && (
                                        <div className="p-2 text-sm text-gray-500">No matches found</div>
                                    )}
                                    {searchResults.map((request) => (
                                        <button
                                            key={request.id}
                                            type="button"
                                            className="w-full text-left px-3 py-2 hover:bg-gray-100"
                                            onClick={() => {
                                                onChange(request.id);
                                                setSearchOpen(false);
                                                setSearchQuery("");
                                            }}
                                        >
                                            <div className="text-sm font-medium truncate">
                                                {request.title || `Request ${request.id.slice(0, 8)}`}
                                            </div>
                                            <div className="text-xs text-gray-600 truncate">
                                                {request.address || `(${request.location?.lat}, ${request.location?.lng})`}
                                            </div>
                                            <div className="text-xs text-gray-500">{request.status}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface UrbanGreeningPlantingFormProps {
    mode: "add" | "edit" | "view";
    initialData?: UrbanGreeningPlanting | null;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const UrbanGreeningPlantingForm: React.FC<UrbanGreeningPlantingFormProps> = ({
    mode,
    initialData,
    onSave,
    onCancel,
}) => {
    type PlantItem = {
        planting_type: "ornamental_plants" | "ornamental_plants_private" | "trees" | "seeds" | "seeds_private";
        species_name: string;
        quantity: number;
    };
    const [formData, setFormData] = useState({
        planting_type: "ornamental_plants",
        species_name: "",
        quantity_planted: 1,
        planting_date: new Date().toISOString().split('T')[0],
        responsible_person: "",
        contact_number: "",
        organization: "",
        notes: "",
        monitoring_request_id: "",
    });
    // Embedded Monitoring Request fields for ADD mode
    const [mrStatus, setMrStatus] = useState<string>(DEFAULT_PLANT_STATUS);
    const [mrLocation, setMrLocation] = useState<{ lat: number; lng: number }>({ lat: 14.5995, lng: 120.9842 });
    const [plants, setPlants] = useState<PlantItem[]>([
        { planting_type: "ornamental_plants", species_name: "", quantity: 1 }
    ]);

    // Monitoring Request Dialog state
    const [monitoringRequestOpen, setMonitoringRequestOpen] = useState(false);
    const [newMonitoringStatus, setNewMonitoringStatus] = useState<string>(DEFAULT_PLANT_STATUS);
    const [newMonitoringLocation, setNewMonitoringLocation] = useState<{ lat: number; lng: number }>({ lat: 14.5995, lng: 120.9842 });

    useEffect(() => {
        if (initialData) {
            // Normalize plants list from initialData
            let incomingPlants: any = (initialData as any).plants;
            try {
                if (typeof incomingPlants === "string") incomingPlants = JSON.parse(incomingPlants);
            } catch {
                incomingPlants = undefined;
            }
            if (Array.isArray(incomingPlants) && incomingPlants.length > 0) {
                const first = incomingPlants[0];
                setPlants(
                    incomingPlants.map((p: any) => ({
                        planting_type: p.planting_type || "ornamental_plants",
                        species_name: p.species_name || "",
                        quantity: Number(p.quantity) || 1,
                    }))
                );
                setFormData((prev) => ({
                    ...prev,
                    planting_type: first.planting_type || "ornamental_plants",
                    species_name: first.species_name || "",
                    quantity_planted: Number(first.quantity) || 1,
                    planting_date: initialData.planting_date?.split('T')[0] || new Date().toISOString().split('T')[0],
                    responsible_person: initialData.responsible_person || "",
                    contact_number: initialData.contact_number || "",
                    organization: initialData.organization || "",
                    notes: initialData.notes || "",
                    monitoring_request_id: (initialData as any).monitoring_request_id || "",
                }));
            } else {
                // Fallback to top-level fields
                setPlants([{ planting_type: initialData.planting_type || "ornamental_plants", species_name: initialData.species_name || "", quantity: initialData.quantity_planted || 1 }]);
                setFormData({
                    planting_type: initialData.planting_type || "ornamental_plants",
                    species_name: initialData.species_name || "",
                    quantity_planted: initialData.quantity_planted || 1,
                    planting_date: initialData.planting_date?.split('T')[0] || new Date().toISOString().split('T')[0],
                    responsible_person: initialData.responsible_person || "",
                    contact_number: initialData.contact_number || "",
                    organization: initialData.organization || "",
                    notes: initialData.notes || "",
                    monitoring_request_id: (initialData as any).monitoring_request_id || "",
                });
            }
        }
    }, [initialData]);

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
        const { name, value, type } = e.target as HTMLInputElement | HTMLTextAreaElement;
        if (type === "number") {
            setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const list = plants.filter(p => p.species_name.trim() && p.quantity > 0);
        const first = list[0] || plants[0] || { planting_type: formData.planting_type, species_name: formData.species_name, quantity: formData.quantity_planted };

        let monitoring_request_id = formData.monitoring_request_id || null;
        try {
            if (mode === "add") {
                const created = await createMonitoringRequest({
                    status: mrStatus,
                    location: mrLocation,
                    title: first?.species_name ? `Urban Greening: ${first.species_name}` : "Urban Greening Planting",
                    source_type: "urban_greening",
                });
                monitoring_request_id = created.id;
            }
        } catch (err) {
            toast.error("Failed to create Monitoring Request automatically. The system will create a default one.");
        }

        const payload = {
            ...formData,
            monitoring_request_id,
            // mirror first item for backend validation while sending full list
            planting_type: first.planting_type,
            species_name: first.species_name,
            quantity_planted: first.quantity,
            plants: list.length > 0 ? list : undefined,
        };
        onSave(payload);
    };

    const isReadOnly = mode === "view";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                    {mode === "add" ? "Add New Planting Record" : mode === "edit" ? "Edit Planting Record" : "View Planting Record"}
                </h2>
                <p className="text-gray-600">
                    {mode === "add" ? "Create a new urban greening planting record with monitoring location" :
                        mode === "edit" ? "Update the planting record information" :
                            "View the details of this planting record"}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Record Information - Only for edit/view */}
                {mode !== "add" && initialData && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Record Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="record_number">Record Number</Label>
                                    <Input
                                        id="record_number"
                                        value={initialData.record_number || "Auto-generated"}
                                        readOnly
                                        className="bg-gray-50 font-mono"
                                    />
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Input
                                        value={initialData.status || "Active"}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Plants Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sprout className="w-5 h-5 text-green-600" />
                            Plants & Species Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-medium">Plant Details</Label>
                                {!isReadOnly && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPlants((prev) => [...prev, { planting_type: "ornamental_plants", species_name: "", quantity: 1 }])}
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Plant
                                    </Button>
                                )}
                            </div>

                            {plants.map((p, idx) => (
                                <Card key={idx} className="border-l-4 border-l-green-500">
                                    <CardContent className="pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                            <div className="md:col-span-4">
                                                <Label className="text-sm font-medium">Planting Type</Label>
                                                <select
                                                    value={p.planting_type}
                                                    onChange={(e) => {
                                                        const v = e.target.value as PlantItem["planting_type"];
                                                        setPlants((prev) => prev.map((it, i) => i === idx ? { ...it, planting_type: v } : it));
                                                    }}
                                                    disabled={isReadOnly}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                >
                                                    <option value="ornamental_plants">Ornamental Plants</option>
                                                    <option value="ornamental_plants_private">Ornamental Plants (Private)</option>
                                                    <option value="trees">Trees</option>
                                                    <option value="seeds">Seeds</option>
                                                    <option value="seeds_private">Seeds (Private)</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-5">
                                                <Label className="text-sm font-medium">Species Name</Label>
                                                <Input
                                                    value={p.species_name}
                                                    onChange={(e) => setPlants((prev) => prev.map((it, i) => i === idx ? { ...it, species_name: e.target.value } : it))}
                                                    readOnly={isReadOnly}
                                                    placeholder="Enter species name"
                                                    className="focus:ring-green-500 focus:border-green-500"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label className="text-sm font-medium">Quantity</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={p.quantity}
                                                    onChange={(e) => setPlants((prev) => prev.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, Number(e.target.value) || 1) } : it))}
                                                    readOnly={isReadOnly}
                                                    className="focus:ring-green-500 focus:border-green-500"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                {!isReadOnly && plants.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setPlants((prev) => prev.filter((_, i) => i !== idx))}
                                                        className="w-full flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Separator />

                        <div>
                            <Label htmlFor="planting_date" className="text-base font-medium flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" />
                                Planting Date *
                            </Label>
                            <Input
                                id="planting_date"
                                name="planting_date"
                                type="date"
                                value={formData.planting_date}
                                onChange={handleInputChange}
                                readOnly={isReadOnly}
                                className="mt-2 focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Location & Monitoring */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            Location & Monitoring
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {mode === "add" ? (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-medium">Monitoring Status</Label>
                                    <select
                                        value={mrStatus}
                                        onChange={(e) => setMrStatus(e.target.value)}
                                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {PLANT_STATUS_OPTIONS.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-base font-medium">Planting Location</Label>
                                    <p className="text-sm text-gray-600 mb-2">Click on the map to set the exact planting location</p>
                                    <LocationPickerMap location={mrLocation} onLocationChange={setMrLocation} />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Monitoring request was created automatically during record submission.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Responsible Person Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-600" />
                            Responsible Person
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="responsible_person" className="text-base font-medium">Full Name *</Label>
                                <Input
                                    id="responsible_person"
                                    name="responsible_person"
                                    value={formData.responsible_person}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    placeholder="Enter full name of responsible person"
                                    className="mt-2 focus:ring-purple-500 focus:border-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="contact_number" className="text-base font-medium">Contact Number</Label>
                                <Input
                                    id="contact_number"
                                    name="contact_number"
                                    value={formData.contact_number}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    placeholder="e.g., +63 912 345 6789"
                                    className="mt-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <Label htmlFor="organization" className="text-base font-medium">Organization</Label>
                                <Input
                                    id="organization"
                                    name="organization"
                                    value={formData.organization}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    placeholder="Organization or company name"
                                    className="mt-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-600" />
                            Additional Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            readOnly={isReadOnly}
                            placeholder="Add any additional notes, observations, or special instructions..."
                            rows={4}
                            className="focus:ring-gray-500 focus:border-gray-500"
                        />
                    </CardContent>
                </Card>

                {/* Monitoring Request Section */}
                {mode !== "view" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                Monitoring Request
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MonitoringRequestSearch
                                value={formData.monitoring_request_id || null}
                                onChange={(value) => setFormData(prev => ({ ...prev, monitoring_request_id: value || "" }))}
                                disabled={isReadOnly}
                                onCreateNew={() => setMonitoringRequestOpen(true)}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Form Actions */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={onCancel}>
                                {mode === "view" ? "Close" : "Cancel"}
                            </Button>
                            {mode !== "view" && (
                                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                    {mode === "add" ? "Create Planting Record" : "Update Planting Record"}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </form>

            {/* Create New Monitoring Request Dialog */}
            <Dialog open={monitoringRequestOpen} onOpenChange={setMonitoringRequestOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Monitoring Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Status</Label>
                            <select
                                value={newMonitoringStatus}
                                onChange={(e) => setNewMonitoringStatus(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                {PLANT_STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Location</Label>
                            <LocationPickerMap
                                center={newMonitoringLocation}
                                zoom={15}
                                onLocationChange={setNewMonitoringLocation}
                                className="h-64 w-full rounded-md border"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMonitoringRequestOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const created = await createMonitoringRequest({
                                            status: newMonitoringStatus,
                                            location: newMonitoringLocation,
                                            title: `Urban Greening: ${formData.responsible_person || formData.organization || 'Planting'}`,
                                            address: "", // Could be derived from planting location if available
                                            source_type: "urban_greening",
                                        });
                                        setFormData(prev => ({ ...prev, monitoring_request_id: created.id }));
                                        setMonitoringRequestOpen(false);
                                        toast.success("Monitoring Request created and linked!");
                                    } catch (error) {
                                        toast.error("Failed to create Monitoring Request");
                                    }
                                }}
                            >
                                Create & Link
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UrbanGreeningPlantingForm;
