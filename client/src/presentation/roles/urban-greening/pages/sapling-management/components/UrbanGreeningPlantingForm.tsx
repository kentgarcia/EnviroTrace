import React, { useState, useEffect } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import { UrbanGreeningPlanting } from "@/core/api/planting-api";
import { fetchMonitoringRequests, MonitoringRequest } from "@/core/api/monitoring-request-service";

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
        planting_method: "",
        responsible_person: "",
        contact_number: "",
        organization: "",
        notes: "",
        monitoring_request_id: "",
    });
    const [plants, setPlants] = useState<PlantItem[]>([
        { planting_type: "ornamental_plants", species_name: "", quantity: 1 }
    ]);

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
                    planting_method: initialData.planting_method || "",
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
                    planting_method: initialData.planting_method || "",
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

    const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const list = plants.filter(p => p.species_name.trim() && p.quantity > 0);
        const first = list[0] || plants[0] || { planting_type: formData.planting_type, species_name: formData.species_name, quantity: formData.quantity_planted };
        const payload = {
            ...formData,
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Planting Information</h3>
                        <div className="space-y-4">
                            {mode !== "add" && (
                                <div>
                                    <Label htmlFor="record_number">Record Number</Label>
                                    <Input
                                        id="record_number"
                                        value={initialData?.record_number || ""}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                            )}

                            {/* Plants List */}
                            <div className="space-y-2">
                                <Label>Plants</Label>
                                {plants.map((p, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                                        <div className="md:col-span-4">
                                            <Label className="text-xs">Type</Label>
                                            <select
                                                name={`plants.${idx}.planting_type`}
                                                value={p.planting_type}
                                                onChange={(e) => {
                                                    const v = e.target.value as PlantItem["planting_type"];
                                                    setPlants((prev) => prev.map((it, i) => i === idx ? { ...it, planting_type: v } : it));
                                                }}
                                                disabled={isReadOnly}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="ornamental_plants">Ornamental Plants</option>
                                                <option value="ornamental_plants_private">Ornamental Plants (Private)</option>
                                                <option value="trees">Trees</option>
                                                <option value="seeds">Seeds</option>
                                                <option value="seeds_private">Seeds (Private)</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-5">
                                            <Label className="text-xs">Species</Label>
                                            <Input
                                                value={p.species_name}
                                                onChange={(e) => setPlants((prev) => prev.map((it, i) => i === idx ? { ...it, species_name: e.target.value } : it))}
                                                readOnly={isReadOnly}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="text-xs">Qty</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={p.quantity}
                                                onChange={(e) => setPlants((prev) => prev.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, Number(e.target.value) || 1) } : it))}
                                                readOnly={isReadOnly}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-1 flex">
                                            {!isReadOnly && (
                                                <Button type="button" variant="outline" className="mt-5" onClick={() => setPlants((prev) => prev.filter((_, i) => i !== idx))} disabled={plants.length <= 1}>Remove</Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!isReadOnly && (
                                    <Button type="button" variant="secondary" onClick={() => setPlants((prev) => [...prev, { planting_type: "ornamental_plants", species_name: "", quantity: 1 }])}>Add Plant</Button>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="planting_date">Date *</Label>
                                <Input
                                    id="planting_date"
                                    name="planting_date"
                                    type="date"
                                    value={formData.planting_date}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Monitoring Request Link (replaces location info) */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Monitoring Request Link</h3>
                        <MonitoringRequestPicker
                            value={formData.monitoring_request_id}
                            onChange={(id) => setFormData((p) => ({ ...p, monitoring_request_id: id }))}
                        />
                        <div className="mt-4">
                            <Label htmlFor="planting_method">Planting Method</Label>
                            <select
                                id="planting_method"
                                name="planting_method"
                                value={formData.planting_method}
                                onChange={handleSelectChange}
                                disabled={isReadOnly}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select method</option>
                                <option value="direct_seeding">Direct Seeding</option>
                                <option value="transplanting">Transplanting</option>
                                <option value="grafting">Grafting</option>
                                <option value="cutting">Cutting</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Responsible Person Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Responsible Person</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="responsible_person">Full Name *</Label>
                                <Input
                                    id="responsible_person"
                                    name="responsible_person"
                                    value={formData.responsible_person}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="contact_number">Contact Number</Label>
                                <Input
                                    id="contact_number"
                                    name="contact_number"
                                    value={formData.contact_number}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            <div>
                                <Label htmlFor="organization">Organization</Label>
                                <Input
                                    id="organization"
                                    name="organization"
                                    value={formData.organization}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes only (Project Information removed) */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Notes</h3>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            readOnly={isReadOnly}
                            rows={3}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    {mode === "view" ? "Close" : "Cancel"}
                </Button>
                {mode !== "view" && (
                    <Button type="submit">
                        {mode === "add" ? "Create Planting Record" : "Update Planting Record"}
                    </Button>
                )}
            </div>
        </form>
    );
};

export default UrbanGreeningPlantingForm;

// Lightweight search-and-pick component for Monitoring Requests
const MonitoringRequestPicker: React.FC<{
    value?: string;
    onChange: (id: string) => void;
}> = ({ value, onChange }) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<MonitoringRequest[]>([]);
    const last = React.useRef<{ q: string; t: number } | null>(null);

    useEffect(() => {
        let active = true;
        const run = async () => {
            const stamp = Date.now();
            last.current = { q: query, t: stamp };
            if (!query.trim()) { setResults([]); return; }
            setLoading(true);
            try {
                const data = await fetchMonitoringRequests({ search: query.trim(), limit: 10 });
                if (!active) return;
                if (last.current?.t === stamp) {
                    setResults(data.reports || []);
                }
            } catch {
                if (active) setResults([]);
            } finally {
                if (active) setLoading(false);
            }
        };
        const h = setTimeout(run, 250);
        return () => { active = false; clearTimeout(h); };
    }, [query]);

    return (
        <div className="space-y-2">
            <Label>Monitoring Request (optional)</Label>
            {value ? (
                <div className="flex items-center gap-2">
                    <Input readOnly value={value} className="bg-gray-50 text-xs" />
                    <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}>Unlink</Button>
                </div>
            ) : (
                <div className="relative">
                    <Input
                        placeholder="Search monitoring requests (title/address/requester)"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
                        onFocus={() => setOpen(true)}
                    />
                    {open && (
                        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-white shadow-sm">
                            {loading && <div className="p-2 text-sm text-gray-500">Searching…</div>}
                            {!loading && query.trim() && results.length === 0 && (
                                <div className="p-2 text-sm text-gray-500">No matches</div>
                            )}
                            {results.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                                    onClick={() => { onChange(r.id); setOpen(false); setQuery(""); }}
                                >
                                    <div className="text-sm font-medium truncate">{r.title}</div>
                                    <div className="text-[11px] text-gray-600 truncate">{r.address}</div>
                                    <div className="text-[11px] text-gray-500">{r.status}</div>
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="mt-2">
                        <Label htmlFor="monitoring_request_id" className="text-xs text-gray-500">Or enter ID</Label>
                        <Input id="monitoring_request_id" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Paste Monitoring Request ID" />
                    </div>
                </div>
            )}
        </div>
    );
};
