import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Badge } from "@/presentation/components/shared/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/presentation/components/shared/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/shared/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import { Loader2, Search, Calendar, User, Shield, Globe, Clock, Eye } from "lucide-react";
import { useToast } from "@/core/hooks/ui/use-toast";
import { useAuditLogs, useAuditLog, AuditLog } from "@/core/api/admin-api";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/presentation/components/shared/ui/pagination";
import { format } from "date-fns";
import { DatePicker } from "@/presentation/components/shared/ui/date-picker";

// Available modules based on backend MODULE_MAPPINGS
const AUDIT_MODULES = [
    { value: "all", label: "All Modules" },
    { value: "Authentication", label: "Authentication" },
    { value: "User Management", label: "User Management" },
    { value: "Profile Management", label: "Profile Management" },
    { value: "Emissions", label: "Emissions" },
    { value: "Vehicles", label: "Vehicles" },
    { value: "Tree Inventory", label: "Tree Inventory" },
    { value: "Tree Management", label: "Tree Management" },
    { value: "Urban Greening", label: "Urban Greening" },
    { value: "Planting Activities", label: "Planting Activities" },
    { value: "Session Management", label: "Session Management" },
    { value: "Admin", label: "Admin" },
];

const STATUS_CODES = [
    { value: "all", label: "All Status Codes" },
    { value: "200", label: "200 - OK" },
    { value: "201", label: "201 - Created" },
    { value: "204", label: "204 - No Content" },
    { value: "400", label: "400 - Bad Request" },
    { value: "401", label: "401 - Unauthorized" },
    { value: "403", label: "403 - Forbidden" },
    { value: "404", label: "404 - Not Found" },
    { value: "422", label: "422 - Validation Error" },
    { value: "500", label: "500 - Server Error" },
];

