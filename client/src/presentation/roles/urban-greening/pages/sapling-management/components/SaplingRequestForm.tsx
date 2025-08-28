import React, { useEffect, useState } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Button } from "@/presentation/components/shared/ui/button";
import { SaplingRequest } from "@/core/api/sapling-requests-api";

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

            <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{mode === "add" ? "Create" : "Save"}</Button>
            </div>
        </form>
    );
};

export default SaplingRequestForm;
