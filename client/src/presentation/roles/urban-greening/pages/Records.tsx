import React, { useState, useCallback, useMemo } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/presentation/components/shared/ui/table";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/presentation/components/shared/ui/tabs";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/shared/ui/select";
import { DatePicker } from "@/presentation/components/shared/ui/date-picker";
import { toast } from "sonner";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
import {
    Plus,
    Edit,
    Trash,
    Eye,
    Search,
    FileText,
    TreePine,
    Leaf,
    Coins,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/presentation/components/shared/ui/dialog";
import InspectionReportForm from "../components/InspectionReportForm";
import FeeRecordForm from "../components/FeeRecordForm";
import TreeRecordForm from "../components/TreeRecordForm";
import SaplingRecordForm from "../components/SaplingRecordForm";
import UrbanGreeningRecordForm from "../components/UrbanGreeningRecordForm";

// Types for different record types
interface InspectionReport {
    id: string;
    reportNumber: string;
    inspectorName: string;
    date: string;
    location: string;
    type: "pruning" | "cutting" | "violation" | "maintenance";
    status: "pending" | "in-progress" | "completed" | "rejected";
    findings: string;
    recommendations: string;
    followUpRequired: boolean;
}

interface FeeRecord {
    id: string;
    referenceNumber: string;
    type: "inspection" | "cutting_permit" | "pruning_permit" | "violation_fine";
    amount: number;
    payerName: string;
    date: string;
    dueDate: string;
    status: "paid" | "pending" | "overdue" | "cancelled";
    orNumber?: string;
    paymentDate?: string;
}

interface TreeRecord {
    id: string;
    species: string;
    location: string;
    coordinates?: { lat: number; lng: number };
    diameter: number;
    height: number;
    condition: "healthy" | "diseased" | "damaged" | "dead";
    action: "none" | "pruning" | "cutting" | "treatment";
    permitNumber?: string;
    actionDate?: string;
    replacementRequired: boolean;
}

interface SaplingRecord {
    id: string;
    species: string;
    quantity: number;
    collectionDate: string;
    source: "replacement" | "donation" | "purchase";
    condition: "excellent" | "good" | "fair" | "poor";
    plantingDate?: string;
    location?: string;
    notes: string;
}

interface UrbanGreeningRecord {
    id: string;
    projectName: string;
    type: "ornamental" | "trees" | "seeds" | "seeds_private";
    quantity: number;
    species: string;
    plantingDate: string;
    location: string;
    coordinates?: { lat: number; lng: number };
    status: "planned" | "planted" | "maintained" | "completed";
    responsiblePerson: string;
    notes: string;
}

// Sample data
const sampleInspectionReports: InspectionReport[] = [
    {
        id: "IR-001",
        reportNumber: "2025-IR-001",
        inspectorName: "Juan Dela Cruz",
        date: "2025-01-15",
        location: "Rizal Park",
        type: "pruning",
        status: "completed",
        findings: "Several branches overhanging walkways",
        recommendations: "Selective pruning required",
        followUpRequired: true,
    },
    {
        id: "IR-002",
        reportNumber: "2025-IR-002",
        inspectorName: "Maria Santos",
        date: "2025-01-20",
        location: "Ayala Avenue",
        type: "cutting",
        status: "pending",
        findings: "Dead tree posing safety risk",
        recommendations: "Immediate removal and replacement",
        followUpRequired: false,
    },
];

const sampleFeeRecords: FeeRecord[] = [
    {
        id: "FR-001",
        referenceNumber: "2025-FEE-001",
        type: "cutting_permit",
        amount: 2500,
        payerName: "ABC Development Corp",
        date: "2025-01-10",
        dueDate: "2025-01-25",
        status: "paid",
        orNumber: "OR-2025-001",
        paymentDate: "2025-01-20",
    },
    {
        id: "FR-002",
        referenceNumber: "2025-FEE-002",
        type: "violation_fine",
        amount: 5000,
        payerName: "XYZ Construction",
        date: "2025-01-12",
        dueDate: "2025-01-27",
        status: "overdue",
    },
];

const sampleTreeRecords: TreeRecord[] = [
    {
        id: "TR-001",
        species: "Narra",
        location: "Makati Central Business District",
        coordinates: { lat: 14.5547, lng: 121.0244 },
        diameter: 45,
        height: 15,
        condition: "healthy",
        action: "pruning",
        permitNumber: "PP-2025-001",
        actionDate: "2025-02-01",
        replacementRequired: false,
    },
];

const sampleSaplingRecords: SaplingRecord[] = [
    {
        id: "SR-001",
        species: "Acacia",
        quantity: 25,
        collectionDate: "2025-01-15",
        source: "replacement",
        condition: "good",
        plantingDate: "2025-02-01",
        location: "BGC Park",
        notes: "Replacement for cut trees",
    },
];

const sampleUrbanGreeningRecords: UrbanGreeningRecord[] = [
    {
        id: "UG-001",
        projectName: "Green Streets Initiative",
        type: "ornamental",
        quantity: 50,
        species: "Various ornamental plants",
        plantingDate: "2025-01-20",
        location: "Ayala Avenue median",
        coordinates: { lat: 14.5547, lng: 121.0244 },
        status: "planted",
        responsiblePerson: "Parks Department",
        notes: "Monthly maintenance scheduled",
    },
];

const UrbanGreeningRecords: React.FC = () => {
    const [activeTab, setActiveTab] = useState("inspection");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // State for each record type
    const [inspectionReports, setInspectionReports] = useState(sampleInspectionReports);
    const [feeRecords, setFeeRecords] = useState(sampleFeeRecords);
    const [treeRecords, setTreeRecords] = useState(sampleTreeRecords);
    const [saplingRecords, setSaplingRecords] = useState(sampleSaplingRecords);
    const [urbanGreeningRecords, setUrbanGreeningRecords] = useState(sampleUrbanGreeningRecords);

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
    const [selectedRecord, setSelectedRecord] = useState<any>(null); const handleAddRecord = (type: string) => {
        setDialogMode("add");
        setSelectedRecord(null);
        setIsDialogOpen(true);
    };

    const handleSaveRecord = (data: any) => {
        switch (activeTab) {
            case "inspection":
                if (dialogMode === "add") {
                    setInspectionReports(prev => [...prev, data]);
                } else if (dialogMode === "edit") {
                    setInspectionReports(prev => prev.map(r => r.id === data.id ? data : r));
                }
                break;
            case "fees":
                if (dialogMode === "add") {
                    setFeeRecords(prev => [...prev, data]);
                } else if (dialogMode === "edit") {
                    setFeeRecords(prev => prev.map(r => r.id === data.id ? data : r));
                }
                break;
            case "trees":
                if (dialogMode === "add") {
                    setTreeRecords(prev => [...prev, data]);
                } else if (dialogMode === "edit") {
                    setTreeRecords(prev => prev.map(r => r.id === data.id ? data : r));
                }
                break;
            case "saplings":
                if (dialogMode === "add") {
                    setSaplingRecords(prev => [...prev, data]);
                } else if (dialogMode === "edit") {
                    setSaplingRecords(prev => prev.map(r => r.id === data.id ? data : r));
                }
                break;
            case "urban-greening":
                if (dialogMode === "add") {
                    setUrbanGreeningRecords(prev => [...prev, data]);
                } else if (dialogMode === "edit") {
                    setUrbanGreeningRecords(prev => prev.map(r => r.id === data.id ? data : r));
                }
                break;
        }
        setIsDialogOpen(false);
    };

    const handleEditRecord = (record: any) => {
        setDialogMode("edit");
        setSelectedRecord(record);
        setIsDialogOpen(true);
    };

    const handleViewRecord = (record: any) => {
        setDialogMode("view");
        setSelectedRecord(record);
        setIsDialogOpen(true);
    };

    const handleDeleteRecord = (id: string, type: string) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            switch (type) {
                case "inspection":
                    setInspectionReports(prev => prev.filter(r => r.id !== id));
                    break;
                case "fee":
                    setFeeRecords(prev => prev.filter(r => r.id !== id));
                    break;
                case "tree":
                    setTreeRecords(prev => prev.filter(r => r.id !== id));
                    break;
                case "sapling":
                    setSaplingRecords(prev => prev.filter(r => r.id !== id));
                    break;
                case "urban-greening":
                    setUrbanGreeningRecords(prev => prev.filter(r => r.id !== id));
                    break;
            }
            toast.success("Record deleted successfully");
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "completed":
            case "paid":
            case "planted":
                return "bg-green-100 text-green-800";
            case "pending":
            case "planned":
                return "bg-yellow-100 text-yellow-800";
            case "overdue":
            case "rejected":
                return "bg-red-100 text-red-800";
            case "in-progress":
            case "maintained":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
            case "paid":
            case "planted":
                return <CheckCircle className="w-4 h-4" />;
            case "pending":
            case "planned":
                return <Clock className="w-4 h-4" />;
            case "overdue":
            case "rejected":
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const filteredInspectionReports = useMemo(() => {
        return inspectionReports.filter(report => {
            const matchesSearch = report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || report.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [inspectionReports, searchTerm, statusFilter]);

    const filteredFeeRecords = useMemo(() => {
        return feeRecords.filter(record => {
            const matchesSearch = record.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.payerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || record.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [feeRecords, searchTerm, statusFilter]);

    const filteredTreeRecords = useMemo(() => {
        return treeRecords.filter(record => {
            const matchesSearch = record.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || record.condition === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [treeRecords, searchTerm, statusFilter]);

    const filteredSaplingRecords = useMemo(() => {
        return saplingRecords.filter(record => {
            const matchesSearch = record.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (record.location && record.location.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === "all" || record.condition === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [saplingRecords, searchTerm, statusFilter]);

    const filteredUrbanGreeningRecords = useMemo(() => {
        return urbanGreeningRecords.filter(record => {
            const matchesSearch = record.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || record.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [urbanGreeningRecords, searchTerm, statusFilter]);

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="urban-greening" />

                {/* Header Section */}
                <div className="flex items-center justify-between bg-white px-6 py-3 border-b border-gray-200">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Urban Greening Records Management
                    </h1>
                </div>

                {/* Body Section */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC]">
                    <div className="px-4">
                        <ColorDivider />
                    </div>

                    {/* Search and Filter Section */}
                    <div className="mt-4 mb-4 flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tabs for different record types */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="inspection" className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Inspection Reports
                            </TabsTrigger>
                            <TabsTrigger value="fees" className="flex items-center gap-2">
                                <Coins className="w-4 h-4" />
                                Fee Records
                            </TabsTrigger>
                            <TabsTrigger value="trees" className="flex items-center gap-2">
                                <TreePine className="w-4 h-4" />
                                Tree Records
                            </TabsTrigger>
                            <TabsTrigger value="saplings" className="flex items-center gap-2">
                                <Leaf className="w-4 h-4" />
                                Saplings
                            </TabsTrigger>
                            <TabsTrigger value="urban-greening" className="flex items-center gap-2">
                                <Leaf className="w-4 h-4" />
                                Urban Greening
                            </TabsTrigger>
                        </TabsList>

                        {/* Inspection Reports Tab */}
                        <TabsContent value="inspection" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium">Inspection Reports</h2>
                                <Button onClick={() => handleAddRecord("inspection")} className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Report
                                </Button>
                            </div>

                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Report No.</TableHead>
                                                <TableHead>Inspector</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Location</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredInspectionReports.map((report) => (
                                                <TableRow key={report.id}>
                                                    <TableCell className="font-medium">{report.reportNumber}</TableCell>
                                                    <TableCell>{report.inspectorName}</TableCell>
                                                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>{report.location}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{report.type}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusBadgeColor(report.status)}>
                                                            {getStatusIcon(report.status)}
                                                            <span className="ml-1">{report.status}</span>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewRecord(report)}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditRecord(report)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteRecord(report.id, "inspection")}
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Fee Records Tab */}
                        <TabsContent value="fees" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium">Fee Records</h2>
                                <Button onClick={() => handleAddRecord("fee")} className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Fee Record
                                </Button>
                            </div>

                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Reference No.</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Payer</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Due Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredFeeRecords.map((record) => (
                                                <TableRow key={record.id}>
                                                    <TableCell className="font-medium">{record.referenceNumber}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{record.type.replace("_", " ")}</Badge>
                                                    </TableCell>
                                                    <TableCell>{record.payerName}</TableCell>
                                                    <TableCell>₱{record.amount.toLocaleString()}</TableCell>
                                                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>{new Date(record.dueDate).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusBadgeColor(record.status)}>
                                                            {getStatusIcon(record.status)}
                                                            <span className="ml-1">{record.status}</span>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewRecord(record)}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditRecord(record)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteRecord(record.id, "fee")}
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tree Records Tab */}
                        <TabsContent value="trees" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium">Tree Records</h2>
                                <Button onClick={() => handleAddRecord("tree")} className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Tree Record
                                </Button>
                            </div>

                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Species</TableHead>
                                                <TableHead>Location</TableHead>
                                                <TableHead>Diameter</TableHead>
                                                <TableHead>Height</TableHead>
                                                <TableHead>Condition</TableHead>
                                                <TableHead>Action</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredTreeRecords.map((record) => (
                                                <TableRow key={record.id}>
                                                    <TableCell className="font-medium">{record.species}</TableCell>
                                                    <TableCell>{record.location}</TableCell>
                                                    <TableCell>{record.diameter} cm</TableCell>
                                                    <TableCell>{record.height} m</TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusBadgeColor(record.condition)}>
                                                            {record.condition}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{record.action}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewRecord(record)}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditRecord(record)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteRecord(record.id, "tree")}
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Saplings Tab */}
                        <TabsContent value="saplings" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium">Sapling Records</h2>
                                <Button onClick={() => handleAddRecord("sapling")} className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Sapling Record
                                </Button>
                            </div>

                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Species</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Collection Date</TableHead>
                                                <TableHead>Source</TableHead>
                                                <TableHead>Condition</TableHead>
                                                <TableHead>Planting Date</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredSaplingRecords.map((record) => (
                                                <TableRow key={record.id}>
                                                    <TableCell className="font-medium">{record.species}</TableCell>
                                                    <TableCell>{record.quantity}</TableCell>
                                                    <TableCell>{new Date(record.collectionDate).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{record.source}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusBadgeColor(record.condition)}>
                                                            {record.condition}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {record.plantingDate ? new Date(record.plantingDate).toLocaleDateString() : "Not planted"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewRecord(record)}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditRecord(record)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteRecord(record.id, "sapling")}
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Urban Greening Tab */}
                        <TabsContent value="urban-greening" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium">Urban Greening Projects</h2>
                                <Button onClick={() => handleAddRecord("urban-greening")} className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Project
                                </Button>
                            </div>

                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Project Name</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Species</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Planting Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUrbanGreeningRecords.map((record) => (
                                                <TableRow key={record.id}>
                                                    <TableCell className="font-medium">{record.projectName}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{record.type}</Badge>
                                                    </TableCell>
                                                    <TableCell>{record.species}</TableCell>
                                                    <TableCell>{record.quantity}</TableCell>
                                                    <TableCell>{new Date(record.plantingDate).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusBadgeColor(record.status)}>
                                                            {getStatusIcon(record.status)}
                                                            <span className="ml-1">{record.status}</span>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewRecord(record)}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditRecord(record)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteRecord(record.id, "urban-greening")}
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Record Form Dialog - This would contain forms for each record type */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogMode === "add" ? "Add New Record" :
                                dialogMode === "edit" ? "Edit Record" : "View Record"}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === "view" ? "Record details" : "Fill in the form to manage the record"}
                        </DialogDescription>
                    </DialogHeader>
                    {/* Form content based on activeTab and dialogMode */}
                    <div className="py-4">
                        {activeTab === "inspection" && (
                            <InspectionReportForm
                                mode={dialogMode}
                                initialData={selectedRecord}
                                onSave={handleSaveRecord}
                                onCancel={() => setIsDialogOpen(false)}
                            />
                        )}
                        {activeTab === "fees" && (
                            <FeeRecordForm
                                mode={dialogMode}
                                initialData={selectedRecord}
                                onSave={handleSaveRecord}
                                onCancel={() => setIsDialogOpen(false)}
                            />
                        )}
                        {activeTab === "trees" && (
                            <TreeRecordForm
                                mode={dialogMode}
                                initialData={selectedRecord}
                                onSave={handleSaveRecord}
                                onCancel={() => setIsDialogOpen(false)}
                            />
                        )}
                        {activeTab === "saplings" && (
                            <SaplingRecordForm
                                mode={dialogMode}
                                initialData={selectedRecord}
                                onSave={handleSaveRecord}
                                onCancel={() => setIsDialogOpen(false)}
                            />
                        )}
                        {activeTab === "urban-greening" && (
                            <UrbanGreeningRecordForm
                                mode={dialogMode}
                                initialData={selectedRecord}
                                onSave={handleSaveRecord}
                                onCancel={() => setIsDialogOpen(false)}
                            />
                        )}
                    </div>
                    <DialogFooter>
                        {dialogMode === "view" && (
                            <Button onClick={() => setIsDialogOpen(false)}>
                                Close
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UrbanGreeningRecords;
