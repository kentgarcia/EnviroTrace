import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Badge } from "@/presentation/components/shared/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/presentation/components/shared/ui/dialog";
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
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import { Label } from "@/presentation/components/shared/ui/label";
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
import { MultiSelect } from "@/presentation/components/shared/ui/multi-select";
import { ScrollArea } from "@/presentation/components/shared/ui/scroll-area";
import { Loader2, Plus, Search, Trash2, Edit, Shield, Mail, Calendar, User as UserIcon, Eye, EyeOff, KeyRound } from "lucide-react";
import { useToast } from "@/core/hooks/ui/use-toast";
import {
    useUsers,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useReactivateUser,
    useApproveUser,
    useRevokeUserApproval,
    useAvailableRoles,
    CreateUserRequest,
    UpdateUserRequest,
    User
} from "@/core/api/admin-api";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { Alert, AlertDescription } from "@/presentation/components/shared/ui/alert";

interface UserFormData {
    email: string;
    password?: string;
    roles: string[];
    first_name?: string;
    last_name?: string;
    job_title?: string;
    department?: string;
    phone_number?: string;
}

interface PasswordResetFormData {
    new_password: string;
    confirm_password: string;
}

export function UserManagement() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"active" | "archived" | "all">("active");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
    const [viewPermissionsUser, setViewPermissionsUser] = useState<User | null>(null);
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { toast } = useToast();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

    // Queries
    const { data: users = [], isLoading, error } = useUsers({ 
        search: search || undefined,
        status: status 
    });
    const { data: availableRoles = [], isLoading: isLoadingRoles, error: rolesError } = useAvailableRoles();

    useEffect(() => {
        if (rolesError) {
            console.error("Failed to load roles:", rolesError);
            toast({
                title: "Warning",
                description: "Failed to load available roles. Please refresh the page.",
                variant: "destructive",
            });
        }
    }, [rolesError, toast]);

    // Fetch user permissions
    const { data: userPermissions, isLoading: loadingPermissions } = useQuery({
        queryKey: ["admin", "users", viewPermissionsUser?.id, "permissions"],
        queryFn: async () => {
            if (!viewPermissionsUser) return null;
            const response = await fetch(
                `${apiUrl}/admin/users/${viewPermissionsUser.id}/permissions`,
                {
                    headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
                }
            );
            if (!response.ok) throw new Error("Failed to fetch user permissions");
            return response.json() as Promise<{
                user_id: string;
                roles: string[];
                permissions: string[];
                is_super_admin: boolean;
            }>;
        },
        enabled: !!viewPermissionsUser,
    });

    // Mutations
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();
    const reactivateUserMutation = useReactivateUser();
    const approveUserMutation = useApproveUser();
    const revokeUserApprovalMutation = useRevokeUserApproval();

    // Form for create/edit
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UserFormData>({
        defaultValues: {
            email: "",
            password: "",
            roles: [],
            first_name: "",
            last_name: "",
            job_title: "",
            department: "",
            phone_number: ""
        }
    });

    // Form for password reset
    const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, watch: watchPassword, formState: { errors: passwordErrors } } = useForm<PasswordResetFormData>({
        defaultValues: {
            new_password: "",
            confirm_password: ""
        }
    });

    const watchedRoles = watch("roles") || [];

    const handleCreateUser = async (data: UserFormData) => {
        try {
            const createData: CreateUserRequest = {
                email: data.email,
                password: data.password!,
                is_super_admin: false,
                roles: data.roles,
                first_name: data.first_name || undefined,
                last_name: data.last_name || undefined,
                job_title: data.job_title || undefined,
                department: data.department || undefined,
                phone_number: data.phone_number || undefined
            };

            await createUserMutation.mutateAsync(createData);
            setIsCreateDialogOpen(false);
            reset();
            toast({
                title: "Success",
                description: "User created successfully!",
                variant: "default",
            });
        } catch (error: any) {
            console.error("Failed to create user:", error);

            // Handle specific error messages
            let errorMessage = "Failed to create user. Please try again.";
            
            // Check for archived account conflict (409)
            if (error?.response?.status === 409) {
                errorMessage = error?.response?.data?.detail || "An archived account exists with this email. Please contact an administrator to reactivate the account.";
            } else if (error?.response?.data?.detail) {
                const detail = error.response.data.detail;
                // Handle array of validation errors
                if (Array.isArray(detail)) {
                    errorMessage = detail.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(", ");
                } else if (typeof detail === "string") {
                    errorMessage = detail;
                } else {
                    errorMessage = JSON.stringify(detail);
                }
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleUpdateUser = async (data: UserFormData) => {
        if (!editingUser) return;

        try {
            const updateData: UpdateUserRequest = {
                email: data.email,
                is_super_admin: false,
                roles: data.roles,
                first_name: data.first_name || undefined,
                last_name: data.last_name || undefined,
                job_title: data.job_title || undefined,
                department: data.department || undefined,
                phone_number: data.phone_number || undefined
            };

            await updateUserMutation.mutateAsync({ userId: editingUser.id, userData: updateData });
            setEditingUser(null);
            reset();
            toast({
                title: "Success",
                description: "User updated successfully!",
                variant: "default",
            });
        } catch (error: any) {
            console.error("Failed to update user:", error);

            // Handle specific error messages
            let errorMessage = "Failed to update user. Please try again.";
            
            // Check for archived account conflict (409)
            if (error?.response?.status === 409) {
                errorMessage = error?.response?.data?.detail || "An archived account exists with this email. Cannot update to this email address.";
            } else if (error?.response?.data?.detail) {
                const detail = error.response.data.detail;
                // Handle array of validation errors
                if (Array.isArray(detail)) {
                    errorMessage = detail.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(", ");
                } else if (typeof detail === "string") {
                    errorMessage = detail;
                } else {
                    errorMessage = JSON.stringify(detail);
                }
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteUserMutation.mutateAsync(userId);
            toast({
                title: "Success",
                description: "User deleted successfully!",
                variant: "default",
            });
        } catch (error: any) {
            console.error("Failed to delete user:", error);

            // Handle specific error messages
            let errorMessage = "Failed to delete user. Please try again.";

            if (error?.response?.data?.detail) {
                const detail = error.response.data.detail;
                // Handle array of validation errors
                if (Array.isArray(detail)) {
                    errorMessage = detail.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(", ");
                } else if (typeof detail === "string") {
                    errorMessage = detail;
                } else {
                    errorMessage = JSON.stringify(detail);
                }
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleReactivateUser = async (userId: string, userEmail: string) => {
        try {
            await reactivateUserMutation.mutateAsync(userId);
            toast({
                title: "Success",
                description: `User ${userEmail} has been reactivated successfully!`,
                variant: "default",
            });
        } catch (error: any) {
            console.error("Failed to reactivate user:", error);

            // Handle specific error messages
            let errorMessage = "Failed to reactivate user. Please try again.";

            if (error?.response?.data?.detail) {
                const detail = error.response.data.detail;
                // Handle array of validation errors
                if (Array.isArray(detail)) {
                    errorMessage = detail.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(", ");
                } else if (typeof detail === "string") {
                    errorMessage = detail;
                } else {
                    errorMessage = JSON.stringify(detail);
                }
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleApproveUser = async (userId: string, userEmail: string) => {
        try {
            await approveUserMutation.mutateAsync(userId);
            toast({
                title: "Success",
                description: `User ${userEmail} has been approved successfully!`,
                variant: "default",
            });
        } catch (error: any) {
            console.error("Failed to approve user:", error);

            let errorMessage = "Failed to approve user. Please try again.";

            if (error?.response?.data?.detail) {
                const detail = error.response.data.detail;
                if (Array.isArray(detail)) {
                    errorMessage = detail.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(", ");
                } else if (typeof detail === "string") {
                    errorMessage = detail;
                } else {
                    errorMessage = JSON.stringify(detail);
                }
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleRevokeUserApproval = async (userId: string, userEmail: string) => {
        try {
            await revokeUserApprovalMutation.mutateAsync(userId);
            toast({
                title: "Success",
                description: `User ${userEmail}'s approval has been revoked.`,
                variant: "default",
            });
        } catch (error: any) {
            console.error("Failed to revoke user approval:", error);

            let errorMessage = "Failed to revoke user approval. Please try again.";

            if (error?.response?.data?.detail) {
                const detail = error.response.data.detail;
                if (Array.isArray(detail)) {
                    errorMessage = detail.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(", ");
                } else if (typeof detail === "string") {
                    errorMessage = detail;
                } else {
                    errorMessage = JSON.stringify(detail);
                }
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (!isCreateDialogOpen) {
            setShowCreatePassword(false);
        }
    }, [isCreateDialogOpen]);

    const openEditDialog = (user: User) => {
        setEditingUser(user);
        setValue("email", user.email);
        setValue("roles", user.assigned_roles);
        setValue("first_name", user.profile?.first_name || "");
        setValue("last_name", user.profile?.last_name || "");
        setValue("job_title", user.profile?.job_title || "");
        setValue("department", user.profile?.department || "");
        setValue("phone_number", user.profile?.phone_number || "");
    };

    const closeEditDialog = () => {
        setEditingUser(null);
        reset();
    };

    const openPasswordResetDialog = (user: User) => {
        setPasswordResetUser(user);
        resetPassword();
    };

    const closePasswordResetDialog = () => {
        setPasswordResetUser(null);
        resetPassword();
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const handlePasswordReset = async (data: PasswordResetFormData) => {
        if (!passwordResetUser) return;

        if (data.new_password !== data.confirm_password) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        try {
            const updateData: UpdateUserRequest = {
                email: passwordResetUser.email,
                is_super_admin: false,
                roles: passwordResetUser.assigned_roles,
                password: data.new_password,
            };

            await updateUserMutation.mutateAsync({ userId: passwordResetUser.id, userData: updateData });
            closePasswordResetDialog();
            toast({
                title: "Success",
                description: "Password updated successfully!",
                variant: "default",
            });
        } catch (error: any) {
            console.error("Failed to reset password:", error);
            toast({
                title: "Error",
                description: error?.response?.data?.detail || "Failed to reset password. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleRolesChange = (values: string[]) => {
        setValue("roles", values, { shouldDirty: true, shouldTouch: true });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
            urban_greening: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
            government_emission: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200",
        };
        return colors[role] || "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200";
    };

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-red-600">
                            <p>Error loading users: {error.message}</p>
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage users, roles, and permissions</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 page-bg space-y-6">
                    {/* Header with Status Filter and Add Button */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant={status === "active" ? "default" : "outline"}
                                onClick={() => setStatus("active")}
                                className={status === "active" ? "" : "bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"}
                            >
                                Active Users
                            </Button>
                            <Button
                                variant={status === "archived" ? "default" : "outline"}
                                onClick={() => setStatus("archived")}
                                className={status === "archived" ? "" : "bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"}
                            >
                                Archived Users
                            </Button>
                            <Button
                                variant={status === "all" ? "default" : "outline"}
                                onClick={() => setStatus("all")}
                                className={status === "all" ? "" : "bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"}
                            >
                                All Users
                            </Button>
                        </div>

                        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#0033a0] hover:bg-[#002a80] text-white dark:bg-[#0033a0] dark:hover:bg-[#002a80]">
                            <Plus className="w-4 h-4 mr-2" />
                            Add User
                        </Button>
                    </div>

                    {/* Create User Dialog */}
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogContent className="sm:max-w-md">
                            <form onSubmit={handleSubmit(handleCreateUser)}>
                                <DialogHeader>
                                    <DialogTitle>Create New User</DialogTitle>
                                    <DialogDescription>
                                        Add a new user to the system with assigned roles.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            {...register("email", { 
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: "Invalid email address"
                                                }
                                            })}
                                            placeholder="user@example.com"
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showCreatePassword ? "text" : "password"}
                                                className="pr-10"
                                                {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCreatePassword((prev) => !prev)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                                aria-label={showCreatePassword ? "Hide password" : "Show password"}
                                            >
                                                {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="first_name">First Name</Label>
                                            <Input
                                                id="first_name"
                                                {...register("first_name")}
                                                placeholder="John"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="last_name">Last Name</Label>
                                            <Input
                                                id="last_name"
                                                {...register("last_name")}
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="job_title">Job Title</Label>
                                        <Input
                                            id="job_title"
                                            {...register("job_title")}
                                            placeholder="Environmental Officer"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="department">Department</Label>
                                            <Input
                                                id="department"
                                                {...register("department")}
                                                placeholder="Urban Planning"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="phone_number">Phone Number</Label>
                                            <Input
                                                id="phone_number"
                                                {...register("phone_number")}
                                                placeholder="+1234567890"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Roles</Label>
                                        <div className="mt-2">
                                            {isLoadingRoles ? (
                                                <div className="flex items-center justify-center p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-muted/30">
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    <span className="text-sm text-muted-foreground">Loading roles...</span>
                                                </div>
                                            ) : (
                                                <MultiSelect
                                                    items={availableRoles}
                                                    selectedValues={watchedRoles}
                                                    onChange={handleRolesChange}
                                                    placeholder="Select roles..."
                                                    emptyMessage="No roles available."
                                                    maxDisplayItems={2}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createUserMutation.isPending}>
                                        {createUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Create User
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Search */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Search Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Input
                                    placeholder="Search by email, name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="max-w-sm"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Users ({users.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <span className="ml-2">Loading users...</span>
                                </div>
                            ) : (
                                <Table className="border dark:border-gray-700">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Roles</TableHead>
                                            <TableHead>Last Sign In</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id} className={user.deleted_at ? "bg-gray-50 dark:bg-gray-800/50" : ""}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <div className="font-medium flex items-center gap-2">
                                                                {user.profile?.first_name && user.profile?.last_name
                                                                    ? `${user.profile.first_name} ${user.profile.last_name}`
                                                                    : "No Name"}
                                                                {user.deleted_at && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        Archived
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {user.is_super_admin && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    <Shield className="w-3 h-3 mr-1" />
                                                                    Super Admin
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {!user.email_confirmed_at ? (
                                                            <Badge variant="secondary" className="text-xs w-fit">
                                                                Email Not Verified
                                                            </Badge>
                                                        ) : !user.is_approved && !user.is_super_admin ? (
                                                            <Badge variant="outline" className="text-xs w-fit border-amber-500 dark:border-amber-600 text-amber-700 dark:text-amber-400">
                                                                Pending Approval
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs w-fit border-green-500 dark:border-green-600 text-green-700 dark:text-green-400">
                                                                Approved
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                        {user.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.assigned_roles.map((role) => (
                                                            <Badge key={role} className={getRoleColor(role)}>
                                                                {role.replace("_", " ")}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                        <Calendar className="w-4 h-4" />
                                                        {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Never"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                                        {formatDate(user.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {user.deleted_at ? (
                                                            // Archived user - show Reactivate button
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="text-green-600">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                                                                        Reactivate
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Reactivate User</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to reactivate {user.email}? This will restore their access to the system.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleReactivateUser(user.id, user.email)}
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            Reactivate
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        ) : (
                                                            // Active user - show Edit and Delete buttons
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openEditDialog(user)}
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>

                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openPasswordResetDialog(user)}
                                                                    title="Reset Password"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                                                </Button>

                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setViewPermissionsUser(user)}
                                                                    title="View Permissions"
                                                                >
                                                                    <KeyRound className="w-4 h-4" />
                                                                </Button>

                                                                {/* Approval buttons */}
                                                                {user.email_confirmed_at && !user.is_super_admin && (
                                                                    <>
                                                                        {!user.is_approved ? (
                                                                            <AlertDialog>
                                                                                <AlertDialogTrigger asChild>
                                                                                    <Button variant="outline" size="sm" className="text-green-600">
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                                                                                    </Button>
                                                                                </AlertDialogTrigger>
                                                                                <AlertDialogContent>
                                                                                    <AlertDialogHeader>
                                                                                        <AlertDialogTitle>Approve User</AlertDialogTitle>
                                                                                        <AlertDialogDescription>
                                                                                            Are you sure you want to approve {user.email}? This will grant them full access to the system.
                                                                                        </AlertDialogDescription>
                                                                                    </AlertDialogHeader>
                                                                                    <AlertDialogFooter>
                                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                        <AlertDialogAction
                                                                                            onClick={() => handleApproveUser(user.id, user.email)}
                                                                                            className="bg-green-600 hover:bg-green-700"
                                                                                        >
                                                                                            Approve
                                                                                        </AlertDialogAction>
                                                                                    </AlertDialogFooter>
                                                                                </AlertDialogContent>
                                                                            </AlertDialog>
                                                                        ) : (
                                                                            <AlertDialog>
                                                                                <AlertDialogTrigger asChild>
                                                                                    <Button variant="outline" size="sm" className="text-amber-600">
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                                                                                    </Button>
                                                                                </AlertDialogTrigger>
                                                                                <AlertDialogContent>
                                                                                    <AlertDialogHeader>
                                                                                        <AlertDialogTitle>Revoke Approval</AlertDialogTitle>
                                                                                        <AlertDialogDescription>
                                                                                            Are you sure you want to revoke approval for {user.email}? This will block their access until approved again.
                                                                                        </AlertDialogDescription>
                                                                                    </AlertDialogHeader>
                                                                                    <AlertDialogFooter>
                                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                        <AlertDialogAction
                                                                                            onClick={() => handleRevokeUserApproval(user.id, user.email)}
                                                                                            className="bg-amber-600 hover:bg-amber-700"
                                                                                        >
                                                                                            Revoke
                                                                                        </AlertDialogAction>
                                                                                    </AlertDialogFooter>
                                                                                </AlertDialogContent>
                                                                            </AlertDialog>
                                                                        )}
                                                                    </>
                                                                )}

                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="outline" size="sm">
                                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to delete {user.email}? This action cannot be undone.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDeleteUser(user.id)}
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                Delete
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>



            {/* Edit User Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && closeEditDialog()}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleSubmit(handleUpdateUser)}>
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                                Update user information and roles.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    {...register("email", { 
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-first_name">First Name</Label>
                                    <Input
                                        id="edit-first_name"
                                        {...register("first_name")}
                                        placeholder="John"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="edit-last_name">Last Name</Label>
                                    <Input
                                        id="edit-last_name"
                                        {...register("last_name")}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit-job_title">Job Title</Label>
                                <Input
                                    id="edit-job_title"
                                    {...register("job_title")}
                                    placeholder="Environmental Officer"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-department">Department</Label>
                                    <Input
                                        id="edit-department"
                                        {...register("department")}
                                        placeholder="Urban Planning"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="edit-phone_number">Phone Number</Label>
                                    <Input
                                        id="edit-phone_number"
                                        {...register("phone_number")}
                                        placeholder="+1234567890"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Roles</Label>
                                <div className="mt-2">
                                    {isLoadingRoles ? (
                                        <div className="flex items-center justify-center p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-muted/30">
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            <span className="text-sm text-muted-foreground">Loading roles...</span>
                                        </div>
                                    ) : (
                                        <MultiSelect
                                            items={availableRoles}
                                            selectedValues={watchedRoles}
                                            onChange={handleRolesChange}
                                            placeholder="Select roles..."
                                            emptyMessage="No roles available."
                                            maxDisplayItems={2}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeEditDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateUserMutation.isPending}>
                                {updateUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Update User
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Password Reset Dialog */}
            <Dialog open={!!passwordResetUser} onOpenChange={(open) => !open && closePasswordResetDialog()}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleSubmitPassword(handlePasswordReset)}>
                        <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>
                                Set a new password for {passwordResetUser?.email}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="new_password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="new_password"
                                        type={showNewPassword ? "text" : "password"}
                                        className="pr-10"
                                        {...registerPassword("new_password", { 
                                            required: "Password is required",
                                            minLength: { value: 8, message: "Password must be at least 8 characters" } 
                                        })}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordErrors.new_password && (
                                    <p className="text-sm text-red-600 mt-1">{passwordErrors.new_password.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="confirm_password">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm_password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="pr-10"
                                        {...registerPassword("confirm_password", { 
                                            required: "Please confirm password",
                                            validate: (val: string) => {
                                                if (watchPassword('new_password') !== val) {
                                                    return "Passwords do not match";
                                                }
                                            }
                                        })}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordErrors.confirm_password && (
                                    <p className="text-sm text-red-600 mt-1">{passwordErrors.confirm_password.message}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closePasswordResetDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateUserMutation.isPending}>
                                {updateUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Reset Password
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Permissions Dialog */}
            <Dialog open={!!viewPermissionsUser} onOpenChange={(open) => !open && setViewPermissionsUser(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>User Permissions</DialogTitle>
                        <DialogDescription>
                            View all permissions for {viewPermissionsUser?.email}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {loadingPermissions ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : userPermissions ? (
                            <>
                                {/* Super Admin Badge */}
                                {userPermissions.is_super_admin && (
                                    <Alert className="bg-red-50 border-red-200">
                                        <Shield className="h-4 w-4 text-red-600" />
                                        <AlertDescription className="text-red-800">
                                            This user is a <strong>Super Admin</strong> with unrestricted access to all system features.
                                            Super admin status is controlled by the SUPER_ADMIN_EMAILS environment variable.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* User Info */}
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {viewPermissionsUser?.profile?.first_name} {viewPermissionsUser?.profile?.last_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{viewPermissionsUser?.email}</p>
                                    </div>
                                </div>

                                {/* Roles */}
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Assigned Roles ({userPermissions.roles.length})
                                    </h4>
                                    {userPermissions.roles.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {userPermissions.roles.map((role) => {
                                                const roleInfo = availableRoles.find(r => r.value === role);
                                                return (
                                                    <Badge key={role} variant="secondary" className="text-sm">
                                                        {roleInfo?.label || role}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No roles assigned</p>
                                    )}
                                </div>

                                {/* Permissions */}
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <KeyRound className="h-4 w-4" />
                                        Permissions ({userPermissions.is_super_admin ? 'All' : userPermissions.permissions.length})
                                    </h4>
                                    {userPermissions.is_super_admin ? (
                                        <p className="text-sm text-muted-foreground italic">Super admins have access to all permissions and bypass permission checks.</p>
                                    ) : userPermissions.permissions.length > 0 ? (
                                        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                                            <div className="space-y-1">
                                                {userPermissions.permissions.sort().map((permission) => (
                                                    <div key={permission} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                        <code className="text-xs font-mono">{permission}</code>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No specific permissions granted</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No permission data available</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setViewPermissionsUser(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
