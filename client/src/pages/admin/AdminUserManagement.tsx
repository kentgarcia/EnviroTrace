import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Edit,
  UserX,
  Trash2,
  UserPlus,
  Search,
  Shield,
  Mail,
  CalendarDays,
  User,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { fetchUsers, createUser, updateUserRole, deleteUser, UserRole } from "@/lib/user-api";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: string;
  created_at: string;
}

// Form schema for user editing (password optional)
const editUserFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["admin", "air_quality", "tree_management", "government_emission", "user", "revoked"]),
});

// Form schema for user creation (password required)
const addUserFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["admin", "air_quality", "tree_management", "government_emission", "user", "revoked"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AdminUserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Modal states
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Query to fetch users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Edit user form
  const editForm = useForm<z.infer<typeof editUserFormSchema>>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      email: "",
      full_name: "",
      role: "admin",
    },
  });

  // Add user form
  const addForm = useForm<z.infer<typeof addUserFormSchema>>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      email: "",
      full_name: "",
      role: "admin",
      password: "",
    },
  });

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof editUserFormSchema>) => {
      if (!selectedUser) return;

      // Update user role if it changed
      if (data.role !== selectedUser.role) {
        await updateUserRole(selectedUser.id, selectedUser.role, data.role);
      }

      // Return updated user data (profile updates would be handled separately)
      return { ...selectedUser, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User updated",
        description: "The user has been successfully updated.",
      });
      setEditUserDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update user: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addUserFormSchema>) => {
      // Create user with GraphQL
      return await createUser(data.email, data.password, data.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User created",
        description: "The new user has been successfully created.",
      });
      setAddUserDialogOpen(false);
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create user: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Delete user using GraphQL
      return await deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User deleted",
        description: "The user has been permanently deleted.",
      });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete user: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const revokeAccessMutation = useMutation({
    mutationFn: async (userId: string) => {
      // This functionality might need to be implemented in your GraphQL API
      // For now, we'll just update the user's role to a revoked state
      return await updateUserRole(userId, selectedUser?.role || "", "revoked");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Access revoked",
        description: "The user's access has been revoked.",
      });
      setRevokeDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to revoke access: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  // Filter users based on search term
  const filteredUsers = users?.filter(user =>
    user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });
    setEditUserDialogOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Handle revoke access
  const handleRevokeAccess = (user: User) => {
    setSelectedUser(user);
    setRevokeDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'air_quality':
      case 'tree_management':
      case 'government_emission':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-100">
        <AppSidebar dashboardType="tree-management" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">ADMIN DASHBOARD</h1>
                  <p className="text-sm text-gray-500">User Management System</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10 h-10 w-full min-w-[240px] rounded-full bg-gray-100"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Button onClick={() => setAddUserDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <SkeletonTable rows={5} columns={6} />
                ) : error ? (
                  <div className="text-center p-4 text-red-500">
                    Error loading users: {(error as Error).message}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date Registered</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers && filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.full_name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                  {user.role}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                                  {user.status}
                                </span>
                              </TableCell>
                              <TableCell>{formatDate(user.created_at)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRevokeAccess(user)}
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">
                              No users found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user's details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit((data) => updateUserMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="full_name"
                  className="col-span-3"
                  {...editForm.register("full_name")}
                />
                {editForm.formState.errors.full_name && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {editForm.formState.errors.full_name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  className="col-span-3"
                  {...editForm.register("email")}
                />
                {editForm.formState.errors.email && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {editForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <select
                  id="role"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...editForm.register("role")}
                >
                  <option value="admin">Admin</option>
                  <option value="air_quality">Air Quality</option>
                  <option value="tree_management">Tree Management</option>
                  <option value="government_emission">Government Emission</option>
                  <option value="user">User</option>
                  <option value="revoked">Revoked</option>
                </select>
                {editForm.formState.errors.role && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {editForm.formState.errors.role.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new user account.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={addForm.handleSubmit((data) => addUserMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="add-name"
                  className="col-span-3"
                  {...addForm.register("full_name")}
                />
                {addForm.formState.errors.full_name && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {addForm.formState.errors.full_name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="add-email"
                  className="col-span-3"
                  {...addForm.register("email")}
                />
                {addForm.formState.errors.email && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {addForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-password" className="text-right">
                  Password
                </Label>
                <Input
                  id="add-password"
                  type="password"
                  className="col-span-3"
                  {...addForm.register("password")}
                />
                {addForm.formState.errors.password && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {addForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-role" className="text-right">
                  Role
                </Label>
                <select
                  id="add-role"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...addForm.register("role")}
                >
                  <option value="admin">Admin</option>
                  <option value="air_quality">Air Quality</option>
                  <option value="tree_management">Tree Management</option>
                  <option value="government_emission">Government Emission</option>
                  <option value="user">User</option>
                  <option value="revoked">Revoked</option>
                </select>
                {addForm.formState.errors.role && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {addForm.formState.errors.role.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addUserMutation.isPending}>
                {addUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the user account for {selectedUser?.full_name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Revoke Access Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke User Access</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke access for {selectedUser?.full_name}. They will no longer be able
              to log in to the system. You can restore access later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && revokeAccessMutation.mutate(selectedUser.id)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {revokeAccessMutation.isPending ? "Revoking..." : "Revoke Access"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
