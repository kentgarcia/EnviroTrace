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
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";

// Request type data for pie chart
const requestTypeData = [
  { name: "Tree Cutting", value: 46, percentage: "48.4%" },
  { name: "Pruning", value: 47, percentage: "49.5%" },
  { name: "Violations/Complaints", value: 2, percentage: "2.1%" }
];

// Request status data for pie chart
const requestStatusData = [
  { name: "Filed", value: 25, percentage: "75.8%" },
  { name: "On Hold", value: 1, percentage: "3.0%" },
  { name: "For Signature", value: 1, percentage: "3.0%" },
  { name: "Payment and Pick-Up", value: 6, percentage: "18.2%" }
];

// Tree species data for bar chart
const treeSpeciesData = [
  { name: "Indian Tree", count: 30 },
  { name: "Cotton Tree", count: 25 },
  { name: "Mango Tree", count: 24 },
  { name: "Narra Tree", count: 17 },
  { name: "Mahogany", count: 15 },
  { name: "Fire Tree", count: 10 },
  { name: "Santol Tree", count: 8 },
  { name: "Acacia Tree", count: 7 },
  { name: "Other Trees", count: 15 }
];

// Flora data for urban greening
const floraData = [
  { name: "Bougainvillea", count: 115 },
  { name: "Eugenia", count: 113 },
  { name: "Kalachuchi", count: 50 },
  { name: "Indian Tree", count: 45 },
  { name: "Palm Tree", count: 13 },
  { name: "Caballero", count: 14 },
  { name: "Coconut Tree", count: 10 }
];

// Monthly fees collected data
const monthlyFeesData = [
  { name: "Jan", fees: 120000 },
  { name: "Feb", fees: 416000 },
  { name: "Mar", fees: 10000 },
  { name: "Apr", fees: 45000 },
  { name: "May", fees: 38000 },
  { name: "Jun", fees: 0 },
  { name: "Jul", fees: 0 },
  { name: "Aug", fees: 0 },
  { name: "Sep", fees: 0 },
  { name: "Oct", fees: 0 },
  { name: "Nov", fees: 0 },
  { name: "Dec", fees: 0 }
];

// Late payment data
const latePaymentData = [
  { name: "Jan", fees: 11500 },
  { name: "Feb", fees: 1000 },
  { name: "Mar", fees: 0 },
  { name: "Apr", fees: 0 },
  { name: "May", fees: 0 },
  { name: "Jun", fees: 0 },
  { name: "Jul", fees: 0 },
  { name: "Aug", fees: 0 },
  { name: "Sep", fees: 0 },
  { name: "Oct", fees: 0 },
  { name: "Nov", fees: 0 },
  { name: "Dec", fees: 0 }
];

// Plant Saplings Collected data
const plantSaplingsData = [
  { month: "Jan", count: 420 },
  { month: "Feb", count: 1952 },
  { month: "Dec", count: 0 }
];

// Urban Greening Plants data
const urbanGreeningData = [
  { month: "Jan", count: 137 },
  { month: "Feb", count: 306 },
  { month: "Dec", count: 0 }
];

// Urban Greening Breakdown data
const urbanGreeningBreakdownData = [
  { name: "Ornamentals", value: 316, percentage: "71.3%" },
  { name: "Seeds", value: 54, percentage: "12.2%" },
  { name: "Trees", value: 53, percentage: "12.0%" },
  { name: "Seeds (private)", value: 20, percentage: "4.5%" }
];

// Recent tree management requests data
const recentRequestsData = [
  {
    id: "1",
    date: "02/21/25",
    inspector: "Rhaya",
    requestNo: "1",
    name: "Lagundino, J.",
    request: "Tree Cutting",
    location: "Biazon Rd, Taguig",
    status: "Pending",
    fees: "-",
    statusCode: "pending"
  },
  {
    id: "2",
    date: "02/15/25",
    inspector: "Agravante",
    requestNo: "2",
    name: "De Leon, M.",
    request: "Pruning",
    location: "Cayetano Blvd",
    status: "Approved",
    fees: "₱4,500",
    statusCode: "approved"
  },
  {
    id: "3",
    date: "02/10/25",
    inspector: "Bautista",
    requestNo: "3",
    name: "Santos, F.",
    request: "Tree Cutting",
    location: "McKinley Hill",
    status: "Completed",
    fees: "₱7,200",
    statusCode: "completed"
  },
  {
    id: "4",
    date: "02/05/25",
    inspector: "Mendoza",
    requestNo: "4",
    name: "Reyes, A.",
    request: "Pruning",
    location: "C5 Road",
    status: "For Signature",
    fees: "₱3,800",
    statusCode: "signature"
  }
];

