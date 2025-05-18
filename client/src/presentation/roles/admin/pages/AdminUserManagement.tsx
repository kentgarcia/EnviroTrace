import { useState } from "react";
import { AppSidebar } from "@/presentation/components/shared/layout/AppSidebar";
import { SidebarProvider } from "@/presentation/components/shared/ui/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/shared/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/components/shared/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/presentation/components/shared/ui/sheet";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import { useToast } from "@/hooks/ui/use-toast";
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
  ArrowUpDown,
} from "lucide-react";
import { useDebounce } from "@/hooks/utils/useDebounce";
import { SkeletonTable } from "@/presentation/components/shared/ui/skeleton-table";
import { SkeletonCard } from "@/presentation/components/shared/ui/skeleton-card";
import { useMutation, useQuery, gql } from "@apollo/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/presentation/components/shared/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UserRole } from "@/lib/api/user-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/presentation/components/shared/ui/dropdown-menu";
import { Settings, GripHorizontal, List, Rows3 } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
  PaginationState,
  VisibilityState,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { UserTable } from "../components/UserTable";
import { EditUserDialog } from "../components/EditUserDialog";
import { AddUserDialog } from "../components/AddUserDialog";
import { DeleteUserDialog } from "../components/DeleteUserDialog";
import { RevokeAccessDialog } from "../components/RevokeAccessDialog";

// GraphQL queries and mutations
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      lastSignInAt
      createdAt
      updatedAt
      isSuperAdmin
      roles
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      roles
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      roles
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

const ADD_USER_ROLE = gql`
  mutation AddUserRole($userId: ID!, $role: UserRole!) {
    addUserRole(userId: $userId, role: $role) {
      id
      roles
    }
  }
`;

const REMOVE_USER_ROLE = gql`
  mutation RemoveUserRole($userId: ID!, $role: UserRole!) {
    removeUserRole(userId: $userId, role: $role) {
      id
      roles
    }
  }
`;

interface User {
  id: string;
  email: string;
  full_name: string;
  roles: UserRole[];
  status: string;
  created_at: string;
  last_sign_in: string;
  updated_at: string;
}

// Form schema for user editing
const editUserFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  roles: z
    .array(
      z.enum([
        "admin",
        "air_quality",
        "tree_management",
        "government_emission",
        "user",
        "revoked",
      ])
    )
    .min(1, "User must have at least one role"),
});

