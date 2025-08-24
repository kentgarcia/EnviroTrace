import React, { useEffect, useState } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Button } from "@/presentation/components/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import { SaplingRequest } from "@/core/api/sapling-requests-api";
import { createMonitoringRequest, fetchMonitoringRequests, MonitoringRequest } from "@/core/api/monitoring-request-service";
import { toast } from "sonner";
import { Plus, Unlink, MapPin } from "lucide-react";
import { PLANT_STATUS_OPTIONS, DEFAULT_PLANT_STATUS } from "../../../constants";
import LocationPickerMap from "../../LocationPickerMap";

// Monitoring Request Search Component for Sapling Requests
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

interface Props {
    mode: "add" | "edit";
    initialData?: SaplingRequest;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const SaplingRequestForm: React.FC<Props> = ({ mode, initialData, onSave, onCancel }) => {
    const [form, setForm] = useState({
        date_received: new Date().toISOString().split("T")[0],
        requester_name: "",
        address: "",
        saplings: [{ name: "", qty: 1 }],
        monitoring_request_id: "",
    });

    const [monitoringRequestId, setMonitoringRequestId] = useState<string | null>(
        initialData?.monitoring_request_id || null
    );
    const [isCreateMonitoringDialogOpen, setIsCreateMonitoringDialogOpen] = useState(false);
    const [newMonitoringRequest, setNewMonitoringRequest] = useState({
        title: "",
        description: "",
        location: { lat: 0, lng: 0 },
        priority: "medium" as const,
        address: ""
    });
    const [isSubmittingMonitoring, setIsSubmittingMonitoring] = useState(false);

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
                saplings: items.length ? items : [{ name: "", qty: 1 }],
                monitoring_request_id: initialData.monitoring_request_id || "",
            });
            setMonitoringRequestId(initialData.monitoring_request_id || null);
        }
    }, [initialData]);

    const handleCreateMonitoringRequest = async () => {
        if (!newMonitoringRequest.title || !newMonitoringRequest.description) {
            toast.error("Title and description are required");
            return;
        }

        setIsSubmittingMonitoring(true);
        try {
            const monitoringRequestData = {
                ...newMonitoringRequest,
                source_type: "urban_greening" as const,
                status: "pending" as const
            };

            const response = await createMonitoringRequest(monitoringRequestData);
            setMonitoringRequestId(response.id);
            setForm(prev => ({ ...prev, monitoring_request_id: response.id }));
            setIsCreateMonitoringDialogOpen(false);
            setNewMonitoringRequest({
                title: "",
                description: "",
                location: { lat: 0, lng: 0 },
                priority: "medium",
                address: ""
            });
            toast.success("Monitoring request created");
        } catch (error) {
            console.error("Error creating monitoring request:", error);
            toast.error("Failed to create monitoring request");
        } finally {
            setIsSubmittingMonitoring(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setForm((p) => ({ ...p, [id]: value }));
    };

    const handleItemChange = (idx: number, field: "name" | "qty", value: string) => {
        setForm((p) => ({
            ...p,
            saplings: p.saplings.map((it, i) => i === idx ? { ...it, [field]: field === "qty" ? Number(value) : value } : it)
        }));
    };

    const addItem = () => setForm((p) => ({ ...p, saplings: [...p.saplings, { name: "", qty: 1 }] }));
    const removeItem = (idx: number) => setForm((p) => ({ ...p, saplings: p.saplings.filter((_, i) => i !== idx) }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            date_received: form.date_received,
            requester_name: form.requester_name,
            address: form.address,
            saplings: form.saplings,
            monitoring_request_id: monitoringRequestId,
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="date_received">Date Received</Label>
                    <Input id="date_received" type="date" value={form.date_received} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="requester_name">Name of Requester</Label>
                    <Input id="requester_name" value={form.requester_name} onChange={handleChange} required />
                </div>
            </div>
            <div>
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={form.address} onChange={handleChange} required rows={3} />
            </div>

            <MonitoringRequestSearch
                value={monitoringRequestId}
                onChange={setMonitoringRequestId}
                onCreateNew={() => setIsCreateMonitoringDialogOpen(true)}
            />

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Requested Saplings</Label>
                    <Button type="button" size="sm" onClick={addItem}>Add Item</Button>
                </div>
                {form.saplings.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2">
                        <div className="col-span-8">
                            <Input placeholder="Name" value={it.name} onChange={(e) => handleItemChange(idx, "name", e.target.value)} />
                        </div>
                        <div className="col-span-3">
                            <Input type="number" min={1} placeholder="Qty" value={it.qty} onChange={(e) => handleItemChange(idx, "qty", e.target.value)} />
                        </div>
                        <div className="col-span-1">
                            <Button type="button" variant="destructive" onClick={() => removeItem(idx)}>X</Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{mode === "add" ? "Create" : "Save"}</Button>
            </div>

            {/* Create Monitoring Request Dialog */}
            <Dialog open={isCreateMonitoringDialogOpen} onOpenChange={setIsCreateMonitoringDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Monitoring Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="monitoring-title">Title *</Label>
                            <Input
                                id="monitoring-title"
                                value={newMonitoringRequest.title}
                                onChange={(e) => setNewMonitoringRequest(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter monitoring request title"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="monitoring-description">Description *</Label>
                            <Textarea
                                id="monitoring-description"
                                value={newMonitoringRequest.description}
                                onChange={(e) => setNewMonitoringRequest(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter monitoring request description"
                                required
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="monitoring-address">Address</Label>
                            <Input
                                id="monitoring-address"
                                value={newMonitoringRequest.address}
                                onChange={(e) => setNewMonitoringRequest(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Enter address"
                            />
                        </div>
                        <div>
                            <Label>Location *</Label>
                            <div className="border rounded-lg overflow-hidden">
                                <LocationPickerMap
                                    location={newMonitoringRequest.location}
                                    onLocationChange={(location) => setNewMonitoringRequest(prev => ({ ...prev, location }))}
                                />
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                Coordinates: {newMonitoringRequest.location.lat.toFixed(6)}, {newMonitoringRequest.location.lng.toFixed(6)}
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateMonitoringDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCreateMonitoringRequest}
                                disabled={isSubmittingMonitoring}
                            >
                                {isSubmittingMonitoring ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </form>
    );
};

export default SaplingRequestForm;