export function AuditLogs() {
    const [moduleFilter, setModuleFilter] = useState<string>("all");
    const [statusCodeFilter, setStatusCodeFilter] = useState<string>("all");
    const [userEmailFilter, setUserEmailFilter] = useState<string>("");
    const [eventIdFilter, setEventIdFilter] = useState<string>("");
    const [searchFilter, setSearchFilter] = useState<string>("");
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
    const pageSize = 20;
    const { toast } = useToast();

    // Build filters for API
    const filters = {
        module_name: moduleFilter === "all" ? undefined : moduleFilter,
        status_code: statusCodeFilter === "all" ? undefined : parseInt(statusCodeFilter),
        user_email: userEmailFilter || undefined,
        event_id: eventIdFilter || undefined,
        search: searchFilter || undefined,
        date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
        date_to: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
        skip: (page - 1) * pageSize,
        limit: pageSize,
    };

    // Reset page when filters change
    React.useEffect(() => {
        setPage(1);
    }, [moduleFilter, statusCodeFilter, userEmailFilter, eventIdFilter, searchFilter, dateFrom, dateTo]);

    // Query for logs list
    const { data: logsResponse, isLoading, error } = useAuditLogs(filters);
    const logs = logsResponse?.items || [];
    const totalCount = logsResponse?.total || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Query for selected log detail
    const { data: selectedLog } = useAuditLog(selectedLogId || "");

    const getStatusBadge = (statusCode: number) => {
        if (statusCode >= 200 && statusCode < 300) {
            return (
                <Badge variant="default" className="bg-green-500">
                    {statusCode}
                </Badge>
            );
        } else if (statusCode >= 400 && statusCode < 500) {
            return (
                <Badge variant="destructive">
                    {statusCode}
                </Badge>
            );
        } else if (statusCode >= 500) {
            return (
                <Badge variant="destructive" className="bg-red-700">
                    {statusCode}
                </Badge>
            );
        }
        return <Badge variant="outline">{statusCode}</Badge>;
    };

    const getMethodBadge = (method: string) => {
        const colors: Record<string, string> = {
            GET: "bg-blue-100 text-blue-800",
            POST: "bg-green-100 text-green-800",
            PUT: "bg-yellow-100 text-yellow-800",
            PATCH: "bg-orange-100 text-orange-800",
            DELETE: "bg-red-100 text-red-800",
        };

        return (
            <Badge className={colors[method] || "bg-gray-100 text-gray-800"}>
                {method}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const handleClearFilters = () => {
        setModuleFilter("all");
        setStatusCodeFilter("all");
        setUserEmailFilter("");
        setEventIdFilter("");
        setSearchFilter("");
        setDateFrom(undefined);
        setDateTo(undefined);
        setPage(1);
    };

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-red-600">
                            <p>Error loading audit logs: {(error as any).message}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="bg-white px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                        <p className="text-gray-600">ISO-compliant system activity audit trail</p>
                    </div>
                    <div className="text-sm text-gray-600">
                        Total Records: <span className="font-semibold">{totalCount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC] space-y-6">
                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Filters</CardTitle>
                            <Button variant="outline" size="sm" onClick={handleClearFilters}>
                                Clear All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Module</label>
                                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select module" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AUDIT_MODULES.map((module) => (
                                            <SelectItem key={module.value} value={module.value}>
                                                {module.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Status Code</label>
                                <Select value={statusCodeFilter} onValueChange={setStatusCodeFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_CODES.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">User Email</label>
                                <Input
                                    placeholder="Search by email..."
                                    value={userEmailFilter}
                                    onChange={(e) => setUserEmailFilter(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Event ID</label>
                                <Input
                                    placeholder="Search by event ID..."
                                    value={eventIdFilter}
                                    onChange={(e) => setEventIdFilter(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Date From</label>
                                <DatePicker
                                    selected={dateFrom}
                                    onSelect={setDateFrom}
                                    placeholderText="Select start date"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Date To</label>
                                <DatePicker
                                    selected={dateTo}
                                    onSelect={setDateTo}
                                    placeholderText="Select end date"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Search in path, user agent, IP..."
                                        value={searchFilter}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Audit Records ({logs.length} of {totalCount})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="ml-2">Loading audit logs...</span>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center p-8 text-gray-500">
                                No audit logs found matching the current filters.
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Timestamp</TableHead>
                                                <TableHead>Event</TableHead>
                                                <TableHead>Module</TableHead>
                                                <TableHead>Method</TableHead>
                                                <TableHead>Path</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>IP Address</TableHead>
                                                <TableHead>Latency</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {logs.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(log.occurred_at)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-mono text-xs">{log.event_name}</div>
                                                        <div className="text-xs text-gray-500">{log.event_id}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs">
                                                            {log.module_name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{getMethodBadge(log.method)}</TableCell>
                                                    <TableCell>
                                                        <div className="font-mono text-xs max-w-xs truncate" title={log.path}>
                                                            {log.path}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(log.status_code)}</TableCell>
                                                    <TableCell>
                                                        {log.user_email ? (
                                                            <div className="flex items-center gap-1">
                                                                <User className="w-3 h-3" />
                                                                <span className="text-sm">{log.user_email}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">Anonymous</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Globe className="w-3 h-3" />
                                                            {log.ip_address || "N/A"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {log.latency_ms !== undefined && log.latency_ms !== null ? (
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Clock className="w-3 h-3" />
                                                                {log.latency_ms}ms
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">N/A</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setSelectedLogId(log.id)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                <div className="mt-6 flex justify-center">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                    className={
                                                        page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                            
                                            {/* Page numbers */}
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum: number;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (page <= 3) {
                                                    pageNum = i + 1;
                                                } else if (page >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = page - 2 + i;
                                                }
                                                
                                                return (
                                                    <PaginationItem key={pageNum}>
                                                        <PaginationLink
                                                            isActive={pageNum === page}
                                                            onClick={() => setPage(pageNum)}
                                                            className="cursor-pointer"
                                                        >
                                                            {pageNum}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            })}

                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                    className={
                                                        page >= totalPages
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>

                                {/* Page info */}
                                <div className="mt-2 text-center text-sm text-gray-600">
                                    Page {page} of {totalPages} ({totalCount} total records)
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedLogId} onOpenChange={(open) => !open && setSelectedLogId(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Audit Log Details</DialogTitle>
                        <DialogDescription>
                            Complete details for audit log entry
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-4">
                            {/* Event Information */}
                            <div>
                                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Event Information
                                </h3>
                                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <label className="text-xs text-gray-500">Event ID</label>
                                        <div className="font-mono text-sm">{selectedLog.event_id}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Event Name</label>
                                        <div className="text-sm">{selectedLog.event_name}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Module</label>
                                        <div className="text-sm">{selectedLog.module_name}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Timestamp (Local)</label>
                                        <div className="text-sm">{formatDate(selectedLog.occurred_at)}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Timestamp (ISO)</label>
                                        <div className="text-sm font-mono">{selectedLog.occurred_at_iso}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Timestamp (GMT)</label>
                                        <div className="text-sm font-mono">{selectedLog.occurred_at_gmt}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Request Information */}
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Request Information</h3>
                                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <label className="text-xs text-gray-500">Method</label>
                                        <div className="mt-1">{getMethodBadge(selectedLog.method)}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Status Code</label>
                                        <div className="mt-1">{getStatusBadge(selectedLog.status_code)}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-500">Path</label>
                                        <div className="font-mono text-sm bg-white p-2 rounded mt-1">
                                            {selectedLog.path}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">IP Address</label>
                                        <div className="text-sm">{selectedLog.ip_address || "N/A"}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Latency</label>
                                        <div className="text-sm">
                                            {selectedLog.latency_ms !== undefined && selectedLog.latency_ms !== null
                                                ? `${selectedLog.latency_ms}ms`
                                                : "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* User Information */}
                            {selectedLog.user_email && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-2">User Information</h3>
                                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <label className="text-xs text-gray-500">Email</label>
                                            <div className="text-sm">{selectedLog.user_email}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">User ID</label>
                                            <div className="font-mono text-sm">{selectedLog.user_id || "N/A"}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Session ID</label>
                                            <div className="font-mono text-sm">{selectedLog.session_id || "N/A"}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Agent */}
                            {selectedLog.user_agent && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-2">User Agent</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="font-mono text-xs break-all">{selectedLog.user_agent}</div>
                                    </div>
                                </div>
                            )}

                            {/* Request Payload */}
                            {selectedLog.request_payload && Object.keys(selectedLog.request_payload).length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-2">Request Payload (Masked)</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <pre className="font-mono text-xs overflow-x-auto">
                                            {JSON.stringify(selectedLog.request_payload, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Response Payload */}
                            {selectedLog.response_payload && Object.keys(selectedLog.response_payload).length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-2">Response Payload (Masked)</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <pre className="font-mono text-xs overflow-x-auto">
                                            {JSON.stringify(selectedLog.response_payload, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
