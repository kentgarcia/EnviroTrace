import React, { useState, useCallback } from "react";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/presentation/components/shared/ui/alert-dialog";
import { Loader2, Smartphone, Monitor, Tablet, HelpCircle, Power, PowerOff, Calendar, MapPin, Filter, X } from "lucide-react";
import { useToast } from "@/core/hooks/ui/use-toast";
import { RefreshButton } from "@/presentation/components/shared/buttons/RefreshButton";
import { useContextMenuAction } from "@/core/hooks/useContextMenuAction";
import {
    useAllSessions,
    useTerminateSession,
    useTerminateAllUserSessions,
    UserSession
} from "@/core/api/session-api";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/presentation/components/shared/ui/pagination";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { PERMISSIONS } from "@/core/utils/permissions";
import { Shield } from "lucide-react";

export function SessionManagement() {
    const [deviceFilter, setDeviceFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("active");  // Default to active sessions
    const [similarityFilter, setSimilarityFilter] = useState<{
        userEmail?: string;
        deviceType?: string;
        ipAddress?: string;
    } | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const { toast } = useToast();
    const canViewSessions = useAuthStore((state) => state.hasPermission(PERMISSIONS.SESSION.VIEW));
    const canTerminateSessions = useAuthStore((state) => state.hasPermission(PERMISSIONS.SESSION.DELETE));

    // Parse filters for API
    const deviceType = deviceFilter === "all" || !deviceFilter ? undefined : deviceFilter;
    const isActive = statusFilter === "all" ? undefined : statusFilter === "active";

    // Reset page when filters change
    React.useEffect(() => {
        setPage(1);
    }, [deviceFilter, statusFilter, similarityFilter]);

    // Queries
    const { data: allSessions = [], isLoading, error, isFetching, refetch } = useAllSessions({
        device_type: deviceType,
        is_active: isActive,
        skip: (page - 1) * pageSize,
        limit: pageSize,
    });

    const handleRefresh = useCallback(async () => {
        await refetch();
    }, [refetch]);

    useContextMenuAction("refresh", handleRefresh);

    // Apply client-side similarity filtering
    const sessions = React.useMemo(() => {
        if (!similarityFilter) return allSessions;

        return allSessions.filter(session => {
            const matchesUser = !similarityFilter.userEmail || 
                session.user_email?.toLowerCase() === similarityFilter.userEmail.toLowerCase();
            const matchesDevice = !similarityFilter.deviceType || 
                session.device_type === similarityFilter.deviceType;
            const matchesIP = !similarityFilter.ipAddress || 
                session.ip_address === similarityFilter.ipAddress;
            
            return matchesUser && matchesDevice && matchesIP;
        });
    }, [allSessions, similarityFilter]);

    const handleShowSimilar = (session: UserSession) => {
        setSimilarityFilter({
            userEmail: session.user_email || undefined,
            deviceType: session.device_type,
            ipAddress: session.ip_address || undefined,
        });
        toast({
            title: "Similarity Filter Applied",
            description: `Showing sessions matching: ${session.user_email}, ${session.device_type}, ${session.ip_address || 'any IP'}`,
            variant: "default",
        });
    };

    const clearSimilarityFilter = () => {
        setSimilarityFilter(null);
    };

    // Mutations
    const terminateSessionMutation = useTerminateSession();
    const terminateAllMutation = useTerminateAllUserSessions();

    const handleTerminateSession = async (sessionId: string, userEmail: string) => {
        try {
            await terminateSessionMutation.mutateAsync({
                session_id: sessionId,
                reason: "Terminated by admin"
            });
            toast({
                title: "Success",
                description: `Session for ${userEmail} terminated successfully.`,
                variant: "default",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.detail || "Failed to terminate session.",
                variant: "destructive",
            });
        }
    };

    const handleTerminateAllUserSessions = async (userId: string, userEmail: string) => {
        try {
            const result = await terminateAllMutation.mutateAsync({
                userId,
                reason: "All sessions terminated by admin"
            });
            toast({
                title: "Success",
                description: `${result.count} session(s) terminated for ${userEmail}.`,
                variant: "default",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.detail || "Failed to terminate sessions.",
                variant: "destructive",
            });
        }
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType) {
            case "mobile":
                return <Smartphone className="w-4 h-4" />;
            case "desktop":
                return <Monitor className="w-4 h-4" />;
            case "tablet":
                return <Tablet className="w-4 h-4" />;
            default:
                return <HelpCircle className="w-4 h-4" />;
        }
    };

    const getDeviceColor = (deviceType: string) => {
        switch (deviceType) {
            case "mobile":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
            case "desktop":
                return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200";
            case "tablet":
                return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
            default:
                return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadge = (session: UserSession) => {
        const now = new Date();
        const expiresAt = new Date(session.expires_at);

        if (!session.is_active || session.ended_at) {
            return (
                <Badge variant="destructive" className="flex items-center gap-1">
                    <PowerOff className="w-3 h-3" />
                    Terminated
                </Badge>
            );
        }

        if (expiresAt < now) {
            return (
                <Badge variant="outline" className="text-gray-600 dark:text-gray-300 dark:border-gray-600">
                    Expired
                </Badge>
            );
        }

        return (
            <Badge variant="default" className="bg-green-500 dark:bg-green-600 text-white flex items-center gap-1">
                <Power className="w-3 h-3" />
                Active
            </Badge>
        );
    };

    if (!canViewSessions) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="w-full max-w-md mx-auto">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-4">
                            <Shield className="w-16 h-16 text-red-500" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Access Denied</h2>
                            <p className="text-gray-600 dark:text-gray-300 text-center">
                                You do not have permission to view session information.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-red-600 dark:text-red-400">
                            <p>Error loading sessions: {(error as any).message}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="page-header-bg px-6 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Session Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Monitor and manage user login sessions</p>
                    </div>
                    <RefreshButton onClick={handleRefresh} isLoading={isFetching} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 page-bg space-y-6">
                    {/* Similarity Filter Badge */}
                    {similarityFilter && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Similarity Filter Active</h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                                            Showing sessions matching:
                                            {similarityFilter.userEmail && (
                                                <Badge className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">User: {similarityFilter.userEmail}</Badge>
                                            )}
                                            {similarityFilter.deviceType && (
                                                <Badge className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">Device: {similarityFilter.deviceType}</Badge>
                                            )}
                                            {similarityFilter.ipAddress && (
                                                <Badge className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">IP: {similarityFilter.ipAddress}</Badge>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSimilarityFilter}
                                    className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Clear
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-gray-100">Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="w-64">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Device Type</label>
                                    <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All devices" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Devices</SelectItem>
                                            <SelectItem value="mobile">Mobile</SelectItem>
                                            <SelectItem value="desktop">Desktop</SelectItem>
                                            <SelectItem value="tablet">Tablet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-64">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Sessions</SelectItem>
                                            <SelectItem value="active">Active Only</SelectItem>
                                            <SelectItem value="inactive">Inactive Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sessions Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-gray-100">
                                {statusFilter === "active" && "Active Sessions"}
                                {statusFilter === "inactive" && "Inactive Sessions"}
                                {statusFilter === "all" && "All Sessions"}
                                {!statusFilter && "Sessions"} ({sessions.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <span className="ml-2 text-gray-700 dark:text-gray-300">Loading sessions...</span>
                                </div>
                            ) : (
                                <Table className="border dark:border-gray-700">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Device</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Last Activity</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sessions.map((session) => (
                                            <TableRow key={session.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{session.user_email}</div>
                                                        {session.user_profile?.first_name && (
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {session.user_profile.first_name}{" "}
                                                                {session.user_profile.last_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getDeviceColor(session.device_type)}>
                                                            <span className="flex items-center gap-1">
                                                                {getDeviceIcon(session.device_type)}
                                                                {session.device_type}
                                                            </span>
                                                        </Badge>
                                                        {session.device_name && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {session.device_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                                        <MapPin className="w-3 h-3" />
                                                        {session.ip_address || "Unknown"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(session)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(session.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                                        {session.last_activity_at
                                                            ? formatDate(session.last_activity_at)
                                                            : "N/A"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleShowSimilar(session)}
                                                            title="Show similar sessions"
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                        >
                                                            <Filter className="w-4 h-4" />
                                                        </Button>
                                                        {session.is_active && canTerminateSessions && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="outline" size="sm">
                                                                        <PowerOff className="w-4 h-4 text-red-600" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>
                                                                            Terminate Session
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to terminate this
                                                                            session for {session.user_email}? The user
                                                                            will need to log in again.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() =>
                                                                                handleTerminateSession(
                                                                                    session.id,
                                                                                    session.user_email || "user"
                                                                                )
                                                                            }
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Terminate
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            <div className="mt-4 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious 
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink isActive>{page}</PaginationLink>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationNext 
                                                onClick={() => setPage(p => p + 1)}
                                                className={sessions.length < pageSize ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
    );
}
