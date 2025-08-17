import React, { useEffect, useState } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Button } from "@/presentation/components/shared/ui/button";
import { SaplingRequest } from "@/core/api/sapling-requests-api";
import { fetchMonitoringRequests, MonitoringRequest, createMonitoringRequest } from "@/core/api/monitoring-request-service";
import LocationPickerMap from "../../LocationPickerMap";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";

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
    // Embedded Monitoring Request fields for ADD mode
    const [mrStatus, setMrStatus] = useState<string>("Untracked");
    const [mrLocation, setMrLocation] = useState<{ lat: number; lng: number }>({ lat: 14.5995, lng: 120.9842 });

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
        }
    }, [initialData]);

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
        let monitoring_request_id = form.monitoring_request_id || null;
        try {
            if (mode === "add") {
                // Create a Monitoring Request with embedded fields
                const created = await createMonitoringRequest({
                    status: mrStatus,
                    location: mrLocation,
                    title: form.requester_name ? `Sapling Request: ${form.requester_name}` : undefined,
                    address: form.address || undefined,
                });
                monitoring_request_id = created.id;
            }
        } catch (err) {
            // Fall back to backend default auto-create
            toast.error("Failed to create Monitoring Request automatically. The system will create a default one.");
        }
        onSave({
            date_received: form.date_received,
            requester_name: form.requester_name,
            address: form.address,
            saplings: form.saplings,
            monitoring_request_id,
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

            {mode === "add" ? (
                <div className="space-y-2">
                    <Label className="text-sm">Monitoring Request</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs">Status</Label>
                            <select
                                value={mrStatus}
                                onChange={(e) => setMrStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="Untracked">Untracked</option>
                                <option value="Living">Living</option>
                                <option value="Dead">Dead</option>
                                <option value="Replaced">Replaced</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <Label className="text-xs">Location (click map to set)</Label>
                            <LocationPickerMap location={mrLocation} onLocationChange={setMrLocation} />
                        </div>
                    </div>
                </div>
            ) : (
                <MonitoringRequestPicker
                    value={form.monitoring_request_id}
                    onChange={(id) => setForm((p) => ({ ...p, monitoring_request_id: id }))}
                />
            )}

            <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{mode === "add" ? "Create" : "Save"}</Button>
            </div>
        </form>
    );
};

export default SaplingRequestForm;

// Lightweight search-and-pick component for Monitoring Requests
const MonitoringRequestPicker: React.FC<{
    value?: string;
    onChange: (id: string) => void;
}> = ({ value, onChange }) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<MonitoringRequest[]>([]);
    const listRef = React.useRef<HTMLDivElement | null>(null);
    const last = React.useRef<{ q: string; t: number } | null>(null);
    const [newOpen, setNewOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<string>("Living");
    const [newLoc, setNewLoc] = useState<{ lat: number; lng: number }>({ lat: 14.5995, lng: 120.9842 });

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
                // Debounce guard: ensure latest
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
                <div className="relative space-y-2">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search monitoring requests (title/address/requester)"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
                            onFocus={() => setOpen(true)}
                        />
                        <Button type="button" variant="secondary" onClick={() => setNewOpen(true)}>Create</Button>
                    </div>
                    {open && (
                        <div ref={listRef} className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-white shadow-sm">
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
                    {/* Manual fallback */}
                    <div className="mt-2">
                        <Label htmlFor="monitoring_request_id" className="text-xs text-gray-500">Or enter ID</Label>
                        <Input id="monitoring_request_id" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Paste Monitoring Request ID" />
                    </div>
                </div>
            )}

            {/* Inline create Monitoring Request dialog */}
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Create Monitoring Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label className="text-sm">Status</Label>
                            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="Living">Living</option>
                                <option value="Dead">Dead</option>
                                <option value="Replaced">Replaced</option>
                                <option value="Untracked">Untracked</option>
                            </select>
                        </div>
                        <div>
                            <Label className="text-sm">Location</Label>
                            <LocationPickerMap location={newLoc} onLocationChange={setNewLoc} />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <Button type="button" variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
                            <Button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const created = await createMonitoringRequest({ status: newStatus, location: newLoc });
                                        onChange(created.id);
                                        setNewOpen(false);
                                        toast.success("Monitoring Request created and linked.");
                                    } catch (e) {
                                        toast.error("Failed to create Monitoring Request");
                                    }
                                }}
                            >Create & Link</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
