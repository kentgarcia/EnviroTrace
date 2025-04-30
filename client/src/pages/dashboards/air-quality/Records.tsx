
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Download, Search, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const airQualityRecords = [
  {
    id: "AQ001",
    name: "Downtown Air Quality Monitor",
    date: "2025-04-02",
    location: "Downtown",
    status: "active",
    statusCode: "active",
    level: "Good (45 AQI)",
    updated: "2 hours ago"
  },
  {
    id: "AQ002",
    name: "Industrial Zone Monitor",
    date: "2025-04-02",
    location: "Industrial Zone",
    status: "Moderate",
    statusCode: "warning",
    level: "Moderate (82 AQI)",
    updated: "3 hours ago"
  },
  {
    id: "AQ003",
    name: "Residential Area Monitor",
    date: "2025-04-01",
    location: "North Residential",
    status: "Good",
    statusCode: "active",
    level: "Good (38 AQI)",
    updated: "1 day ago"
  },
  {
    id: "AQ004",
    name: "School Zone Monitor",
    date: "2025-03-30",
    location: "Education District",
    status: "Good",
    statusCode: "completed",
    level: "Good (32 AQI)",
    updated: "3 days ago"
  },
  {
    id: "AQ005",
    name: "Park Area Monitor",
    date: "2025-03-25",
    location: "Central Park",
    status: "Maintenance",
    statusCode: "pending",
    level: "Maintenance Required",
    updated: "1 week ago"
  },
];

export default function AirQualityRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMonth, setCurrentMonth] = useState("APRIL 2025");
  
  const filteredRecords = airQualityRecords.filter((record) => 
    Object.values(record).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-100">
        <AppSidebar dashboardType="air-quality" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">ENVIRONMENTAL MANAGEMENT</h1>
                  <p className="text-sm text-gray-500">Air Quality Monitoring System</p>
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

            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-xl font-bold">AIR QUALITY RECORDS</h2>
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
              
              <div className="flex justify-between items-center mb-4 mt-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search records..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button size="sm" className="shrink-0 ml-2">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add New
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-center w-10">ID</TableHead>
                      <TableHead>Monitor Name</TableHead>
                      <TableHead>Reading Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Air Quality Level</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="text-center font-medium">{record.id}</TableCell>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.location}</TableCell>
                          <TableCell>
                            <Badge className={cn("font-normal", getStatusColor(record.statusCode))}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.level}</TableCell>
                          <TableCell>{record.updated}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          No records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Air Quality Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-100 p-4 rounded-lg">
                    <h3 className="font-medium text-green-800">Good Air Quality</h3>
                    <p className="text-2xl font-bold text-green-800">3</p>
                    <p className="text-sm text-green-700">60% of monitored areas</p>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-lg">
                    <h3 className="font-medium text-yellow-800">Moderate Air Quality</h3>
                    <p className="text-2xl font-bold text-yellow-800">1</p>
                    <p className="text-sm text-yellow-700">20% of monitored areas</p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg">
                    <h3 className="font-medium text-red-800">Poor Air Quality</h3>
                    <p className="text-2xl font-bold text-red-800">0</p>
                    <p className="text-sm text-red-700">0% of monitored areas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Air Quality Readings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Last updated: April 10, 2025 at 10:30 AM
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Monitor</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>PM2.5</TableHead>
                      <TableHead>PM10</TableHead>
                      <TableHead>O3</TableHead>
                      <TableHead>SO2</TableHead>
                      <TableHead>NO2</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Downtown</TableCell>
                      <TableCell>10:00 AM</TableCell>
                      <TableCell>12 μg/m³</TableCell>
                      <TableCell>24 μg/m³</TableCell>
                      <TableCell>35 ppb</TableCell>
                      <TableCell>2 ppb</TableCell>
                      <TableCell>15 ppb</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Industrial Zone</TableCell>
                      <TableCell>10:15 AM</TableCell>
                      <TableCell>28 μg/m³</TableCell>
                      <TableCell>42 μg/m³</TableCell>
                      <TableCell>38 ppb</TableCell>
                      <TableCell>5 ppb</TableCell>
                      <TableCell>22 ppb</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Residential Area</TableCell>
                      <TableCell>10:30 AM</TableCell>
                      <TableCell>10 μg/m³</TableCell>
                      <TableCell>18 μg/m³</TableCell>
                      <TableCell>30 ppb</TableCell>
                      <TableCell>1 ppb</TableCell>
                      <TableCell>12 ppb</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
