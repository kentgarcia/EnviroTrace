import React, { useEffect, useState } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Button } from "@/presentation/components/shared/ui/button";
import { SaplingRequest } from "@/core/api/sapling-requests-api";
import { fetchMonitoringRequests, MonitoringRequest } from "@/core/api/monitoring-request-service";

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

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            date_received: form.date_received,
            requester_name: form.requester_name,
            address: form.address,
            saplings: form.saplings,
            monitoring_request_id: form.monitoring_request_id || null,
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

            <MonitoringRequestPicker
                value={form.monitoring_request_id}
                onChange={(id) => setForm((p) => ({ ...p, monitoring_request_id: id }))}
            />

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
                <div className="relative">
                    <Input
                        placeholder="Search monitoring requests (title/address/requester)"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
                        onFocus={() => setOpen(true)}
                    />
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
        </div>
    );
};
