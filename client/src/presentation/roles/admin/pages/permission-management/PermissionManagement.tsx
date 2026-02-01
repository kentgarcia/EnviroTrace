import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/shared/ui/tabs";
import { Shield, Users, Key, Lock } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/integrations/types/userData";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";

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

export function PermissionManagement() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

  // Fetch all permissions grouped
  const { data: allPermissions, isLoading: loadingPermissions, error: permissionsError } = useQuery({
    queryKey: ["admin", "permissions"],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/admin/permissions?grouped=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch permissions");
      return response.json();
    },
  });

  // Fetch role permissions
  const { data: rolePermissions, isLoading: loadingRolePerms, error: rolePermsError } = useQuery({
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

  const getModuleIcon = (moduleName: string) => {
    switch (moduleName) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "emission":
        return <Key className="h-4 w-4" />;
      case "urban_greening":
        return <Lock className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
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

  // Debug logging
  console.log("All Permissions Data:", allPermissions);
  console.log("Role Permissions Data:", rolePermissions);
  console.log("Selected Role:", selectedRole);

  if (permissionsError) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <h2 className="font-semibold">Error Loading Permissions</h2>
          <p>{(permissionsError as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
        <p className="text-muted-foreground">
          Manage role-based permissions and access control
        </p>
      </div>

      <Tabs defaultValue="role-permissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="role-permissions">Role Permissions</TabsTrigger>
          <TabsTrigger value="all-permissions">All Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="role-permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Role Permissions</CardTitle>
              <CardDescription>
                Select a role and click on permission badges to toggle them. 
                Active permissions are colored and show a checkmark (✓).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Role Selector */}
                <div className="flex gap-2">
                  <Button
                    variant={selectedRole === "admin" ? "default" : "outline"}
                    onClick={() => setSelectedRole("admin")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                  <Button
                    variant={
                      selectedRole === "urban_greening" ? "default" : "outline"
                    }
                    onClick={() => setSelectedRole("urban_greening")}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Urban Greening
                  </Button>
                  <Button
                    variant={
                      selectedRole === "government_emission" ? "default" : "outline"
                    }
                    onClick={() => setSelectedRole("government_emission")}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Government Emission
                  </Button>
                </div>

                {/* Role Permission Summary */}
                {rolePermissions && !loadingRolePerms && (
                  <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">
                      {selectedRole.replace("_", " ").toUpperCase()}
                    </span>
                    <Badge variant="secondary">
                      {rolePermissions.permissions.length} permissions
                    </Badge>
                  </div>
                )}

                {/* Permissions by Module */}
                {loadingRolePerms && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading permissions...</p>
                  </div>
                )}
                
                {!loadingRolePerms && allPermissions && Object.keys(allPermissions).length > 0 ? (
                  Object.entries(allPermissions).map(([moduleName, entities]: [string, any]) => (
                    <div key={moduleName} className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        {getModuleIcon(moduleName)}
                        <h3 className="font-semibold capitalize">
                          {moduleName.replace("_", " ")} Module
                        </h3>
                      </div>

                      {Object.entries(entities).map(([entityType, permissions]: [string, any]) => (
                        <div key={entityType} className="pl-6 space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground capitalize">
                            {entityType.replace("_", " ")}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(permissions) && permissions.map((permission: Permission) => {
                              const isAssigned = hasPermission(permission.id);
                              const isPending = 
                                assignPermission.isPending || 
                                removePermission.isPending;
                              
                              return (
                                <div
                                  key={permission.id}
                                  className="flex items-center gap-2"
                                >
                                  <Badge
                                    className={`cursor-pointer transition-all hover:scale-105 ${
                                      isAssigned
                                        ? getActionColor(permission.action)
                                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    } ${isPending ? 'opacity-50' : ''}`}
                                    onClick={() => {
                                      if (isPending) return;
                                      if (isAssigned) {
                                        removePermission.mutate(permission.id);
                                      } else {
                                        assignPermission.mutate(permission.id);
                                      }
                                    }}
                                    title={`Click to ${isAssigned ? 'remove' : 'add'} ${permission.name}`}
                                  >
                                    {permission.action}
                                    {isAssigned && " ✓"}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : !loadingRolePerms ? (
                  <div className="text-center py-8 border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">No permissions available</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Permissions</CardTitle>
              <CardDescription>
                Complete list of available permissions in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {allPermissions &&
                  Object.entries(allPermissions).map(([moduleName, entities]: [string, any]) => (
                    <div key={moduleName} className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        {getModuleIcon(moduleName)}
                        <h3 className="font-semibold capitalize">
                          {moduleName.replace("_", " ")} Module
                        </h3>
                      </div>

                      {Object.entries(entities).map(([entityType, permissions]: [string, any]) => (
                        <div key={entityType} className="pl-6 space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground capitalize">
                            {entityType.replace("_", " ")}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {permissions.map((permission: Permission) => (
                              <div
                                key={permission.id}
                                className="p-3 border rounded-lg space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <code className="text-xs font-mono">
                                    {permission.name}
                                  </code>
                                  <Badge className={getActionColor(permission.action)}>
                                    {permission.action}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