// Form schema for user creation
const addUserFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  roles: z
    .array(
      z.enum([
        "admin",
        "air_quality",
        "tree_management",
        "government_emission",
        "user",
        "revoked",
      ])
    )
    .min(1, "User must have at least one role"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AdminUserManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);

  // Apollo queries and mutations
  const {
    data: usersData,
    loading: isLoading,
    error,
    refetch,
  } = useQuery(GET_USERS, {
    fetchPolicy: "network-only",
  });

  const [createUser, { loading: createLoading }] = useMutation(CREATE_USER);
  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER);
  const [deleteUser, { loading: deleteLoading }] = useMutation(DELETE_USER);
  const [addUserRole, { loading: addRoleLoading }] = useMutation(ADD_USER_ROLE);
  const [removeUserRole, { loading: removeRoleLoading }] =
    useMutation(REMOVE_USER_ROLE);

  // Edit user form
  const editForm = useForm<z.infer<typeof editUserFormSchema>>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      email: "",
      full_name: "",
      roles: ["admin"],
    },
  });

  // Add user form
  const addForm = useForm<z.infer<typeof addUserFormSchema>>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      email: "",
      full_name: "",
      roles: ["admin"],
      password: "",
    },
  });

  // Transform users data
  const users =
    usersData?.users?.map((user: any) => ({
      id: user.id,
      email: user.email,
      full_name: user.email.split("@")[0], // Use email username as display name
      roles: user.roles || ["user"],
      status: user.isSuperAdmin ? "Super Admin" : "Active",
      created_at: new Date(user.createdAt).toLocaleDateString(),
      last_sign_in: user.lastSignInAt
        ? new Date(user.lastSignInAt).toLocaleDateString()
        : "Never",
      updated_at: new Date(user.updatedAt).toLocaleDateString(),
    })) || [];

  // Filter users based on search term
  const filteredUsers = users?.filter(
    (user) =>
      user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.full_name
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      user.roles.some((role) =>
        role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
  );

  // Handle edit user
  const handleEditUser = async (data: any) => {
    if (!selectedUser) return;

    try {
      await updateUser({
        variables: {
          id: selectedUser.id,
          input: {
            email: data.email,
            roles: data.roles,
          },
        },
      });
      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser({
        variables: {
          id: selectedUser.id,
        },
      });
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Handle revoke access
  const handleRevokeAccess = async () => {
    if (!selectedUser) return;

    try {
      await addUserRole({
        variables: {
          userId: selectedUser.id,
          role: "revoked",
        },
      });
      setIsRevokeDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error revoking access:", error);
    }
  };

  // Format date with time
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "air_quality":
        return "bg-blue-100 text-blue-800";
      case "tree_management":
        return "bg-green-100 text-green-800";
      case "government_emission":
        return "bg-purple-100 text-purple-800";
      case "revoked":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Super Admin":
        return "bg-purple-100 text-purple-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Banned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle form submissions
  const handleEditSubmit = async (data: z.infer<typeof editUserFormSchema>) => {
    if (!selectedUser) return;

    try {
      // Update user roles
      if (
        data.roles.length !== selectedUser.roles.length ||
        !data.roles.every((role) => selectedUser.roles.includes(role))
      ) {
        // Remove roles that are no longer present
        for (const oldRole of selectedUser.roles) {
          if (!data.roles.includes(oldRole)) {
            await removeUserRole({
              variables: { userId: selectedUser.id, role: oldRole },
            });
          }
        }

        // Add new roles
        for (const newRole of data.roles) {
          if (!selectedUser.roles.includes(newRole)) {
            await addUserRole({
              variables: { userId: selectedUser.id, role: newRole },
            });
          }
        }
      }

      toast({
        title: "User updated",
        description: "The user has been successfully updated.",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update user: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const handleAddSubmit = async (data: z.infer<typeof addUserFormSchema>) => {
    try {
      // Create user
      await createUser({
        variables: {
          input: {
            email: data.email,
            password: data.password,
            roles: data.roles,
          },
        },
      });

      toast({
        title: "User created",
        description: "The new user has been successfully created.",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create user: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const [density, setDensity] = useState<"compact" | "normal" | "spacious">(
    "normal"
  );
  const [columnVisibility, setColumnVisibility] = useState({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "email", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const densityClasses = {
    compact: "text-xs h-6",
    normal: "text-sm h-9",
    spacious: "text-base h-12",
  };

  // Define columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Name
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Email
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "roles",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Roles
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          {row.original.roles.map((role) => (
            <span
              key={role}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                role as UserRole
              )}`}
            >
              {role.replace("_", " ").toUpperCase()}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Status
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
            row.original.status
          )}`}
        >
          {row.original.status.replace("_", " ").toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: "last_sign_in",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Last Sign In
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDateTime(row.original.last_sign_in),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Created
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedUser(row.original);
              setIsEditDialogOpen(true);
            }}
            title="Edit User"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedUser(row.original);
              setIsRevokeDialogOpen(true);
            }}
            title="Revoke Access"
            disabled={row.original.status === "Super Admin"}
          >
            <UserX className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedUser(row.original);
              setIsDeleteDialogOpen(true);
            }}
            title="Delete User"
            disabled={row.original.status === "Super Admin"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-100">
        <AppSidebar dashboardType="admin" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    ADMIN DASHBOARD
                  </h1>
                  <p className="text-sm text-gray-500">
                    User Management System
                  </p>
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
                <Button onClick={() => setIsAddDialogOpen(true)}>
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
                  <div className="space-y-2 text-xs">
                    {/* Table Controls */}
                    <div className="flex justify-between items-center py-1">
                      <div className="text-xs text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} users
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Density:</span>
                        <Button
                          size="sm"
                          variant={
                            density === "compact" ? "default" : "outline"
                          }
                          className="px-2 py-1 text-xs"
                          onClick={() => setDensity("compact")}
                          title="Compact"
                        >
                          <GripHorizontal className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={density === "normal" ? "default" : "outline"}
                          className="px-2 py-1 text-xs"
                          onClick={() => setDensity("normal")}
                          title="Normal"
                        >
                          <Rows3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            density === "spacious" ? "default" : "outline"
                          }
                          className="px-2 py-1 text-xs"
                          onClick={() => setDensity("spacious")}
                          title="Spacious"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 py-1 text-xs bg-white min-h-[28px]"
                            >
                              <Settings className="mr-2 h-3.5 w-3.5" />
                              View Options
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px] text-xs bg-white"
                          >
                            {table
                              .getAllColumns()
                              .filter((column) => column.getCanHide())
                              .map((column) => (
                                <DropdownMenuCheckboxItem
                                  key={column.id}
                                  checked={column.getIsVisible()}
                                  onCheckedChange={(value) =>
                                    column.toggleVisibility(value)
                                  }
                                >
                                  {column.id === "full_name"
                                    ? "Name"
                                    : column.id === "last_sign_in"
                                    ? "Last Sign In"
                                    : column.id === "created_at"
                                    ? "Created"
                                    : column.id.charAt(0).toUpperCase() +
                                      column.id.slice(1)}
                                </DropdownMenuCheckboxItem>
                              ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => table.resetColumnVisibility()}
                              className="justify-center text-center"
                            >
                              Reset View
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="rounded-md border overflow-x-auto bg-white">
                      <Table
                        className={
                          density === "compact"
                            ? "text-xs"
                            : density === "spacious"
                            ? "text-base"
                            : "text-sm"
                        }
                      >
                        <TableHeader>
                          {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                              key={headerGroup.id}
                              className={densityClasses[density]}
                            >
                              {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </TableHead>
                              ))}
                            </TableRow>
                          ))}
                        </TableHeader>
                        <TableBody>
                          {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                              <TableRow
                                key={row.id}
                                data-state={
                                  row.getIsSelected() ? "selected" : undefined
                                }
                                className={densityClasses[density]}
                              >
                                {row.getVisibleCells().map((cell) => (
                                  <TableCell key={cell.id}>
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow className={densityClasses[density]}>
                              <TableCell
                                colSpan={columns.length}
                                className="text-center"
                              >
                                No users found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination Controls */}
                    {table.getRowModel().rows?.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2 py-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span>Rows per page:</span>
                          <select
                            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => {
                              table.setPageSize(Number(e.target.value));
                            }}
                          >
                            {[5, 10, 20, 50, 100].map((pageSize) => (
                              <option key={pageSize} value={pageSize}>
                                {pageSize}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 py-1"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                          >
                            Previous
                          </Button>

                          <span>
                            Page{" "}
                            <span className="font-semibold">
                              {table.getState().pagination.pageIndex + 1}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold">
                              {table.getPageCount()}
                            </span>
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 py-1"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit User Dialog */}
      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onSubmit={handleEditSubmit}
      />

      {/* Add User Dialog */}
      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddSubmit}
      />

      {/* Confirm Delete Dialog */}
      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteUser}
        userName={selectedUser?.full_name || "this user"}
        isDeleting={deleteLoading}
      />

      {/* Confirm Revoke Access Dialog */}
      <RevokeAccessDialog
        open={isRevokeDialogOpen}
        onOpenChange={setIsRevokeDialogOpen}
        onConfirm={handleRevokeAccess}
        userName={selectedUser?.full_name || "this user"}
        isRevoking={addRoleLoading}
      />
    </SidebarProvider>
  );
}
