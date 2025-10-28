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
import { Loader2, Smartphone, Monitor, Tablet, HelpCircle, Power, PowerOff, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/core/hooks/ui/use-toast";
import {
    useAllSessions,
    useTerminateSession,
    useTerminateAllUserSessions,
    UserSession
} from "@/core/api/session-api";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";

export function SessionManagement() {
    const [deviceFilter, setDeviceFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const { toast } = useToast();

    // Parse filters for API
    const deviceType = deviceFilter === "all" || !deviceFilter ? undefined : deviceFilter;
    const isActive = statusFilter === "all" || !statusFilter ? undefined : statusFilter === "active";

    // Queries
    const { data: sessions = [], isLoading, error } = useAllSessions({
        device_type: deviceType,
        is_active: isActive,
    });

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
                return "bg-blue-100 text-blue-800";
            case "desktop":
                return "bg-purple-100 text-purple-800";
            case "tablet":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
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
                <Badge variant="outline" className="text-gray-600">
                    Expired
                </Badge>
            );
        }

        return (
            <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                <Power className="w-3 h-3" />
                Active
            </Badge>
        );
    };

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-red-600">
                            <p>Error loading sessions: {(error as any).message}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="admin" />

                <div className="bg-white px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
                        <p className="text-gray-600">Monitor and manage user login sessions</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC] space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="w-64">
                                    <label className="block text-sm font-medium mb-1">Device Type</label>
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
                                    <label className="block text-sm font-medium mb-1">Status</label>
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
                            <CardTitle>Active Sessions ({sessions.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <span className="ml-2">Loading sessions...</span>
                                </div>
                            ) : (
                                <Table>
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
                                                        <div className="font-medium">{session.user_email}</div>
                                                        {session.user_profile?.first_name && (
                                                            <div className="text-sm text-gray-500">
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
                                                            <span className="text-xs text-gray-500">
                                                                {session.device_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <MapPin className="w-3 h-3" />
                                                        {session.ip_address || "Unknown"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(session)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(session.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">
                                                        {session.last_activity_at
                                                            ? formatDate(session.last_activity_at)
                                                            : "N/A"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {session.is_active && (
                                                        <div className="flex items-center gap-2">
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
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
