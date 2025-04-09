
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataChart } from "@/components/dashboard/DataChart";
import { 
  ArrowRight, 
  Leaf, 
  MapPin, 
  Ruler, 
  TreePine, 
  FileText, 
  Banknote,
  CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function TreeManagementOverview() {
  const [currentTime, setCurrentTime] = useState(new Date());

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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="tree-management" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">Tree Management Dashboard</h1>
              <p className="text-muted-foreground">{formatDate(currentTime)}</p>
            </header>

            <section>
              <h2 className="text-xl font-semibold mb-4">Summary Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Number of Inspection Reports"
                  value="47"
                  description="Total for 2025"
                  icon={FileText}
                  trend="up"
                  trendValue="+5 from last month"
                />
                <StatCard
                  title="Fees Collected"
                  value="₱629,500"
                  description="Total for 2025"
                  icon={Banknote}
                  trend="up"
                  trendValue="+₱120,000 this month"
                />
                <StatCard
                  title="Tree Species"
                  value="42"
                  description="Diverse tree types"
                  icon={Leaf}
                  trend="up"
                  trendValue="+3 new species"
                />
                <StatCard
                  title="Managed Zones"
                  value="18"
                  description="Active management zones"
                  icon={MapPin}
                  trend="neutral"
                  trendValue="Same as last quarter"
                />
              </div>
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
