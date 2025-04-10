import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataChart } from "@/components/dashboard/DataChart";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { 
  ArrowRight, 
  Leaf, 
  MapPin, 
  Ruler, 
  TreePine, 
  FileText, 
  Banknote,
  CalendarDays,
  Trees,
  Sprout,
  Filter,
  Download,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RecordTable } from "@/components/dashboard/RecordTable";

// Sample user data
const userData = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Administrator",
    department: "IT",
    status: "active",
    lastLogin: "2025-02-21T08:30:00"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Manager",
    department: "Environmental",
    status: "active",
    lastLogin: "2025-02-20T14:45:00"
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    role: "Inspector",
    department: "Field Operations",
    status: "active",
    lastLogin: "2025-02-19T09:15:00"
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "Data Analyst",
    department: "Research",
    status: "inactive",
    lastLogin: "2025-01-15T11:20:00"
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    role: "Technician",
    department: "Maintenance",
    status: "pending",
    lastLogin: "2025-02-18T16:10:00"
  }
];

// User activity data
const userActivityData = [
  {
    id: "1",
    user: "John Doe",
    action: "Created new inspection report",
    timestamp: "2025-02-21T08:35:00",
    details: "Report #INS-2025-042"
  },
  {
    id: "2",
    user: "Jane Smith",
    action: "Approved tree cutting request",
    timestamp: "2025-02-20T15:10:00",
    details: "Request #TM-2025-039"
  },
  {
    id: "3",
    user: "Robert Johnson",
    action: "Updated user profile",
    timestamp: "2025-02-19T09:30:00",
    details: "Profile ID #USR-005"
  },
  {
    id: "4",
    user: "Emily Davis",
    action: "Generated monthly report",
    timestamp: "2025-02-18T14:25:00",
    details: "February 2025 Summary"
  }
];

// Role distribution data for pie chart
const roleDistributionData = [
  { name: "Administrators", value: 3 },
  { name: "Managers", value: 5 },
  { name: "Inspectors", value: 12 },
  { name: "Data Analysts", value: 7 },
  { name: "Technicians", value: 8 }
];

// Department distribution data for pie chart
const departmentDistributionData = [
  { name: "IT", value: 6 },
  { name: "Environmental", value: 10 },
  { name: "Field Operations", value: 15 },
  { name: "Research", value: 8 },
  { name: "Maintenance", value: 6 }
];

// Monthly user activity data
const monthlyActivityData = [
  { name: "Jan", count: 245 },
  { name: "Feb", count: 388 },
  { name: "Mar", count: 470 },
  { name: "Apr", count: 520 },
  { name: "May", count: 430 },
  { name: "Jun", count: 380 },
  { name: "Jul", count: 0 },
  { name: "Aug", count: 0 },
  { name: "Sep", count: 0 },
  { name: "Oct", count: 0 },
  { name: "Nov", count: 0 },
  { name: "Dec", count: 0 }
];

export default function UserManagement() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="tree-management" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">User Management</h1>
              <p className="text-muted-foreground">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </header>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Total Users"
                  value="35"
                  description="Active system users"
                  icon={FileText}
                  trend="up"
                  trendValue="+3 this month"
                />
                <StatCard
                  title="Active Users"
                  value="28"
                  description="Currently active"
                  icon={FileText}
                  trend="neutral"
                  trendValue="80% of total"
                />
                <StatCard
                  title="New Users"
                  value="5"
                  description="Added this month"
                  icon={FileText}
                  trend="up"
                  trendValue="+2 from last month"
                />
                <StatCard
                  title="Inactive Users"
                  value="7"
                  description="Pending or disabled"
                  icon={FileText}
                  trend="down"
                  trendValue="-1 from last month"
                />
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <DataChart
                title="Role Distribution"
                description="Users by role type"
                data={roleDistributionData}
                type="pie"
                dataKeys={["value"]}
                colors={["#4589FF", "#44BC66", "#FF5C5C", "#FFBB33", "#6B7280"]}
              />
              <DataChart
                title="Department Distribution"
                description="Users by department"
                data={departmentDistributionData}
                type="pie"
                dataKeys={["value"]}
                colors={["#4589FF", "#44BC66", "#FF5C5C", "#FFBB33", "#6B7280"]}
              />
            </section>

            <section className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly User Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <DataChart
                      title=""
                      data={monthlyActivityData}
                      type="bar"
                      dataKeys={["count"]}
                      colors={["#44BC66"]}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mb-8">
              <RecordTable
                title="User Management"
                records={userData.map(user => ({
                  ...user,
                  lastLogin: formatDate(user.lastLogin)
                }))}
                columns={[
                  { key: "name", title: "Name" },
                  { key: "email", title: "Email" },
                  { key: "role", title: "Role" },
                  { key: "department", title: "Department" },
                  { key: "status", title: "Status" },
                  { key: "lastLogin", title: "Last Login" }
                ]}
              />
            </section>

            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent User Activity</h2>
                <button className="text-ems-green-600 text-sm font-medium flex items-center hover:text-ems-green-800">
                  View all activity <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userActivityData.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">{activity.user}</TableCell>
                          <TableCell>{activity.action}</TableCell>
                          <TableCell>{activity.details}</TableCell>
                          <TableCell>{formatDate(activity.timestamp)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
