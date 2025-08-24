import React, { useState, useEffect } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Separator } from "@/presentation/components/shared/ui/separator";
import { TreeRequest } from "../logic/useTreeRequests";
import { Plus, Unlink, FileText, Users, MapPin, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchUrbanGreeningFeeRecords, UrbanGreeningFeeRecord, createUrbanGreeningFeeRecord, UrbanGreeningFeeRecordCreate } from "@/core/api/fee-api";
import { searchUrbanGreeningFeeRecords, UrbanGreeningFeeRecordSearchResult, updateTreeManagementRequest } from "@/core/api/tree-management-api";
import { fetchMonitoringRequests, createMonitoringRequest, MonitoringRequest } from "@/core/api/monitoring-request-service";
import { PLANT_STATUS_OPTIONS } from "../../../constants";
import LocationPickerMap from "../../LocationPickerMap";
import { toast } from "sonner";

interface TreeRequestFormProps {
    mode: "add" | "edit" | "view";
    initialData?: TreeRequest | null;
    onSave: (data: any) => void;
    onCancel: () => void;
    variant?: "full" | "inline"; // inline: compact styling for side panel
}

// Server-side search dropdown component with debounce
const FeeRecordSearch: React.FC<{ onSelect: (id: string) => void; disabled?: boolean }> = ({ onSelect, disabled }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<UrbanGreeningFeeRecordSearchResult[]>([]);
    const lastController = React.useRef<AbortController | null>(null);
    const scrollRef = React.useRef<HTMLDivElement | null>(null);

    // Debounce
    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        setLoading(true);
        const controller = new AbortController();
        lastController.current?.abort();
        lastController.current = controller;
        const handle = setTimeout(async () => {
            try {
                const data = await searchUrbanGreeningFeeRecords(query);
                // Preserve scroll position
                const sc = scrollRef.current;
                const top = sc?.scrollTop;
                setResults(data);
                if (sc && top !== undefined) requestAnimationFrame(() => { sc.scrollTop = top; });
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => { clearTimeout(handle); controller.abort(); };
    }, [query]);

    return (
        <div className="relative">
            <Input
                placeholder="Search fee records (ref # / payer)..."
                value={query}
                disabled={disabled}
                onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
                onFocus={() => { if (!open) setOpen(true); }}
            />
            {open && !disabled && (
                <div ref={scrollRef} className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-md border border-gray-300 bg-white shadow-sm text-sm">
                    {loading && (
                        <div className="p-2 text-gray-500">Searching...</div>
                    )}
                    {!loading && query.trim() && results.length === 0 && (
                        <div className="p-2 text-gray-500">No matches</div>
                    )}
                    {results.map(r => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => { onSelect(r.id); setOpen(false); setQuery(""); }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                            <div className="font-medium">{r.reference_number}</div>
                            <div className="text-xs text-gray-600 flex justify-between">
                                <span>{r.type.replace('_', ' ')}</span>
                                <span>{r.status}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Monitoring Request Field Component
const MonitoringRequestField: React.FC<{
    value?: string | null;
    onChange: (id: string | null) => void;
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
                    {disabled && (
                        <div className="text-sm text-gray-500">No monitoring request linked</div>
                    )}
                </div>
            )}
        </div>
    );
};

// Move SectionWrapper outside to prevent recreation on each render
const SectionWrapper: React.FC<{
    title: string;
    children: React.ReactNode;
    className?: string;
    icon?: React.ReactNode;
    variant?: "full" | "inline";
}> = ({ title, children, className, icon, variant = "full" }) => {
    const inline = variant === "inline";

    if (inline) {
        return (
            <div className={"space-y-3 " + (className || "")}>
                <div className="flex items-center gap-2">
                    {icon}
                    <h4 className="text-sm font-medium text-gray-700 tracking-wide uppercase">{title}</h4>
                </div>
                <Separator className="my-2" />
                {children}
            </div>
        );
    }
    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {children}
            </CardContent>
        </Card>
    );
};

const TreeRequestForm: React.FC<TreeRequestFormProps> = ({
    mode,
    initialData,
    onSave,
    onCancel,
    variant = "full",
}) => {
    const [formData, setFormData] = useState({
        request_number: "",
        request_type: "pruning",
        requester_name: "",
        property_address: "",
        status: "filed",
        request_date: new Date().toISOString().split('T')[0],
        fee_record_id: null as string | null,
        notes: "",
        monitoring_request_id: null as string | null,
        inspectors: [] as string[],
        // Stored as strings for backend compatibility; UI edits use treeEntries state
        trees_and_quantities: [] as string[],
        picture_links: [] as string[],
    });

    // Internal structured state for Trees & Quantities UI
    const [treeEntries, setTreeEntries] = useState<{ name: string; quantity: string }[]>([]);

    const parseTreeString = (s: string): { name: string; quantity: string } => {
        // Try patterns: "Name: 5", "Name - 5", "Name 5"
        const match = s.match(/^(.*?)[\s:-]+(\d+)$/);
        if (match) {
            const name = match[1].trim();
            const quantity = match[2];
            return { name, quantity };
        }
        return { name: s.trim(), quantity: "" };
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                request_number: initialData.request_number || "",
                request_type: initialData.request_type || "pruning",
                requester_name: initialData.requester_name || "",
                property_address: initialData.property_address || "",
                status: initialData.status || "filed",
                request_date: initialData.request_date?.split('T')[0] || new Date().toISOString().split('T')[0],
                fee_record_id: initialData.fee_record_id || null,
                notes: initialData.notes || "",
                monitoring_request_id: initialData.monitoring_request_id || null,
                inspectors: initialData.inspectors || [],
                trees_and_quantities: initialData.trees_and_quantities || [],
                picture_links: initialData.picture_links || [],
            });
            setTreeEntries((initialData.trees_and_quantities || []).map(parseTreeString));
        } else {
            setTreeEntries([]);
        }
    }, [initialData]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === "number") {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // For add mode, don't include processing fields
        // Compose trees_and_quantities from structured entries
        const composedTrees = treeEntries
            .filter(e => e.name.trim() !== "")
            .map(e => `${e.name.trim()}: ${e.quantity && !isNaN(Number(e.quantity)) ? e.quantity : 0}`);

        const base = {
            request_number: mode === "add" ? "" : formData.request_number, // Empty for auto-generation
            request_type: formData.request_type,
            requester_name: formData.requester_name,
            property_address: formData.property_address,
            status: formData.status,
            request_date: formData.request_date,
            notes: formData.notes,
            monitoring_request_id: formData.monitoring_request_id,
            inspectors: Array.isArray(formData.inspectors) ? formData.inspectors : [],
            trees_and_quantities: Array.isArray(composedTrees) ? composedTrees : [],
            picture_links: Array.isArray(formData.picture_links) ? formData.picture_links : [],
        };

        const submitData = {
            ...base,
            // Always include fee_record_id if available (API accepts it on create and update)
            fee_record_id: formData.fee_record_id === "" ? null : formData.fee_record_id,
        };

        onSave(submitData);
    };

    const isReadOnly = mode === "view";

    // Fee records for linking
    const { data: feeRecords = [] } = useQuery<UrbanGreeningFeeRecord[]>({
        queryKey: ["fee-records-all"],
        queryFn: fetchUrbanGreeningFeeRecords,
        staleTime: 60_000,
        enabled: !isReadOnly,
    });

    // Monitoring request functionality
    const [monitoringRequestOpen, setMonitoringRequestOpen] = useState(false);
    const [newMonitoringStatus, setNewMonitoringStatus] = useState<string>("Living");
    const [newMonitoringLocation, setNewMonitoringLocation] = useState<{ lat: number; lng: number }>({ lat: 14.5995, lng: 120.9842 });

    const handleGoToFeeRecords = () => {
        // Navigate to fee records page - assuming standard routing
        window.location.href = '/urban-greening/fee-records';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "filed": return "bg-blue-100 text-blue-800";
            case "on_hold": return "bg-gray-100 text-gray-800";
            case "for_signature": return "bg-indigo-100 text-indigo-800";
            case "payment_pending": return "bg-orange-100 text-orange-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const inline = variant === "inline";
    const formRef = React.useRef<HTMLFormElement | null>(null);
    const scrollContainerRef = React.useRef<HTMLElement | null>(null);
    React.useEffect(() => {
        if (formRef.current) {
            scrollContainerRef.current = formRef.current.closest('.overflow-auto') as HTMLElement | null;
        }
    }, []);
    const preserveScroll = (fn: () => void) => {
        const sc = scrollContainerRef.current;
        const top = sc?.scrollTop;
        fn();
        if (sc && top !== undefined) {
            requestAnimationFrame(() => { sc.scrollTop = top; });
        }
    };

    // --- Create Fee Record Dialog State & Logic ---
    const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
    const [creatingFee, setCreatingFee] = useState(false);
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];
    const addDays = (d: Date, n: number) => {
        const c = new Date(d);
        c.setDate(c.getDate() + n);
        return c;
    };
    const mapRequestTypeToFeeType = (t: string): UrbanGreeningFeeRecordCreate["type"] => {
        switch (t) {
            case "cutting":
                return "cutting_permit";
            case "pruning":
                return "pruning_permit";
            case "violation_complaint":
                return "violation_fine";
            default:
                return "pruning_permit";
        }
    };
    const [feeForm, setFeeForm] = useState<UrbanGreeningFeeRecordCreate>({
        type: mapRequestTypeToFeeType(formData.request_type),
        amount: 0,
        payer_name: formData.requester_name || "",
        date: formatDate(today),
        due_date: formatDate(addDays(today, 7)),
        status: "pending",
        or_number: "",
        payment_date: "",
    });

    const openFeeDialog = () => {
        // Prefill based on current request
        setFeeForm({
            type: mapRequestTypeToFeeType(formData.request_type),
            amount: 0,
            payer_name: formData.requester_name || "",
            date: formatDate(today),
            due_date: formatDate(addDays(today, 7)),
            status: "pending",
            or_number: "",
            payment_date: "",
        });
        setIsFeeDialogOpen(true);
    };

    const handleFeeField = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "number") {
            setFeeForm((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFeeForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const submitCreateFee = async (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!feeForm.payer_name.trim()) {
            toast.error("Payer name is required");
            return;
        }
        if (!feeForm.amount || feeForm.amount <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }
        setCreatingFee(true);
        try {
            // Omit empty optional fields
            const payload: UrbanGreeningFeeRecordCreate = {
                type: feeForm.type,
                amount: feeForm.amount,
                payer_name: feeForm.payer_name.trim(),
                date: feeForm.date,
                due_date: feeForm.due_date,
                status: feeForm.status,
                ...(feeForm.or_number?.trim() ? { or_number: feeForm.or_number.trim() } : {}),
                ...(feeForm.payment_date?.trim() ? { payment_date: feeForm.payment_date } : {}),
                ...(typeof (feeForm as any).reference_number === 'string' && (feeForm as any).reference_number.trim() ? { reference_number: (feeForm as any).reference_number.trim() } : {}),
            };
            const created = await createUrbanGreeningFeeRecord(payload);
            setFormData((prev) => ({ ...prev, fee_record_id: created.id }));
            // Persist link immediately if editing an existing request
            if (mode !== "add" && initialData?.id) {
                try {
                    await updateTreeManagementRequest(initialData.id, { fee_record_id: created.id });
                } catch (e) {
                    console.warn("Linking fee to request failed; will still be saved on form submit.", e);
                }
            }
            setIsFeeDialogOpen(false);
            toast.success("Fee record created and linked to the request");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create fee record");
        } finally {
            setCreatingFee(false);
        }
    };

    return (
        <>
            <form ref={formRef} onSubmit={handleSubmit} className={inline ? "space-y-5" : "space-y-6"}>
                <div className={inline ? "space-y-5" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>
                    <SectionWrapper
                        title="Request Information"
                        icon={<FileText className="w-5 h-5 text-blue-600" />}
                        variant={variant}
                    >
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mode !== "add" && (
                                    <div>
                                        <Label htmlFor="request_number">Request Number</Label>
                                        <Input
                                            id="request_number"
                                            name="request_number"
                                            value={formData.request_number}
                                            readOnly
                                            className="bg-gray-50 font-mono"
                                        />
                                    </div>
                                )}
                                {mode === "add" && (
                                    <div>
                                        <Label htmlFor="request_number">Request Number</Label>
                                        <Input
                                            id="request_number"
                                            value="Auto-generated"
                                            readOnly
                                            className="bg-gray-50 font-mono"
                                        />
                                    </div>
                                )}
                                <div>
                                    <Label htmlFor="request_type">Request Type *</Label>
                                    <select
                                        id="request_type"
                                        name="request_type"
                                        value={formData.request_type}
                                        onChange={handleInputChange}
                                        disabled={isReadOnly}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="pruning">Pruning</option>
                                        <option value="cutting">Cutting</option>
                                        <option value="violation_complaint">Violation Complaint</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="request_date">Request Date</Label>
                                    <Input
                                        id="request_date"
                                        name="request_date"
                                        type="date"
                                        value={formData.request_date}
                                        onChange={handleInputChange}
                                        readOnly={isReadOnly}
                                    />
                                </div>
                                {mode !== "add" && (
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <div className="flex items-center gap-2">
                                            <select
                                                id="status"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                disabled={isReadOnly}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="filed">Filed</option>
                                                <option value="on_hold">On Hold</option>
                                                <option value="for_signature">For Signature</option>
                                                <option value="payment_pending">Payment Pending</option>
                                            </select>
                                            <Badge className={getStatusColor(formData.status)}>
                                                {formData.status.replace("_", " ").toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper
                        title="Requester Information"
                        icon={<Users className="w-5 h-5 text-green-600" />}
                        variant={variant}
                    >
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="requester_name">Full Name *</Label>
                                <Input
                                    id="requester_name"
                                    name="requester_name"
                                    value={formData.requester_name}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                    placeholder="Enter requester's full name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="property_address">Property Address *</Label>
                                <Textarea
                                    id="property_address"
                                    name="property_address"
                                    value={formData.property_address}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                    rows={inline ? 2 : 3}
                                    placeholder="Enter complete property address"
                                />
                            </div>
                        </div>
                    </SectionWrapper>
                </div>

                {/* Second row - full width sections */}
                <div className="space-y-6">
                    <SectionWrapper
                        title="Location & Monitoring"
                        icon={<MapPin className="w-5 h-5 text-purple-600" />}
                        variant={variant}
                    >
                        <div className="space-y-4">
                            <MonitoringRequestField
                                value={formData.monitoring_request_id}
                                onChange={(id) => setFormData(prev => ({ ...prev, monitoring_request_id: id }))}
                                disabled={isReadOnly}
                                onCreateNew={() => setMonitoringRequestOpen(true)}
                            />
                            <div>
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    rows={inline ? 2 : 3}
                                    placeholder="Any additional information or special requirements"
                                />
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper
                        title="Inspection Information"
                        icon={<Users className="w-5 h-5 text-orange-600" />}
                        variant={variant}
                    >
                        <div className="space-y-6">
                            <div>
                                <Label className="text-base font-medium">Inspectors</Label>
                                <p className="text-sm text-gray-600 mb-3">Add inspectors responsible for this request</p>
                                <div className="space-y-3">
                                    {formData.inspectors.map((inspector, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <Input
                                                    value={inspector}
                                                    onChange={(e) => {
                                                        const newInspectors = [...formData.inspectors];
                                                        newInspectors[index] = e.target.value;
                                                        setFormData(prev => ({ ...prev, inspectors: newInspectors }));
                                                    }}
                                                    readOnly={isReadOnly}
                                                    placeholder="Enter inspector name"
                                                    className="bg-white"
                                                />
                                            </div>
                                            {!isReadOnly && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newInspectors = formData.inspectors.filter((_, i) => i !== index);
                                                        setFormData(prev => ({ ...prev, inspectors: newInspectors }));
                                                    }}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {!isReadOnly && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-dashed border-gray-300 text-gray-600 hover:border-gray-400"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    inspectors: [...prev.inspectors, '']
                                                }));
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Add Inspector
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <Separator className="my-4" />

                            <div>
                                <Label className="text-base font-medium">Trees & Quantities</Label>
                                <p className="text-sm text-gray-600 mb-3">Specify the tree species and quantities for this request</p>
                                <div className="space-y-3">
                                    {treeEntries.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <Input
                                                    value={entry.name}
                                                    onChange={(e) => {
                                                        const updated = [...treeEntries];
                                                        updated[index] = { ...updated[index], name: e.target.value };
                                                        setTreeEntries(updated);
                                                    }}
                                                    readOnly={isReadOnly}
                                                    placeholder="Tree species (e.g., Narra, Mahogany, Mango)"
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <Input
                                                    value={entry.quantity}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                                        const updated = [...treeEntries];
                                                        updated[index] = { ...updated[index], quantity: val };
                                                        setTreeEntries(updated);
                                                    }}
                                                    readOnly={isReadOnly}
                                                    placeholder="Qty"
                                                    className="text-center bg-white"
                                                />
                                            </div>
                                            {!isReadOnly && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setTreeEntries(treeEntries.filter((_, i) => i !== index));
                                                    }}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {!isReadOnly && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-dashed border-gray-300 text-gray-600 hover:border-gray-400"
                                            onClick={() => setTreeEntries([...treeEntries, { name: "", quantity: "" }])}
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Add Tree Species
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <Separator className="my-4" />

                            <div>
                                <Label className="text-base font-medium">Picture Links</Label>
                                <p className="text-sm text-gray-600 mb-3">Add photo URLs for documentation</p>
                                <div className="space-y-3">
                                    {formData.picture_links.map((link, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <Input
                                                    value={link}
                                                    onChange={(e) => {
                                                        const newLinks = [...formData.picture_links];
                                                        newLinks[index] = e.target.value;
                                                        setFormData(prev => ({ ...prev, picture_links: newLinks }));
                                                    }}
                                                    readOnly={isReadOnly}
                                                    placeholder="Enter photo URL (e.g., https://example.com/photo.jpg)"
                                                    className="bg-white"
                                                />
                                            </div>
                                            {!isReadOnly && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newLinks = formData.picture_links.filter((_, i) => i !== index);
                                                        setFormData(prev => ({ ...prev, picture_links: newLinks }));
                                                    }}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {!isReadOnly && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-dashed border-gray-300 text-gray-600 hover:border-gray-400"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    picture_links: [...prev.picture_links, '']
                                                }));
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Add Picture Link
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SectionWrapper>

                    {mode !== "add" ? (
                        <SectionWrapper
                            title="Processing Information"
                            variant={variant}
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Fee Record</Label>
                                    {formData.fee_record_id ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={formData.fee_record_id}
                                                readOnly
                                                className="bg-gray-50 text-xs"
                                            />
                                            {!isReadOnly && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setFormData(prev => ({ ...prev, fee_record_id: null }))}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Unlink className="w-4 h-4" /> Unlink
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        !isReadOnly && (
                                            <div className="flex flex-col gap-2">
                                                <FeeRecordSearch
                                                    onSelect={(id) => setFormData(prev => ({ ...prev, fee_record_id: id }))}
                                                    disabled={isReadOnly}
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={openFeeDialog}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Plus className="w-4 h-4" /> Create Fee Record
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="notes">Processing Notes</Label>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        readOnly={isReadOnly}
                                        rows={inline ? 2 : 3}
                                    />
                                </div>
                            </div>
                        </SectionWrapper>
                    ) : (
                        <SectionWrapper
                            title="Processing Information"
                            variant={variant}
                        >
                            <div className="space-y-3">
                                <Label>Fee Record</Label>
                                {formData.fee_record_id ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={formData.fee_record_id}
                                            readOnly
                                            className="bg-gray-50 text-xs"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFormData(prev => ({ ...prev, fee_record_id: null }))}
                                            className="flex items-center gap-1"
                                        >
                                            <Unlink className="w-4 h-4" /> Unlink
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={openFeeDialog}
                                            className="flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" /> Create Fee Record
                                        </Button>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500">The created fee record will be linked to this request when you create it.</p>
                            </div>
                        </SectionWrapper>
                    )}
                </div>

                {/* Form Actions */}
                <div className="border-t pt-6 mt-8">
                    <div className={inline ? "flex gap-3 justify-end" : "flex justify-end space-x-4"}>
                        <Button
                            type="button"
                            variant="outline"
                            size={inline ? "sm" : "default"}
                            onClick={onCancel}
                            className="min-w-[100px]"
                        >
                            {mode === "view" ? "Close" : "Cancel"}
                        </Button>
                        {mode !== "view" && (
                            <Button
                                type="submit"
                                size={inline ? "sm" : "default"}
                                className="min-w-[120px]"
                            >
                                {mode === "add" ? "Create Request" : "Save Changes"}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
            {/* Create Fee Record Dialog */}
            <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Fee Record</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreateFee} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-1">
                                <Label htmlFor="type">Type *</Label>
                                <select
                                    id="type"
                                    name="type"
                                    value={feeForm.type}
                                    onChange={handleFeeField}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="pruning_permit">Pruning Permit</option>
                                    <option value="cutting_permit">Cutting Permit</option>
                                    <option value="violation_fine">Violation Fine</option>
                                </select>
                            </div>
                            <div className="sm:col-span-1">
                                <Label htmlFor="amount">Amount (PHP) *</Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={feeForm.amount}
                                    onChange={handleFeeField}
                                    required
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <Label htmlFor="payer_name">Payer Name *</Label>
                                <Input
                                    id="payer_name"
                                    name="payer_name"
                                    value={feeForm.payer_name}
                                    onChange={handleFeeField}
                                    required
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <Label htmlFor="date">Date *</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={feeForm.date}
                                    onChange={handleFeeField}
                                    required
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <Label htmlFor="due_date">Due Date *</Label>
                                <Input
                                    id="due_date"
                                    name="due_date"
                                    type="date"
                                    value={feeForm.due_date}
                                    onChange={handleFeeField}
                                    required
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <Label htmlFor="status">Status *</Label>
                                <select
                                    id="status"
                                    name="status"
                                    value={feeForm.status}
                                    onChange={handleFeeField}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="sm:col-span-1">
                                <Label htmlFor="or_number">OR Number</Label>
                                <Input
                                    id="or_number"
                                    name="or_number"
                                    value={feeForm.or_number || ""}
                                    onChange={handleFeeField}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <Label htmlFor="payment_date">Payment Date</Label>
                                <Input
                                    id="payment_date"
                                    name="payment_date"
                                    type="date"
                                    value={feeForm.payment_date || ""}
                                    onChange={handleFeeField}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFeeDialogOpen(false)}
                                disabled={creatingFee}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={creatingFee}>
                                {creatingFee ? "Creating..." : "Create & Link"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Monitoring Request Creation Dialog */}
            <Dialog open={monitoringRequestOpen} onOpenChange={setMonitoringRequestOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Monitoring Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Status</Label>
                            <select
                                value={newMonitoringStatus}
                                onChange={(e) => setNewMonitoringStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                {PLANT_STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Location</Label>
                            <LocationPickerMap
                                location={newMonitoringLocation}
                                onLocationChange={setNewMonitoringLocation}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
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
                                            title: `Tree Management: ${formData.requester_name || 'Request'}`,
                                            address: formData.property_address,
                                            source_type: "tree_management",
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
        </>
    );
};

export default TreeRequestForm;
