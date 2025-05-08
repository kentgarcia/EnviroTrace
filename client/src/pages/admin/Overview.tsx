import { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  Users,
  Settings,
  Activity,
  Shield,
  Database,
  BarChart3,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const adminFeatures = [
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: <Users className="h-6 w-6" />,
      path: "/admin/user-management",
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings and preferences",
      icon: <Settings className="h-6 w-6" />,
      path: "/admin/settings",
    },
    {
      title: "Activity Logs",
      description: "View system activity and audit logs",
      icon: <Activity className="h-6 w-6" />,
      path: "/admin/logs",
    },
    {
      title: "Security",
      description: "Manage security settings and access controls",
      icon: <Shield className="h-6 w-6" />,
      path: "/admin/security",
    },
    {
      title: "Data Management",
      description: "Manage and backup system data",
      icon: <Database className="h-6 w-6" />,
      path: "/admin/data",
    },
    {
      title: "Analytics",
      description: "View system analytics and reports",
      icon: <BarChart3 className="h-6 w-6" />,
      path: "/admin/analytics",
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar dashboardType="admin" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your system settings and configurations
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {adminFeatures.map((feature) => (
                  <Card
                    key={feature.title}
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => navigate({ to: feature.path })}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {feature.title}
                      </CardTitle>
                      {feature.icon}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button>Manage Users</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button>Configure Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button>View Logs</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  );
}
