import { useState } from "react";
import { AppSidebar } from "@/presentation/components/shared/layout/AppSidebar";
import { SidebarProvider } from "@/presentation/components/shared/ui/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/shared/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  Users,
  Settings,
  Activity,
  Shield,
  Database,
  BarChart3,
  Leaf,
  Car,
  Building,
  FileText,
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
      title: "Tree Management",
      description: "Manage urban greening and afforestation data",
      icon: <Leaf className="h-6 w-6" />,
      path: "/tree-management/overview",
    },
    {
      title: "Emission Control",
      description: "Monitor and manage government vehicle emissions",
      icon: <Car className="h-6 w-6" />,
      path: "/government-emission/overview",
    },
    {
      title: "Facility Management",
      description: "Track environmental compliance of government facilities",
      icon: <Building className="h-6 w-6" />,
      path: "/government-emission/offices",
    },
    {
      title: "Reports",
      description: "Generate and manage environmental reports",
      icon: <FileText className="h-6 w-6" />,
      path: "/admin/reports",
    },
    {
      title: "Data Management",
      description: "Manage and backup environmental data",
      icon: <Database className="h-6 w-6" />,
      path: "/admin/data",
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar dashboardType="admin" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Environmental Management System
            </h1>
            <p className="text-muted-foreground mt-2">
              Admin dashboard for managing environmental monitoring and
              compliance
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
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
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
                  <Button
                    onClick={() => navigate({ to: "/admin/user-management" })}
                  >
                    Manage Users
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance">
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      onClick={() =>
                        navigate({ to: "/government-emission/overview" })
                      }
                    >
                      View Emission Data
                    </Button>
                    <Button
                      onClick={() =>
                        navigate({ to: "/tree-management/overview" })
                      }
                    >
                      View Tree Management
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate({ to: "/admin/reports" })}>
                    Generate Reports
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  );
}
