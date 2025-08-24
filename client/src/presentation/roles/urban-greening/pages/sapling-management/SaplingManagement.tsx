import React, { useMemo, useState } from "react";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
// ColorDivider not used here, removing import
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { Plus, Sprout, TreePine } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/shared/ui/tabs";
import {
    useSaplingRequests,
    useSaplingRequestMutations,
    useUrbanGreeningPlantings,
    useUrbanGreeningStatistics,
} from "./logic/useSaplingManagement";
import { SaplingRequest } from "@/core/api/sapling-requests-api";
import { UrbanGreeningPlanting } from "@/core/api/planting-api";
import SaplingRequestForm from "./components/SaplingRequestForm";
import UrbanGreeningPlantingForm from "./components/UrbanGreeningPlantingForm";
import { fetchMonitoringRequest, updateMonitoringRequest } from "@/core/api/monitoring-request-service";
import { useUrbanGreeningPlantingMutations } from "../planting-records/logic/usePlantingRecords";
import { PLANT_STATUS_OPTIONS } from "../../constants";
import { toast } from "sonner";

const SaplingManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("saplings");
    // Sapling Requests state
    const [srSearch, setSrSearch] = useState("");
    const [srOpen, setSrOpen] = useState(false);
    const [srMode, setSrMode] = useState<"add" | "edit">("add");
    const [srSelected, setSrSelected] = useState<SaplingRequest | null>(null);

    // State for monitoring requests for sapling requests
    const [srLinkedMonitoring, setSrLinkedMonitoring] = useState<any | null>(null);

    const { saplingRequests } = useSaplingRequests();
    const { createSapling, updateSapling, deleteSapling } = useSaplingRequestMutations();

    const srFiltered = useMemo(() => {
        const q = srSearch.toLowerCase();
        return saplingRequests.filter((r) =>
            !srSearch ||
            r.requester_name.toLowerCase().includes(q) ||
            r.address.toLowerCase().includes(q)
        );
    }, [saplingRequests, srSearch]);

    // Simple client-side statistics for Sapling Requests
    const srStats = useMemo(() => {
        const totalRequests = saplingRequests.length;
        let totalItems = 0;
        const bySpecies = new Map<string, number>();
        for (const r of saplingRequests) {
            let items: any[] = [];
            try {
                items = typeof (r as any).saplings === "string" ? JSON.parse((r as any).saplings) : ((r as any).saplings as any[]);
            } catch { }
            for (const it of items || []) {
                const qty = Number(it?.qty) || 0;
                totalItems += qty;
                const key = String(it?.name || "Unknown");
                bySpecies.set(key, (bySpecies.get(key) || 0) + qty);
            }
        }
        const topSpecies = Array.from(bySpecies.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        return { totalRequests, totalItems, topSpecies };
    }, [saplingRequests]);

    const srColumns: ColumnDef<SaplingRequest>[] = useMemo(() => [
        { accessorKey: "date_received", header: "Date Received" },
        { accessorKey: "requester_name", header: "Requester" },
        { accessorKey: "address", header: "Address" },
        {
            accessorKey: "saplings", header: "Items", cell: ({ row }) => {
                const v = row.original.saplings as any;
                let items: any[] = [];
                try { items = typeof v === "string" ? JSON.parse(v) : (v as any[]); } catch { }
                return <span className="text-xs text-gray-700">{items.map(i => `${i.name} (${i.qty})`).join(", ")}</span>;
            }
        },
    ], []);

    const handleSrAdd = () => { setSrMode("add"); setSrSelected(null); setSrOpen(true); };
    const handleSrEdit = (row: SaplingRequest) => { setSrMode("edit"); setSrSelected(row); setSrOpen(true); };
    const handleSrSave = async (data: any) => {
        if (srMode === "add") {
            await createSapling.mutateAsync(data);
        } else if (srSelected) {
            await updateSapling.mutateAsync({ id: srSelected.id, data });

            // Update monitoring request source_type if there's a linked monitoring request
            const monitoring_request_id = data.monitoring_request_id || srSelected.monitoring_request_id;
            if (monitoring_request_id) {
                try {
                    const currentMonitoring = await fetchMonitoringRequest(monitoring_request_id);
                    await updateMonitoringRequest(monitoring_request_id, {
                        ...currentMonitoring,
                        source_type: "urban_greening"
                    });
                } catch (error) {
                    console.error("Failed to update monitoring request source_type:", error);
                    // Don't show error to user as this is a background update
                }
            }
        }
        setSrOpen(false);
    };
    const handleSrDelete = async (row: SaplingRequest) => { await deleteSapling.mutateAsync(row.id); };

    // Urban Greening Plantings (reuse existing hooks + UI pattern)
    const { data: plantings = [] } = useUrbanGreeningPlantings();
    const [ugSelected, setUgSelected] = useState<UrbanGreeningPlanting | null>(null);
    const [ugOpen, setUgOpen] = useState(false);
    const [ugMode, setUgMode] = useState<"add" | "edit" | "view">("add");
    const { createMutation: createUG, updateMutation: updateUG } = useUrbanGreeningPlantingMutations();
    const [ugLinkedMonitoring, setUgLinkedMonitoring] = useState<any | null>(null);
    const [ugLinkedLoading, setUgLinkedLoading] = useState(false);

    const ugColumns: ColumnDef<UrbanGreeningPlanting>[] = useMemo(() => [
        { accessorKey: "record_number", header: "Record No." },
        {
            accessorKey: "species_name",
            header: "Species",
            cell: ({ row }) => {
                const item = row.original as any;
                const plants = Array.isArray(item.plants) ? item.plants : [];
                if (plants.length > 0) {
                    return <span className="text-xs text-gray-700">{plants.map((p: any) => `${p.species_name} (${p.quantity})`).join(", ")}</span>;
                }
                return <span>{item.species_name}</span>;
            }
        },
        { accessorKey: "quantity_planted", header: "Qty" },
        { accessorKey: "planting_date", header: "Date" },
    ], []);

    // Load linked monitoring request for UG selected row
    React.useEffect(() => {
        const id = (ugSelected as any)?.monitoring_request_id as string | undefined;
        if (!id) { setUgLinkedMonitoring(null); return; }
        setUgLinkedLoading(true);
        fetchMonitoringRequest(id)
            .then((res) => setUgLinkedMonitoring(res))
            .catch(() => setUgLinkedMonitoring(null))
            .finally(() => setUgLinkedLoading(false));
    }, [(ugSelected as any)?.monitoring_request_id]);

    // Load linked monitoring request for SR selected row
    React.useEffect(() => {
        const id = srSelected?.monitoring_request_id as string | undefined;
        if (!id) { setSrLinkedMonitoring(null); return; }

        fetchMonitoringRequest(id)
            .then((res) => setSrLinkedMonitoring(res))
            .catch(() => setSrLinkedMonitoring(null))
    }, [srSelected?.monitoring_request_id]);

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="urban-greening" />

                <div className="p-6 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="saplings" className="text-sm">Sapling Requests</TabsTrigger>
                            <TabsTrigger value="urban-greening" className="text-sm">Urban Greening</TabsTrigger>
                        </TabsList>

                        <TabsContent value="saplings" className="mt-4">
                            {/* Sapling Requests Section */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="flex items-center gap-2"><Sprout className="w-5 h-5" /> Sapling Requests</CardTitle>
                                    <div className="flex gap-2">
                                        <Input placeholder="Search requester or address" value={srSearch} onChange={(e) => setSrSearch(e.target.value)} />
                                        <Button size="sm" onClick={handleSrAdd}><Plus className="w-4 h-4 mr-1" />Add</Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2">
                                            <DataTable data={srFiltered} columns={srColumns} onRowClick={(row) => setSrSelected(row.original as SaplingRequest)} />
                                        </div>
                                        <div className="lg:col-span-1">
                                            <Card>
                                                <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
                                                <CardContent>
                                                    {srSelected ? (
                                                        <div className="space-y-2 text-sm">
                                                            <div><span className="text-gray-500">Date:</span> {srSelected.date_received}</div>
                                                            <div><span className="text-gray-500">Requester:</span> {srSelected.requester_name}</div>
                                                            <div><span className="text-gray-500">Address:</span> {srSelected.address}</div>
                                                            <div className="text-gray-500">Items:</div>
                                                            <ul className="list-disc ml-5">
                                                                {(() => { let items: any[] = []; try { items = typeof srSelected.saplings === "string" ? JSON.parse(srSelected.saplings) : (srSelected.saplings as any[]); } catch { } return items; })().map((i, idx) => (
                                                                    <li key={idx}>{i.name} - {i.qty}</li>
                                                                ))}
                                                            </ul>

                                                            {/* Monitoring Request Link for Sapling Requests */}
                                                            {srSelected.monitoring_request_id && (
                                                                <div className="space-y-2 pt-3 border-t">
                                                                    <span className="text-sm font-medium text-gray-700">Monitoring Link:</span>
                                                                    {!srLinkedMonitoring ? (
                                                                        <Badge variant="outline" className="text-xs">Loading...</Badge>
                                                                    ) : srLinkedMonitoring ? (
                                                                        <div className="space-y-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="flex-1">
                                                                                    <span className="text-xs font-medium">{srLinkedMonitoring.title}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <Badge variant="outline" className="text-xs">{srLinkedMonitoring.status}</Badge>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-xs text-gray-600">
                                                                                <span className="font-medium">Location:</span>{" "}
                                                                                {srLinkedMonitoring.address && srLinkedMonitoring.address.trim().length > 0
                                                                                    ? srLinkedMonitoring.address
                                                                                    : `(${srLinkedMonitoring.location?.lat ?? '—'}, ${srLinkedMonitoring.location?.lng ?? '—'})`}
                                                                            </div>
                                                                            {srLinkedMonitoring.description && (
                                                                                <div className="text-xs text-gray-600">
                                                                                    <span className="font-medium">Description:</span> {srLinkedMonitoring.description}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <Badge variant="outline" className="text-xs">Error loading monitoring data</Badge>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="flex gap-2 pt-2">
                                                                <Button size="sm" onClick={() => setSrOpen(true)}>Edit</Button>
                                                                <Button size="sm" variant="destructive" onClick={() => handleSrDelete(srSelected!)}>Delete</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3 text-sm">
                                                            <div className="font-medium">Statistics</div>
                                                            <div className="flex justify-between"><span className="text-gray-500">Total Requests</span><span className="font-semibold">{srStats.totalRequests}</span></div>
                                                            <div className="flex justify-between"><span className="text-gray-500">Total Items Requested</span><span className="font-semibold">{srStats.totalItems}</span></div>
                                                            {srStats.topSpecies.length > 0 && (
                                                                <div>
                                                                    <div className="text-gray-500 mb-1">Top Species</div>
                                                                    <ul className="space-y-1">
                                                                        {srStats.topSpecies.map(([name, qty]) => (
                                                                            <li key={name} className="flex justify-between"><span>{name}</span><span className="font-medium">{qty}</span></li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-gray-400">Tip: Click a row to view details.</div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="urban-greening" className="mt-4">
                            {/* Urban Greening Section */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="flex items-center gap-2"><TreePine className="w-5 h-5" /> Urban Greening</CardTitle>
                                    <Button size="sm" onClick={() => { setUgMode("add"); setUgSelected(null); setUgOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Planting</Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2">
                                            <DataTable data={plantings} columns={ugColumns} onRowClick={(row) => { setUgSelected(row.original as UrbanGreeningPlanting); }} />
                                        </div>
                                        <div className="lg:col-span-1">
                                            <Card>
                                                <CardHeader><CardTitle className="text-lg">{ugSelected ? "Planting Details" : "Statistics"}</CardTitle></CardHeader>
                                                <CardContent>
                                                    {ugSelected ? (
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between"><span className="text-gray-500">Record #</span><span className="font-medium">{(ugSelected as any).record_number || "—"}</span></div>
                                                            {Array.isArray((ugSelected as any).plants) && (ugSelected as any).plants.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    <div className="text-gray-500">Plants</div>
                                                                    <ul className="list-disc ml-5">
                                                                        {((ugSelected as any).plants as any[]).map((p, i) => (
                                                                            <li key={i}>{p.planting_type}: {p.species_name} - {p.quantity}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium">{(ugSelected as any).planting_type}</span></div>
                                                                    <div className="flex justify-between"><span className="text-gray-500">Species</span><span className="font-medium">{(ugSelected as any).species_name}</span></div>
                                                                    <div className="flex justify-between"><span className="text-gray-500">Qty</span><span className="font-medium">{(ugSelected as any).quantity_planted}</span></div>
                                                                </>
                                                            )}
                                                            <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{(ugSelected as any).planting_date}</span></div>
                                                            {(ugSelected as any).monitoring_request_id && (
                                                                <div className="pt-2 border-t space-y-2">
                                                                    <span className="text-sm font-medium text-gray-700">Monitoring Link:</span>
                                                                    {ugLinkedLoading ? (
                                                                        <div className="text-xs text-gray-500">Loading linked request...</div>
                                                                    ) : ugLinkedMonitoring ? (
                                                                        <div className="space-y-2">
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-xs text-gray-600">Title:</span>
                                                                                <span className="text-xs font-medium">{ugLinkedMonitoring.title}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-xs text-gray-600">Status:</span>
                                                                                <Badge variant="outline" className="text-xs">{ugLinkedMonitoring.status}</Badge>
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <span className="text-xs text-gray-600">Location:</span>
                                                                                <div className="text-xs">
                                                                                    {ugLinkedMonitoring.address && ugLinkedMonitoring.address.trim().length > 0
                                                                                        ? ugLinkedMonitoring.address
                                                                                        : `(${ugLinkedMonitoring.location?.lat ?? '—'}, ${ugLinkedMonitoring.location?.lng ?? '—'})`}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-1 pt-2">
                                                                                {PLANT_STATUS_OPTIONS.map(status => (
                                                                                    <Button
                                                                                        key={status}
                                                                                        size="sm"
                                                                                        variant="outline"
                                                                                        className="text-xs h-6 px-2"
                                                                                        onClick={async () => {
                                                                                            try {
                                                                                                await updateMonitoringRequest(ugLinkedMonitoring.id, {
                                                                                                    status: status,
                                                                                                    location: ugLinkedMonitoring.location,
                                                                                                    source_type: "urban_greening"
                                                                                                });
                                                                                                const updated = await fetchMonitoringRequest(ugLinkedMonitoring.id);
                                                                                                setUgLinkedMonitoring(updated);
                                                                                                toast.success(`Status updated to ${status}`);
                                                                                            } catch (error) {
                                                                                                toast.error("Failed to update status");
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        {status}
                                                                                    </Button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-xs text-gray-500">
                                                                            Linked to ID: {(ugSelected as any).monitoring_request_id}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="flex gap-2 pt-2">
                                                                <Button size="sm" onClick={() => { setUgMode("edit"); setUgOpen(true); }}>Edit</Button>
                                                                <Button size="sm" variant="outline" onClick={() => setUgSelected(null)}>Close</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <UGStatsPanel />
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <Dialog open={srOpen} onOpenChange={setSrOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{srMode === "add" ? "Add Sapling Request" : "Edit Sapling Request"}</DialogTitle></DialogHeader>
                        <SaplingRequestForm
                            mode={srMode}
                            initialData={srSelected || undefined}
                            onSave={handleSrSave}
                            onCancel={() => setSrOpen(false)}
                        />
                    </DialogContent>
                </Dialog>

                <Dialog open={ugOpen} onOpenChange={setUgOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{ugMode === "add" ? "Add Planting" : ugMode === "edit" ? "Edit Planting" : "View Planting"}</DialogTitle></DialogHeader>
                        <UrbanGreeningPlantingForm
                            mode={ugMode}
                            initialData={ugSelected || undefined}
                            onSave={async (data) => {
                                if (ugMode === "add") {
                                    await createUG.mutateAsync(data);
                                } else if (ugMode === "edit" && ugSelected) {
                                    await updateUG.mutateAsync({ id: ugSelected.id, data });

                                    // Update monitoring request source_type if there's a linked monitoring request
                                    const monitoring_request_id = data.monitoring_request_id || (ugSelected as any)?.monitoring_request_id;
                                    if (monitoring_request_id) {
                                        try {
                                            const currentMonitoring = await fetchMonitoringRequest(monitoring_request_id);
                                            await updateMonitoringRequest(monitoring_request_id, {
                                                ...currentMonitoring,
                                                source_type: "urban_greening"
                                            });
                                        } catch (error) {
                                            console.error("Failed to update monitoring request source_type:", error);
                                            // Don't show error to user as this is a background update
                                        }
                                    }
                                }
                                setUgOpen(false);
                            }}
                            onCancel={() => setUgOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default SaplingManagement;

// Small component to render Urban Greening statistics using existing hook
const UGStatsPanel: React.FC = () => {
    const { data: stats, isLoading } = useUrbanGreeningStatistics();
    if (isLoading) return <div className="text-sm text-gray-500">Loading statistics…</div>;
    if (!stats) return <div className="text-sm text-gray-500">No statistics available.</div>;
    const byType = (stats as any)?.by_type as Record<string, any> | undefined;
    return (
        <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total Records</span><span className="font-semibold">{stats.total_plantings}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total Quantity</span><span className="font-semibold">{stats.total_quantity}</span></div>
            {byType && Object.keys(byType).length > 0 && (
                <div>
                    <div className="text-gray-500 mb-1">By Type</div>
                    <ul className="space-y-1">
                        {Object.entries(byType).slice(0, 5).map(([name, info]: any) => (
                            <li key={name} className="flex justify-between"><span>{name}</span><span className="font-medium">{info.quantity ?? info.count ?? 0}</span></li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
