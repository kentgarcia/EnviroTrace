import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Switch } from "@/presentation/components/shared/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/shared/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/presentation/components/shared/ui/table";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { ScrollArea } from "@/presentation/components/shared/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/presentation/components/shared/ui/dialog";
import { Shield, Users, Key, Lock, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/integrations/types/userData";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { Alert, AlertDescription } from "@/presentation/components/shared/ui/alert";

interface Permission {
  id: string;
  name: string;
  description: string;
  module_name: string;
  entity_type: string;
  action: string;
}

interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

interface RoleInfo {
  name: UserRole;
  displayName: string;
  description: string;
  icon: React.ReactNode;
}

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

const roleInfoMap: Record<UserRole, RoleInfo> = {
  admin: {
    name: "admin",
    displayName: "Administrator",
    description: "Full system access and user management",
    icon: <Shield className="h-5 w-5" />,
  },
  urban_greening: {
    name: "urban_greening",
    displayName: "Urban Greening",
    description: "Tree inventory and urban forestry management",
    icon: <Lock className="h-5 w-5" />,
  },
  government_emission: {
    name: "government_emission",
    displayName: "Government Emission",
    description: "Vehicle emission tracking and testing management",
    icon: <Key className="h-5 w-5" />,
  },
};

export function PermissionManagementNew() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [viewUsersDialogOpen, setViewUsersDialogOpen] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

  // Check if user is superadmin
  const isSuperAdmin = user?.is_super_admin ?? false;

  // Fetch all permissions (flat list)
  const { data: allPermissions, isLoading: loadingPermissions } = useQuery({
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
  });

  // Fetch role permissions
  const { data: rolePermissions, isLoading: loadingRolePerms } = useQuery({
    queryKey: ["admin", "roles", selectedRole, "permissions"],
    queryFn: async () => {
      const response = await fetch(
        `${apiUrl}/admin/roles/${selectedRole}/permissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch role permissions");
      return response.json() as Promise<RolePermissions>;
    },
    enabled: isSuperAdmin,
  });

  // Fetch users by role
  const { data: roleUsers, isLoading: loadingRoleUsers } = useQuery({
    queryKey: ["admin", "roles", selectedRole, "users"],
    queryFn: async () => {
      const response = await fetch(
        `${apiUrl}/admin/roles/${selectedRole}/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch role users");
      return response.json() as Promise<UserPublic[]>;
    },
    enabled: isSuperAdmin && viewUsersDialogOpen,
  });

  // Assign permission to role
  const assignPermission = useMutation({
    mutationFn: async (permissionId: string) => {
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

  const hasPermission = (permissionId: string) => {
    return rolePermissions?.permissions.some((p) => p.id === permissionId);
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

  // Group permissions by module and entity
  const groupedPermissions = allPermissions?.reduce((acc, permission) => {
    if (!acc[permission.module_name]) {
      acc[permission.module_name] = {};
    }
    if (!acc[permission.module_name][permission.entity_type]) {
      acc[permission.module_name][permission.entity_type] = [];
    }
    acc[permission.module_name][permission.entity_type].push(permission);
    return acc;
  }, {} as Record<string, Record<string, Permission[]>>);

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Super admin privileges required to manage permissions.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loadingPermissions) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
        <p className="text-muted-foreground">
          Manage role-based permissions and access control (Super Admin Only)
        </p>
      </div>

      <Tabs defaultValue="permissions" className="flex-1 flex flex-col overflow-hidden">
        <TabsList>
          <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
          <TabsTrigger value="roles">Role Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="flex-1 overflow-hidden space-y-4">
          <Card className="flex flex-col h-full">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Role Permission Matrix</CardTitle>
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
                      <DialogTitle>
                        Users with {roleInfoMap[selectedRole].displayName} Role
                      </DialogTitle>
                      <DialogDescription>
                        List of all users currently assigned to this role
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[400px]">
                      {loadingRoleUsers ? (
                        <div className="text-center py-8">Loading...</div>
                      ) : roleUsers && roleUsers.length > 0 ? (
                        <div className="space-y-2">
                          {roleUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">
                                  {user.profile?.first_name} {user.profile?.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                              {user.is_super_admin && (
                                <Badge variant="destructive">Super Admin</Badge>
                              )}
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
            <CardContent className="flex-1 overflow-hidden flex flex-col space-y-4">
              {/* Role Selector */}
              <div className="flex gap-2 flex-shrink-0">
                {Object.values(roleInfoMap).map((roleInfo) => (
                  <Button
                    key={roleInfo.name}
                    variant={selectedRole === roleInfo.name ? "default" : "outline"}
                    onClick={() => setSelectedRole(roleInfo.name)}
                    className="flex items-center gap-2"
                  >
                    {roleInfo.icon}
                    {roleInfo.displayName}
                  </Button>
                ))}
              </div>

              {/* Role Permission Summary */}
              {rolePermissions && !loadingRolePerms && (
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {roleInfoMap[selectedRole].icon}
                    <span className="font-medium">
                      {roleInfoMap[selectedRole].displayName}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {rolePermissions.permissions.length} / {allPermissions?.length ?? 0} permissions
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {roleInfoMap[selectedRole].description}
                  </p>
                </div>
              )}

              {/* Permissions Table */}
              <ScrollArea className="flex-1">
                <div className="space-y-6 pr-4">
                  {groupedPermissions &&
                    Object.entries(groupedPermissions).map(([moduleName, entities]) => (
                      <div key={moduleName} className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b sticky top-0 bg-background">
                          <h3 className="font-semibold capitalize text-lg">
                            {moduleName.replace("_", " ")} Module
                          </h3>
                        </div>

                        {Object.entries(entities).map(([entityType, permissions]) => (
                          <div key={entityType} className="ml-4">
                            <h4 className="text-sm font-medium text-muted-foreground capitalize mb-2">
                              {entityType.replace("_", " ")}
                            </h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[200px]">Permission</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="w-[100px]">Action</TableHead>
                                  <TableHead className="w-[80px] text-center">Enabled</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {permissions.map((permission) => {
                                  const isAssigned = hasPermission(permission.id);
                                  const isPending =
                                    assignPermission.isPending || removePermission.isPending;

                                  return (
                                    <TableRow key={permission.id}>
                                      <TableCell className="font-mono text-xs">
                                        {permission.name}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {permission.description}
                                      </TableCell>
                                      <TableCell>
                                        <Badge className={getActionColor(permission.action)}>
                                          {permission.action}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Switch
                                          checked={isAssigned}
                                          onCheckedChange={() =>
                                            handlePermissionToggle(permission.id, isAssigned)
                                          }
                                          disabled={isPending || loadingRolePerms}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="flex-1 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Role Overview</CardTitle>
              <CardDescription>
                Summary of all available roles and their permission counts
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.values(roleInfoMap).map((roleInfo) => {
                  const rolePerms = rolePermissions?.role === roleInfo.name 
                    ? rolePermissions.permissions.length 
                    : 0;
                  
                  return (
                    <Card key={roleInfo.name}>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          {roleInfo.icon}
                          <CardTitle className="text-lg">{roleInfo.displayName}</CardTitle>
                        </div>
                        <CardDescription className="text-sm">
                          {roleInfo.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Permissions</span>
                            <Badge variant="secondary">
                              {selectedRole === roleInfo.name 
                                ? `${rolePerms} / ${allPermissions?.length ?? 0}` 
                                : "Click to load"}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setSelectedRole(roleInfo.name)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Manage Permissions
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => {
                              setSelectedRole(roleInfo.name);
                              setViewUsersDialogOpen(true);
                            }}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            View Users
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
