import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/shared/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/presentation/components/shared/ui/sheet";
import { Search, Shield, User, Globe, Clock, Loader2, Download, CalendarIcon, RefreshCw } from "lucide-react";
import { useAuditLogs, AuditLog } from "@/core/api/admin-api";
import { getAuditDescription } from "./auditDescriptions";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/presentation/components/shared/ui/pagination";
import { format } from "date-fns";
import { DatePicker } from "@/presentation/components/shared/ui/date-picker";
import { Badge } from "@/presentation/components/shared/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/presentation/components/shared/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/presentation/components/shared/ui/table";

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
    const [searchFilter, setSearchFilter] = useState<string>("");
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
    const pageSize = 50;

    const handleQuickRange = (minutes: number) => {
        const now = new Date();
        const from = new Date(now.getTime() - minutes * 60000);
        setDateFrom(from);
        setDateTo(now);
    };

    const handleDownload = (fileFormat: 'txt' | 'json' | 'csv') => {
        if (logs.length === 0) return;

        let content = '';
        let filename = `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}`;
        let mimeType = '';

        if (fileFormat === 'txt') {
            content = logs.map(log => 
                `[${format(new Date(log.occurred_at), 'yyyy-MM-dd HH:mm:ss')}] ` +
                `${log.status_code} ${log.http_method} ${log.module_name} - ` +
                `${getAuditDescription(log)} - User: ${log.user_email || 'Anonymous'} - ` +
                `Latency: ${log.latency_ms || 'N/A'}ms`
            ).join('\n');
            filename += '.txt';
            mimeType = 'text/plain';
        } else if (fileFormat === 'json') {
            content = JSON.stringify(logs, null, 2);
            filename += '.json';
            mimeType = 'application/json';
        } else if (fileFormat === 'csv') {
            const headers = ['Timestamp', 'Status', 'Method', 'Module', 'Description', 'User', 'IP', 'Latency (ms)'];
            const escapeCSV = (val: any) => {
                const str = String(val);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };
            const rows = logs.map(log => [
                format(new Date(log.occurred_at), 'yyyy-MM-dd HH:mm:ss'),
                log.status_code,
                log.http_method,
                log.module_name,
                getAuditDescription(log),
                log.user_email || 'Anonymous',
                log.ip_address || 'N/A',
                log.latency_ms || 'N/A'
            ].map(escapeCSV));
            content = [headers.map(escapeCSV), ...rows].map(row => row.join(',')).join('\n');
            filename += '.csv';
            mimeType = 'text/csv';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Build filters for API
    const filters = {
        module_name: moduleFilter === "all" ? undefined : moduleFilter,
        status_code: statusCodeFilter === "all" ? undefined : parseInt(statusCodeFilter),
        user_email: userEmailFilter || undefined,
        search: searchFilter || undefined,
        date_from: dateFrom ? dateFrom.toISOString() : undefined,
        date_to: dateTo ? dateTo.toISOString() : undefined,
        skip: (page - 1) * pageSize,
        limit: pageSize,
    };

    // Reset page when filters change
    React.useEffect(() => {
        setPage(1);
    }, [moduleFilter, statusCodeFilter, userEmailFilter, searchFilter, dateFrom, dateTo]);

    // Query for logs list
    const { data: logsResponse, isLoading, error, refetch, isFetching } = useAuditLogs(filters);
    const logs = logsResponse?.items || [];
    const totalCount = logsResponse?.total || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Find selected log from the list (no additional fetch needed)
    const selectedLog = React.useMemo(
        () => logs.find(log => log.id === selectedLogId),
        [logs, selectedLogId]
    );

    const getStatusBadge = (statusCode: number) => {
        if (statusCode >= 200 && statusCode < 300) {
            return (
                <Badge variant="default" className="bg-green-500 text-white px-1.5 py-0 text-xs h-5">
                    {statusCode}
                </Badge>
            );
        } else if (statusCode >= 400 && statusCode < 500) {
            return (
                <Badge variant="destructive" className="px-1.5 py-0 text-xs h-5">
                    {statusCode}
                </Badge>
            );
        } else if (statusCode >= 500) {
            return (
                <Badge variant="destructive" className="bg-red-700 px-1.5 py-0 text-xs h-5">
                    {statusCode}
                </Badge>
            );
        }
        return <Badge variant="outline" className="px-1.5 py-0 text-xs h-5">{statusCode}</Badge>;
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
            <Badge className={`${colors[method] || "bg-gray-100 text-gray-800"} px-1.5 py-0 text-xs h-5 font-mono min-w-[48px] justify-center`}>
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
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isFetching}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Select onValueChange={(value) => handleDownload(value as 'txt' | 'json' | 'csv')}>
                            <SelectTrigger className="w-[180px]">
                                <Download className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Download Logs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                                <SelectItem value="json">JSON (.json)</SelectItem>
                                <SelectItem value="csv">CSV (.csv)</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="text-sm text-gray-600 border-l pl-4">
                            Total Records: <span className="font-semibold">{totalCount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC] space-y-6 flex flex-col">
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
                            {/* Time Range Button with Popover */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Time Range</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateFrom && dateTo ? (
                                            <span>
                                                {format(dateFrom, "MM/dd/yyyy")} - {format(dateTo, "MM/dd/yyyy")}
                                            </span>
                                        ) : (
                                            <span>Time Range</span>
                                        )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-4" align="start">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold mb-2 block">Quick Range</label>
                                            <div className="flex flex-wrap gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleQuickRange(5)}>
                                                    5 min
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleQuickRange(15)}>
                                                    15 min
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleQuickRange(30)}>
                                                    30 min
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleQuickRange(60)}>
                                                    1 hour
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleQuickRange(180)}>
                                                    3 hours
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleQuickRange(360)}>
                                                    6 hours
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleQuickRange(1440)}>
                                                    1 day
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleQuickRange(10080)}>
                                                    7 days
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleQuickRange(43200)}>
                                                    30 days
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="border-t pt-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-600 mb-1 block">From</label>
                                                    <DatePicker
                                                        selected={dateFrom}
                                                        onSelect={setDateFrom}
                                                        placeholderText="Start date"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-600 mb-1 block">Until</label>
                                                    <DatePicker
                                                        selected={dateTo}
                                                        onSelect={setDateTo}
                                                        placeholderText="End date"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

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

                {/* Audit Logs Content */}
                <Card className="flex-shrink-0">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="ml-2 text-sm">Loading...</span>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center p-8 text-gray-500">
                                No audit logs found matching the current filters.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b bg-gray-50">
                                            <TableHead className="h-9 px-3 text-xs font-semibold">Time</TableHead>
                                            <TableHead className="h-9 px-3 text-xs font-semibold">Status</TableHead>
                                            <TableHead className="h-9 px-3 text-xs font-semibold">Method</TableHead>
                                            <TableHead className="h-9 px-3 text-xs font-semibold">Module</TableHead>
                                            <TableHead className="h-9 px-3 text-xs font-semibold">Description</TableHead>
                                            <TableHead className="h-9 px-3 text-xs font-semibold">User</TableHead>
                                            <TableHead className="h-9 px-3 text-xs font-semibold text-right">Latency</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.map((log) => (
                                            <TableRow
                                                key={log.id}
                                                className="cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
                                                onClick={() => setSelectedLogId(log.id)}
                                            >
                                                <TableCell className="py-2 px-3 text-xs text-gray-500 font-mono whitespace-nowrap">
                                                    {format(new Date(log.occurred_at), "MM/dd HH:mm:ss")}
                                                </TableCell>
                                                
                                                <TableCell className="py-2 px-3">
                                                    {getStatusBadge(log.status_code)}
                                                </TableCell>

                                                <TableCell className="py-2 px-3">
                                                    {getMethodBadge(log.http_method)}
                                                </TableCell>

                                                <TableCell className="py-2 px-3">
                                                    <Badge variant="outline" className="px-2 py-0 text-xs h-5 max-w-[120px] truncate" title={log.module_name}>
                                                        {log.module_name}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="py-2 px-3 text-xs text-gray-700 truncate max-w-xs" title={getAuditDescription(log)}>
                                                    {getAuditDescription(log)}
                                                </TableCell>

                                                <TableCell className="py-2 px-3 text-xs text-gray-500 truncate max-w-[140px]" title={log.user_email || 'Anonymous'}>
                                                    {log.user_email || <span className="text-gray-400">Anonymous</span>}
                                                </TableCell>

                                                <TableCell className="py-2 px-3 text-xs text-gray-400 font-mono text-right whitespace-nowrap">
                                                    {log.latency_ms !== undefined && log.latency_ms !== null ? `${log.latency_ms}ms` : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                {/* Pagination */}
                {!isLoading && logs.length > 0 && (
                    <div className="flex justify-center flex-shrink-0">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <div className="flex items-center justify-center px-4 text-sm font-medium text-gray-500">
                                        Page {page} of {totalPages} ({totalCount} total)
                                    </div>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Detail Drawer */}
            <Sheet open={!!selectedLogId} onOpenChange={(open) => !open && setSelectedLogId(null)} modal={true}>
                <SheetContent 
                    side="right" 
                    className="w-full sm:max-w-2xl overflow-y-auto !transition-none !duration-0 !animate-none data-[state=open]:!animate-none data-[state=closed]:!animate-none data-[state=open]:!slide-in-from-right-0 data-[state=closed]:!slide-out-to-right-0"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <SheetHeader>
                        <SheetTitle>Audit Log Details</SheetTitle>
                        <SheetDescription>
                            Complete details for audit log entry
                        </SheetDescription>
                    </SheetHeader>

                    {selectedLog && (
                        <div className="space-y-4 mt-6">
                            {/* Event Information */}
                            <div>
                                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Event Information
                                </h3>
                                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Event ID</label>
                                        <div className="font-mono text-sm break-all">{selectedLog.event_id}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Description</label>
                                        <div className="text-sm font-medium text-gray-800">{getAuditDescription(selectedLog)}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Event Name</label>
                                        <div className="text-sm text-gray-600 font-mono text-xs">{selectedLog.event_name}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Module</label>
                                        <div className="text-sm">{selectedLog.module_name}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Timestamp (Local)</label>
                                        <div className="text-sm">{formatDate(selectedLog.occurred_at)}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Timestamp (ISO)</label>
                                        <div className="text-sm font-mono break-all">{selectedLog.occurred_at_iso}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Timestamp (GMT)</label>
                                        <div className="text-sm font-mono break-all">{selectedLog.occurred_at_gmt}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Request Information */}
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Request Information</h3>
                                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Method</label>
                                        <Badge className="font-mono">{selectedLog.http_method}</Badge>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Status Code</label>
                                        <Badge variant={selectedLog.status_code >= 200 && selectedLog.status_code < 300 ? "default" : "destructive"} className={selectedLog.status_code >= 200 && selectedLog.status_code < 300 ? "bg-green-500" : ""}>
                                            {selectedLog.status_code}
                                        </Badge>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Path</label>
                                        <div className="font-mono text-sm bg-white p-2 rounded break-all">
                                            {selectedLog.route_path}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">IP Address</label>
                                        <div className="text-sm">{selectedLog.ip_address || "N/A"}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Latency</label>
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
                                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Email</label>
                                            <div className="text-sm break-all">{selectedLog.user_email}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">User ID</label>
                                            <div className="font-mono text-sm break-all">{selectedLog.user_id || "N/A"}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Session ID</label>
                                            <div className="font-mono text-sm break-all">{selectedLog.session_id || "N/A"}</div>
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
                </SheetContent>
            </Sheet>
        </div>
    );
}
