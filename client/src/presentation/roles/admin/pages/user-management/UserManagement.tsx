import React, { useState } from "react";
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
import { Loader2, Plus, Search, Trash2, Edit, Shield, Mail, Calendar, User as UserIcon } from "lucide-react";
import { useToast } from "@/core/hooks/ui/use-toast";
import {
    useUsers,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useAvailableRoles,
    CreateUserRequest,
    UpdateUserRequest,
    User
} from "@/core/api/admin-api";
import { useForm } from "react-hook-form";

interface UserFormData {
    email: string;
    password?: string;
    is_super_admin: boolean;
    roles: string[];
}

export function UserManagement() {
    const [search, setSearch] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { toast } = useToast();

    // Queries
    const { data: users = [], isLoading, error } = useUsers({ search: search || undefined });
    const { data: availableRoles = [] } = useAvailableRoles();

    // Mutations
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();

    // Form for create/edit
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UserFormData>({
        defaultValues: {
            email: "",
            password: "",
            is_super_admin: false,
            roles: []
        }
    });

    const watchedRoles = watch("roles");

    const handleCreateUser = async (data: UserFormData) => {
        try {
            const createData: CreateUserRequest = {
                email: data.email,
                password: data.password!,
                is_super_admin: data.is_super_admin,
                roles: data.roles
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

            if (error?.response?.data?.detail) {
                errorMessage = error.response.data.detail;
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
                is_super_admin: data.is_super_admin,
                roles: data.roles
            };

            if (data.password) {
                updateData.password = data.password;
            }

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

            if (error?.response?.data?.detail) {
                errorMessage = error.response.data.detail;
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
                errorMessage = error.response.data.detail;
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

    const openEditDialog = (user: User) => {
        setEditingUser(user);
        setValue("email", user.email);
        setValue("is_super_admin", user.is_super_admin);
        setValue("roles", user.assigned_roles);
        setValue("password", ""); // Don't pre-fill password
    };

    const closeEditDialog = () => {
        setEditingUser(null);
        reset();
    };

    const handleRoleToggle = (roleValue: string, checked: boolean) => {
        const currentRoles = watchedRoles || [];
        if (checked) {
            setValue("roles", [...currentRoles, roleValue]);
        } else {
            setValue("roles", currentRoles.filter(role => role !== roleValue));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: "bg-red-100 text-red-800",
            urban_greening: "bg-green-100 text-green-800",
            government_emission: "bg-purple-100 text-purple-800",
        };
        return colors[role] || "bg-gray-100 text-gray-800";
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
            <div className="bg-white px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600">Manage users, roles, and permissions</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC] space-y-6">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add User
                            </Button>
                        </DialogTrigger>
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
                                            {...register("email", { required: "Email is required" })}
                                            placeholder="user@example.com"
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
                                            placeholder="••••••••"
                                        />
                                        {errors.password && (
                                            <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_super_admin"
                                            {...register("is_super_admin")}
                                        />
                                        <Label htmlFor="is_super_admin">Super Admin</Label>
                                    </div>

                                    <div>
                                        <Label>Roles</Label>
                                        <div className="space-y-2 mt-2">
                                            {availableRoles.map((role) => (
                                                <div key={role.value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`role-${role.value}`}
                                                        checked={watchedRoles?.includes(role.value) || false}
                                                        onCheckedChange={(checked) => handleRoleToggle(role.value, checked as boolean)}
                                                    />
                                                    <Label htmlFor={`role-${role.value}`}>{role.label}</Label>
                                                </div>
                                            ))}
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
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Roles</TableHead>
                                            <TableHead>Last Sign In</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <UserIcon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">
                                                                {user.profile?.first_name && user.profile?.last_name
                                                                    ? `${user.profile.first_name} ${user.profile.last_name}`
                                                                    : "No Name"}
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
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-gray-400" />
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
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Never"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">
                                                        {formatDate(user.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openEditDialog(user)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>

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
                                    {...register("email", { required: "Email is required" })}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="edit-password">New Password (optional)</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    {...register("password", { minLength: { value: 8, message: "Password must be at least 8 characters" } })}
                                    placeholder="Leave blank to keep current password"
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-is_super_admin"
                                    {...register("is_super_admin")}
                                />
                                <Label htmlFor="edit-is_super_admin">Super Admin</Label>
                            </div>

                            <div>
                                <Label>Roles</Label>
                                <div className="space-y-2 mt-2">
                                    {availableRoles.map((role) => (
                                        <div key={role.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`edit-role-${role.value}`}
                                                checked={watchedRoles?.includes(role.value) || false}
                                                onCheckedChange={(checked) => handleRoleToggle(role.value, checked as boolean)}
                                            />
                                            <Label htmlFor={`edit-role-${role.value}`}>{role.label}</Label>
                                        </div>
                                    ))}
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
        </div>
    );
}
