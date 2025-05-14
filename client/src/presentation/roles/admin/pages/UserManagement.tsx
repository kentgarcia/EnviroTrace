import { AppSidebar } from "@/presentation/components/shared/layout/AppSidebar";
import { SidebarProvider } from "@/presentation/components/shared/ui/sidebar";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
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
  Search,
} from "lucide-react";
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
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/presentation/components/shared/ui/badge";

// Sample user data
const userData = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Administrator",
    department: "IT",
    status: "active",
    lastLogin: "2025-02-21T08:30:00",
    date: "2025-02-21", // Added this field to satisfy the Record type
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Manager",
    department: "Environmental",
    status: "active",
    lastLogin: "2025-02-20T14:45:00",
    date: "2025-02-20", // Added this field to satisfy the Record type
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    role: "Inspector",
    department: "Field Operations",
    status: "active",
    lastLogin: "2025-02-19T09:15:00",
    date: "2025-02-19", // Added this field to satisfy the Record type
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "Data Analyst",
    department: "Research",
    status: "inactive",
    lastLogin: "2025-01-15T11:20:00",
    date: "2025-01-15", // Added this field to satisfy the Record type
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    role: "Technician",
    department: "Maintenance",
    status: "pending",
    lastLogin: "2025-02-18T16:10:00",
    date: "2025-02-18", // Added this field to satisfy the Record type
  },
];

// User activity data
const userActivityData = [
  {
    id: "1",
    user: "John Doe",
    action: "Created new inspection report",
    timestamp: "2025-02-21T08:35:00",
    details: "Report #INS-2025-042",
  },
  {
    id: "2",
    user: "Jane Smith",
    action: "Approved tree cutting request",
    timestamp: "2025-02-20T15:10:00",
    details: "Request #TM-2025-039",
  },
  {
    id: "3",
    user: "Robert Johnson",
    action: "Updated user profile",
    timestamp: "2025-02-19T09:30:00",
    details: "Profile ID #USR-005",
  },
  {
    id: "4",
    user: "Emily Davis",
    action: "Generated monthly report",
    timestamp: "2025-02-18T14:25:00",
    details: "February 2025 Summary",
  },
];

// Role distribution data for pie chart
const roleDistributionData = [
  { name: "Administrators", value: 3 },
  { name: "Managers", value: 5 },
  { name: "Inspectors", value: 12 },
  { name: "Data Analysts", value: 7 },
  { name: "Technicians", value: 8 },
];

// Department distribution data for pie chart
const departmentDistributionData = [
  { name: "IT", value: 6 },
  { name: "Environmental", value: 10 },
  { name: "Field Operations", value: 15 },
  { name: "Research", value: 8 },
  { name: "Maintenance", value: 6 },
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
  { name: "Dec", count: 0 },
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
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
                  <h1 className="text-2xl font-bold text-gray-900">
                    ENVIRONMENTAL MANAGEMENT
                  </h1>
                  <p className="text-sm text-gray-500">
                    User Management System
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search here..."
                      className="pl-10 h-10 w-full min-w-[240px] rounded-full bg-gray-100"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm">🔔</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <div className="hidden md:block">
                        <p className="text-sm font-medium">Elijah Santos</p>
                        <p className="text-xs text-gray-500">Admin</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                          <TableCell className="font-medium">
                            {activity.user}
                          </TableCell>
                          <TableCell>{activity.action}</TableCell>
                          <TableCell>{activity.details}</TableCell>
                          <TableCell>
                            {formatDate(activity.timestamp)}
                          </TableCell>
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
