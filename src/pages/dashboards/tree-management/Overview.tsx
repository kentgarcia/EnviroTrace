
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataChart } from "@/components/dashboard/DataChart";
import { ArrowRight, Leaf, MapPin, Ruler, TreePine } from "lucide-react";

const plantingData = [
  { name: "Jan", planted: 530, survived: 480 },
  { name: "Feb", planted: 620, survived: 550 },
  { name: "Mar", planted: 750, survived: 680 },
  { name: "Apr", planted: 820, survived: 760 },
  { name: "May", planted: 950, survived: 880 },
  { name: "Jun", planted: 850, survived: 800 },
  { name: "Jul", planted: 750, survived: 710 },
  { name: "Aug", planted: 680, survived: 640 },
  { name: "Sep", planted: 720, survived: 680 },
  { name: "Oct", planted: 800, survived: 740 },
  { name: "Nov", planted: 680, survived: 620 },
  { name: "Dec", planted: 550, survived: 490 }
];

const speciesData = [
  { name: "Oak", count: 3200 },
  { name: "Pine", count: 4500 },
  { name: "Maple", count: 2800 },
  { name: "Birch", count: 1900 },
  { name: "Willow", count: 1200 }
];

const regionData = [
  { name: "North", trees: 12500, area: 450 },
  { name: "South", trees: 9800, area: 380 },
  { name: "East", trees: 7600, area: 320 },
  { name: "West", trees: 10200, area: 420 },
  { name: "Central", trees: 15300, area: 520 }
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
              <h2 className="text-xl font-semibold mb-4">Forestry Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Total Trees"
                  value="65,438"
                  description="Across all regions"
                  icon={TreePine}
                  trend="up"
                  trendValue="+1,205 this year"
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
                  title="Covered Area"
                  value="2,450 ha"
                  description="Forest coverage"
                  icon={Ruler}
                  trend="up"
                  trendValue="+120 ha from last year"
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
                title="Tree Planting Performance (2025)"
                description="Monthly planting and survival rates"
                data={plantingData}
                type="line"
                dataKeys={["planted", "survived"]}
                colors={["#2EA04F", "#1F7A3C"]}
              />
              <DataChart
                title="Tree Species Distribution"
                description="Count of major tree species"
                data={speciesData}
                type="bar"
                dataKeys={["count"]}
                colors={["#4DBC6B"]}
              />
            </section>

            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Regional Distribution</h2>
                <button className="text-ems-green-600 text-sm font-medium flex items-center hover:text-ems-green-800">
                  View detailed map <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DataChart
                  title="Trees by Region"
                  description="Tree count and area covered by region"
                  data={regionData}
                  type="bar"
                  dataKeys={["trees", "area"]}
                  colors={["#2EA04F", "#8BBFE0"]}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
