import { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Switch } from "@/presentation/components/shared/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/presentation/components/shared/ui/table";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { ScrollArea } from "@/presentation/components/shared/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/presentation/components/shared/ui/dialog";
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
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Shield, Users, Key, Lock, Eye, AlertCircle, Plus, Pencil, Trash2, Loader2, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { useContextMenuAction } from "@/core/hooks/useContextMenuAction";
import { Alert, AlertDescription } from "@/presentation/components/shared/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/presentation/components/shared/ui/tooltip";
import { RefreshButton } from "@/presentation/components/shared/buttons/RefreshButton";

interface Permission {
  id: string;
  name: string;
  description: string;
  module_name: string;
  entity_type: string;
  action: string;
}

interface RolePermissions {
  role: RoleSummary;
  permissions: Permission[];
}

interface RoleSummary {
  id: string;
  slug: string;
  display_name: string;
  description?: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

const entityDisplayNames: Record<string, string> = {
  // Admin / Core
  user: "User Accounts",
  user_account: "User Accounts",
  role: "System Roles",
  permission: "Access Controls",
  audit_log: "System Audit Logs",
  profile: "User Profiles",
  session: "Active Sessions",
  
  // Urban Greening
  tree_inventory: "Tree Inventory",
  planting: "Planting Records",
  species: "Tree Species Catalog",
  tree_management: "Forestry Management",
  fee: "Service Fees & Billing",
  
  // Government Emission
  office: "Government Offices",
  vehicle: "Vehicle Registry",
  test: "Emission Test Results",
  schedule: "Inspection Schedules",
};

const getEntityLabel = (entity: string) => {
  return entityDisplayNames[entity] || entity.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getModuleLabel = (module: string) => {
  const labels: Record<string, string> = {
    admin: "Administration & Security",
    urban_greening: "Urban Forestry Management",
    emission: "Emission Control System",
    government_emission: "Emission Control System",
  };
  return labels[module] || module.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

const columnConfig = {
  view: { label: "View Access", icon: Eye, description: "Can view and read records", color: "text-blue-500" },
  create: { label: "Create New", icon: Plus, description: "Can create new records", color: "text-green-500" },
  update: { label: "Edit / Update", icon: Pencil, description: "Can modify existing records", color: "text-amber-500" },
  delete: { label: "Delete", icon: Trash2, description: "Can delete records permanently", color: "text-red-500" },
};

const getShortDescription = (text?: string, maxLength = 70) => {
  if (!text) return "No description provided";
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

const getRoleIcon = (slug: string) => {
  switch (slug) {
    case "admin":
      return <Shield className="h-5 w-5" />;
    case "urban_greening":
      return <Lock className="h-5 w-5" />;
    case "government_emission":
      return <Key className="h-5 w-5" />;
    default:
      return <Users className="h-5 w-5" />;
  }
};

interface UserPublic {
  id: string;
  email: string;
  is_super_admin: boolean;
  created_at: string;
  profile?: {
    first_name: string;
    last_name: string;
  };
}

export function PermissionManagementNew() {
  const { token, isSuperAdmin } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [viewUsersDialogOpen, setViewUsersDialogOpen] = useState(false);
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false);
  const [removeAllUsersDialogOpen, setRemoveAllUsersDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

  // Fetch all permissions (flat list)
  const {
    data: allPermissions,
    isLoading: loadingPermissions,
    refetch: refetchPermissions,
  } = useQuery({
    queryKey: ["admin", "permissions-flat"],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/admin/permissions?grouped=false`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied. Super admin privileges required.");
        }
        throw new Error("Failed to fetch permissions");
      }
      return response.json() as Promise<Permission[]>;
    },
    enabled: isSuperAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes - permissions rarely change
  });

  // Fetch available roles
  const {
    data: availableRoles,
    isLoading: loadingRoles,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      return response.json() as Promise<RoleSummary[]>;
    },
    enabled: isSuperAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });

  useEffect(() => {
    if (!availableRoles || availableRoles.length === 0) {
      return;
    }

    const hasSelected = selectedRole && availableRoles.some((role) => role.slug === selectedRole);
    if (!hasSelected) {
      setSelectedRole(availableRoles[0].slug);
    }
  }, [availableRoles, selectedRole]);

  // Fetch role permissions
  const {
    data: rolePermissions,
    isLoading: loadingRolePerms,
    refetch: refetchRolePermissions,
  } = useQuery({
    queryKey: ["admin", "roles", selectedRole, "permissions"],
    queryFn: async () => {
      if (!selectedRole) {
        return Promise.reject(new Error("No role selected"));
      }
      const response = await fetch(
        `${apiUrl}/admin/roles/${selectedRole}/permissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch role permissions");
      return response.json() as Promise<RolePermissions>;
    },
    enabled: isSuperAdmin && Boolean(selectedRole),
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });

  // Fetch users by role
  const {
    data: roleUsers,
    isLoading: loadingRoleUsers,
    refetch: refetchRoleUsers,
  } = useQuery({
    queryKey: ["admin", "roles", selectedRole, "users"],
    queryFn: async () => {
      if (!selectedRole) {
        return Promise.reject(new Error("No role selected"));
      }
      const response = await fetch(
        `${apiUrl}/admin/roles/${selectedRole}/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch role users");
      return response.json() as Promise<UserPublic[]>;
    },
    enabled: isSuperAdmin && viewUsersDialogOpen && Boolean(selectedRole),
    staleTime: 60 * 1000, // 1 minute - user role assignments change more frequently
  });

  const currentRole = selectedRole
    ? availableRoles?.find((role) => role.slug === selectedRole) ?? rolePermissions?.role
    : undefined;

  const totalPermissions = allPermissions?.length ?? 0;

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchPermissions(),
        refetchRoles(),
        refetchRolePermissions(),
        viewUsersDialogOpen ? refetchRoleUsers() : Promise.resolve(),
      ]);
      toast.success("Permissions refreshed");
    } catch (error) {
      toast.error("Failed to refresh permissions");
    } finally {
      setIsRefreshing(false);
    }
  }, [
    isRefreshing,
    refetchPermissions,
    refetchRoles,
    refetchRolePermissions,
    refetchRoleUsers,
    viewUsersDialogOpen,
  ]);

  useContextMenuAction("refresh", handleRefresh);

  // Assign permission to role
  const assignPermission = useMutation({
    mutationFn: async (permissionId: string) => {
      if (!selectedRole) {
        throw new Error("Select a role before assigning permissions");
      }
      const response = await fetch(
        `${apiUrl}/admin/roles/${selectedRole}/permissions/${permissionId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to assign permission");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "roles", selectedRole, "permissions"],
      });
      toast.success("Permission assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign permission: ${error.message}`);
    },
  });

  // Remove permission from role
  const removePermission = useMutation({
    mutationFn: async (permissionId: string) => {
      if (!selectedRole) {
        throw new Error("Select a role before removing permissions");
      }
      const response = await fetch(
        `${apiUrl}/admin/roles/${selectedRole}/permissions/${permissionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to remove permission");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "roles", selectedRole, "permissions"],
      });
      toast.success("Permission removed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove permission: ${error.message}`);
    },
  });

  const createRole = useMutation({
    mutationFn: async (payload: { displayName: string; description?: string }) => {
      const response = await fetch(`${apiUrl}/admin/roles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: payload.displayName,
          description: payload.description,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create role");
      }

      return response.json() as Promise<RoleSummary>;
    },
    onSuccess: (newRole) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
      toast.success(`Role ${newRole.display_name} created`);
      setCreateRoleDialogOpen(false);
      setNewRoleName("");
      setNewRoleDescription("");
      setSelectedRole(newRole.slug);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create role: ${error.message}`);
    },
  });

  const deleteRole = useMutation({
    mutationFn: async (roleSlug: string) => {
      const response = await fetch(`${apiUrl}/admin/roles/${roleSlug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to delete role");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
      toast.success("Role deleted successfully");
      setDeleteRoleDialogOpen(false);
      setSelectedRole(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete role: ${error.message}`);
    },
  });

  const removeRoleFromUser = useMutation({
    mutationFn: async ({ userId, roleSlug }: { userId: string; roleSlug: string }) => {
      const response = await fetch(`${apiUrl}/admin/users/${userId}/roles/${roleSlug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to remove role from user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles", selectedRole, "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Role removed from user");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove role: ${error.message}`);
    },
  });

  const removeRoleFromAllUsers = useMutation({
    mutationFn: async (roleSlug: string) => {
      if (!roleUsers || roleUsers.length === 0) {
        throw new Error("No users to remove role from");
      }

      // Remove role from all users sequentially
      const promises = roleUsers.map(user => 
        fetch(`${apiUrl}/admin/users/${user.id}/roles/${roleSlug}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles", selectedRole, "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Role removed from all users");
      setRemoveAllUsersDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove role from all users: ${error.message}`);
    },
  });

  const hasPermission = (permissionId: string) => {
    return rolePermissions?.permissions.some((p) => p.id === permissionId) ?? false;
  };

  const handlePermissionToggle = (permissionId: string, currentState: boolean) => {
    if (currentState) {
      removePermission.mutate(permissionId);
    } else {
      assignPermission.mutate(permissionId);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "view":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "update":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Group permissions by module and entity - optimize with useMemo
  const groupedPermissions = useMemo(() => {
    return allPermissions?.reduce((acc, permission) => {
      // Hide System Roles and Access Controls (Permission entity)
      if (permission.entity_type === 'role' || permission.entity_type === 'permission') {
        return acc;
      }

      if (!acc[permission.module_name]) {
        acc[permission.module_name] = {};
      }
      if (!acc[permission.module_name][permission.entity_type]) {
        acc[permission.module_name][permission.entity_type] = [];
      }
      acc[permission.module_name][permission.entity_type].push(permission);
      return acc;
    }, {} as Record<string, Record<string, Permission[]>>);
  }, [allPermissions]);

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col h-full page-bg">
        <div className="page-header-bg px-6 py-3">
             <h1 className="text-xl font-semibold">Permission Management</h1>
        </div>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. Super admin privileges required to manage permissions.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (loadingPermissions) {
    return (
      <div className="flex flex-col h-full page-bg">
        <div className="page-header-bg px-6 py-3">
             <h1 className="text-xl font-semibold">Permission Management</h1>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full page-bg">
      <div className="page-header-bg px-6 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Permission Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage role-based permissions and access control
            </p>
          </div>
          <RefreshButton
            onClick={handleRefresh}
            isLoading={isRefreshing}
            disabled={
              loadingPermissions ||
              loadingRoles ||
              loadingRolePerms ||
              loadingRoleUsers
            }
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <Card className="flex flex-col h-full border-none shadow-sm">
          <CardHeader className="flex-shrink-0 pb-4 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Role Permission Matrix</CardTitle>
                <CardDescription>
                  Select a role and toggle permissions on/off using the switches
                </CardDescription>
              </div>
              <Dialog open={viewUsersDialogOpen} onOpenChange={setViewUsersDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View Users ({roleUsers?.length ?? 0})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100">
                      Users with {currentRole?.display_name ?? "Selected"} Role
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-300">
                      List of all users currently assigned to this role
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[400px]">
                    {loadingRoleUsers ? (
                      <div className="text-center py-8">Loading...</div>
                    ) : roleUsers && roleUsers.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex justify-end px-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setRemoveAllUsersDialogOpen(true)}
                            disabled={removeRoleFromUser.isPending || removeRoleFromAllUsers.isPending}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove Role from All Users
                          </Button>
                        </div>
                        {roleUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">
                                {user.profile?.first_name} {user.profile?.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {user.is_super_admin && (
                                <Badge variant="destructive" title="Controlled by SUPER_ADMIN_EMAILS environment variable">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Super Admin
                                </Badge>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (selectedRole) {
                                    removeRoleFromUser.mutate({ userId: user.id, roleSlug: selectedRole });
                                  }
                                }}
                                disabled={removeRoleFromUser.isPending || removeRoleFromAllUsers.isPending}
                              >
                                {removeRoleFromUser.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserMinus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No users found with this role
                      </div>
                    )}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col pt-4 px-0">
              {/* Role Selector */}
              <div className="flex flex-col gap-3 px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {loadingRoles ? (
                      <div className="h-9 w-32 animate-pulse rounded-md bg-gray-200" />
                    ) : availableRoles && availableRoles.length > 0 ? (
                      availableRoles.map((role) => (
                        <Button
                          key={role.id}
                          variant={selectedRole === role.slug ? "default" : "outline"}
                          onClick={() => setSelectedRole(role.slug)}
                          className="flex items-center gap-2"
                        >
                          {getRoleIcon(role.slug)}
                          {role.display_name}
                        </Button>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No roles yet. Create one to get started.
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateRoleDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Role
                  </Button>
                </div>
              </div>

              {/* Role Permission Summary */}
              <div className="px-6 py-4">
                {loadingRoles || loadingRolePerms ? (
                  <div className="h-20 w-full animate-pulse rounded-lg bg-muted/60" />
                ) : currentRole && rolePermissions ? (
                  <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg flex-shrink-0 border dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(currentRole.slug)}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {currentRole.display_name}
                      </span>
                      {currentRole.is_system && (
                        <Badge variant="outline" className="text-xs">
                          System
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {rolePermissions.permissions.length} / {totalPermissions} permissions
                    </Badge>
                    <p className="text-sm text-muted-foreground max-w-xl flex-1">
                      {currentRole.description || "No description provided."}
                    </p>
                    {!currentRole.is_system && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteRoleDialogOpen(true)}
                        disabled={deleteRole.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Role
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border dark:border-gray-700 border-dashed p-4 text-sm text-muted-foreground">
                    Select or create a role to configure its permissions.
                  </div>
                )}
              </div>

              {/* Permissions Table */}
              <ScrollArea className="flex-1">
                <TooltipProvider>
                  <div className="space-y-8 px-6 pb-6">
                    {groupedPermissions &&
                      Object.entries(groupedPermissions).map(([moduleName, entities]) => (
                        <div key={moduleName} className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                            <div className="h-8 w-1 bg-primary rounded-full"></div>
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                              {getModuleLabel(moduleName)}
                            </h3>
                          </div>

                          <div className="rounded-md border dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                            <Table>
                              <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                                <TableRow>
                                  <TableHead className="w-[220px] pl-4">Permission Category</TableHead>
                                  <TableHead className="w-[280px]">Description</TableHead>
                                  {(Object.entries(columnConfig) as [string, typeof columnConfig.view][]).map(([key, config]) => {
                                      const Icon = config.icon;
                                      return (
                                        <TableHead key={key} className="text-center w-[120px]">
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="flex flex-col items-center justify-center gap-1 py-2 cursor-help group">
                                                <Icon className={`h-4 w-4 ${config.color} group-hover:scale-110 transition-transform`} />
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{config.label}</span>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{config.description}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TableHead>
                                      );
                                  })}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.entries(entities).map(([entityType, permissions], index) => {
                                  const permissionsByAction = permissions.reduce((acc, perm) => {
                                    acc[perm.action] = perm;
                                    return acc;
                                  }, {} as Record<string, Permission>);

                                  const isPending = assignPermission.isPending || removePermission.isPending;

                                  const summaryDescription = getShortDescription(
                                    permissionsByAction.view?.description || permissions[0]?.description
                                  );

                                  return (
                                    <TableRow
                                      key={entityType}
                                      className={`hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/30 dark:bg-gray-800/30"}`}
                                    >
                                      <TableCell className="font-medium text-gray-700 dark:text-gray-200 pl-4">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                          {getEntityLabel(entityType)}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground align-top">
                                        {summaryDescription}
                                      </TableCell>
                                      {["view", "create", "update", "delete"].map((action) => {
                                        if (action === "view" && (entityType === "role" || entityType === "permission")) {
                                          return (
                                            <TableCell key={action} className="text-center p-2">
                                              <div className="flex justify-center">
                                                <span className="text-xs text-muted-foreground italic">Restricted</span>
                                              </div>
                                            </TableCell>
                                          );
                                        }

                                        const permission = permissionsByAction[action];

                                        if (!permission) {
                                          return (
                                            <TableCell key={action} className="text-center">
                                              <div className="flex justify-center opacity-20">
                                                <div className="h-1 w-4 bg-gray-400 rounded-full"></div>
                                              </div>
                                            </TableCell>
                                          );
                                        }

                                        const isAssigned = hasPermission(permission.id);

                                        return (
                                          <TableCell key={action} className="text-center p-2">
                                            <div className="flex flex-col items-center gap-2">
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <div>
                                                    <Switch
                                                      checked={isAssigned}
                                                      onCheckedChange={() => handlePermissionToggle(permission.id, isAssigned)}
                                                      disabled={isPending}
                                                    />
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>{permission.description || "No description provided"}</p>
                                                </TooltipContent>
                                              </Tooltip>
                                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${getActionColor(action)}`}>
                                                {action.toUpperCase()}
                                              </span>
                                            </div>
                                          </TableCell>
                                        );
                                      })}
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ))}
                  </div>
                </TooltipProvider>
              </ScrollArea>
            </CardContent>
          </Card>
      </div>

      {/* Create Role Dialog */}
      <Dialog open={createRoleDialogOpen} onOpenChange={setCreateRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Create New Role</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Create a custom role with specific permissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g., Data Analyst"
              />
            </div>

            <div>
              <Label htmlFor="role-description">Description (Optional)</Label>
              <Textarea
                id="role-description"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="Describe the purpose of this role..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCreateRoleDialogOpen(false);
                setNewRoleName("");
                setNewRoleDescription("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newRoleName.trim()) {
                  toast.error("Role name is required");
                  return;
                }
                createRole.mutate({
                  displayName: newRoleName,
                  description: newRoleDescription || undefined,
                });
              }}
              disabled={createRole.isPending || !newRoleName.trim()}
            >
              {createRole.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation Dialog */}
      <AlertDialog open={deleteRoleDialogOpen} onOpenChange={setDeleteRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Delete Role</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete the role "{currentRole?.display_name}"?
              {roleUsers && roleUsers.length > 0 ? (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: This role is currently assigned to {roleUsers.length} user(s). 
                  Please remove the role from all users before deleting it.
                </span>
              ) : (
                <span className="block mt-2">
                  This action cannot be undone. The role and all its permission assignments will be permanently deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedRole) {
                  deleteRole.mutate(selectedRole);
                }
              }}
              disabled={deleteRole.isPending || (roleUsers && roleUsers.length > 0)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteRole.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Role from All Users Confirmation Dialog */}
      <AlertDialog open={removeAllUsersDialogOpen} onOpenChange={setRemoveAllUsersDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Remove Role from All Users</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Are you sure you want to remove the "{currentRole?.display_name}" role from all {roleUsers?.length ?? 0} user(s)?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedRole) {
                  removeRoleFromAllUsers.mutate(selectedRole);
                }
              }}
              disabled={removeRoleFromAllUsers.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeRoleFromAllUsers.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remove from All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