export default function TreeManagementOverview() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState("JANUARY 2025");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "signature":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-100">
        <AppSidebar dashboardType="tree-management" />
        <div className="flex-1 overflow-auto">
          <DashboardNavbar />
          <div className="p-6">
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">DATA SUMMARY</h2>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">KEY METRICS & STATISTICS</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8">
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-4">January 2025</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="rounded-lg bg-green-100 p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium mb-1">Pending Applications</p>
                        <p className="text-3xl font-bold">32</p>
                      </div>
                      <div className="h-10 w-10 rounded-md bg-green-600 text-white flex items-center justify-center">
                        <FileText className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-yellow-100 p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium mb-1">Ongoing Inspections</p>
                        <p className="text-3xl font-bold">100</p>
                      </div>
                      <div className="h-10 w-10 rounded-md bg-yellow-600 text-white flex items-center justify-center">
                        <FileText className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-red-100 p-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium mb-1">Total Trees Cut</p>
                          <p className="text-3xl font-bold">67</p>
                          <div className="flex items-center mt-1">
                            <Badge className="bg-red-200 text-red-800 mr-1">+28.80%</Badge>
                            <span className="text-xs text-gray-500">from last month</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-md bg-red-600 text-white flex items-center justify-center">
                        <TreePine className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Tree Cutting Applications</h3>
                  <DataChart
                    title=""
                    data={requestTypeData}
                    type="pie"
                    dataKeys={["value"]}
                    colors={["#4589FF", "#44BC66", "#FF5C5C", "#FFBB33"]}
                  />
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Inspection and Clearance Progress</h3>
                  <div className="h-[300px]">
                    <DataChart
                      title=""
                      data={monthlyFeesData}
                      type="line"
                      dataKeys={["fees"]}
                      colors={["#4589FF", "#44BC66", "#FF5C5C"]}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-xl font-bold">RECENT TREE MANAGEMENT REQUESTS</h2>
                  <p className="text-xs text-gray-500">FOR THE MONTH OF {currentMonth}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-center w-10">#</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Request</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRequestsData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-center font-medium">{row.requestNo}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.inspector}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.request}</TableCell>
                        <TableCell>{row.location}</TableCell>
                        <TableCell>
                          <Badge className={cn("font-normal", getStatusColor(row.statusCode))}>
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.fees}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Plant Saplings Collected (Replacements) 2025</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plantSaplingsData.map((row) => (
                        <TableRow key={row.month}>
                          <TableCell>{row.month}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Urban Greening (Number of Ornamental Plant and Trees Planted)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {urbanGreeningData.map((row) => (
                        <TableRow key={row.month}>
                          <TableCell>{row.month}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            <section className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Urban Greening (Breakdown)</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataChart
                    title=""
                    data={urbanGreeningBreakdownData}
                    type="pie"
                    dataKeys={["value"]}
                    colors={["#4589FF", "#44BC66", "#FF5C5C", "#FFBB33"]}
                  />
                </CardContent>
              </Card>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <DataChart
                title="Tree Cutting/Pruning/Ball-out Requests 2025"
                description="Distribution of request types"
                data={requestTypeData}
                type="pie"
                dataKeys={["value"]}
                colors={["#4589FF", "#FF5C5C", "#FFBB33"]}
              />
              <DataChart
                title="Status of Tree Cutting/Pruning/Ball-out Clearance 2025"
                description="Current status of requests"
                data={requestStatusData}
                type="pie"
                dataKeys={["value"]}
                colors={["#4589FF", "#FF5C5C", "#FFBB33", "#44BC66"]}
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly 2025 Collected Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <DataChart
                      title=""
                      data={monthlyFeesData}
                      type="bar"
                      dataKeys={["fees"]}
                      colors={["#44BC66"]}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Late Payment of Clearance (2024)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <DataChart
                      title=""
                      data={latePaymentData}
                      type="bar"
                      dataKeys={["fees"]}
                      colors={["#FF5C5C"]}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Trees to be Cut Down/Prune</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <DataChart
                      title=""
                      data={treeSpeciesData}
                      type="bar"
                      dataKeys={["count"]}
                      colors={["#4589FF"]}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Flora Data (Urban Greening)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <DataChart
                      title=""
                      data={floraData}
                      type="bar"
                      dataKeys={["count"]}
                      colors={["#44BC66"]}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Activities</h2>
                <button className="text-ems-green-600 text-sm font-medium flex items-center hover:text-ems-green-800">
                  View all activities <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Recent Tree Management Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Tree Cutting Request #TM-2025-042</p>
                          <p className="text-sm text-muted-foreground">Approved on April 8, 2025</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Pruning Request #TM-2025-041</p>
                          <p className="text-sm text-muted-foreground">Filed on April 5, 2025</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Tree Inspection #TM-2025-040</p>
                          <p className="text-sm text-muted-foreground">Completed on April 3, 2025</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Tree Cutting Request #TM-2025-039</p>
                          <p className="text-sm text-muted-foreground">Approved on April 1, 2025</p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
