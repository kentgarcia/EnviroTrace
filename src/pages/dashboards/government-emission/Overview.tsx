
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataChart } from "@/components/dashboard/DataChart";
import { ArrowRight, Building, Factory, Loader2, Truck } from "lucide-react";

const emissionData = [
  { name: "Jan", co2: 1250, ch4: 320, n2o: 150 },
  { name: "Feb", co2: 1180, ch4: 300, n2o: 140 },
  { name: "Mar", co2: 1320, ch4: 350, n2o: 170 },
  { name: "Apr", co2: 1400, ch4: 370, n2o: 180 },
  { name: "May", co2: 1450, ch4: 390, n2o: 190 },
  { name: "Jun", co2: 1500, ch4: 410, n2o: 200 },
  { name: "Jul", co2: 1550, ch4: 420, n2o: 210 },
  { name: "Aug", co2: 1500, ch4: 400, n2o: 200 },
  { name: "Sep", co2: 1420, ch4: 380, n2o: 190 },
  { name: "Oct", co2: 1350, ch4: 360, n2o: 180 },
  { name: "Nov", co2: 1300, ch4: 340, n2o: 165 },
  { name: "Dec", co2: 1280, ch4: 330, n2o: 155 }
];

const facilityData = [
  { name: "City Hall", emissions: 450 },
  { name: "Water Treatment", emissions: 830 },
  { name: "Power Plant", emissions: 1250 },
  { name: "Transit Depot", emissions: 680 },
  { name: "Waste Management", emissions: 920 }
];

const reductionData = [
  { name: "2021", target: 2000, actual: 2100 },
  { name: "2022", target: 1850, actual: 1920 },
  { name: "2023", target: 1700, actual: 1750 },
  { name: "2024", target: 1550, actual: 1580 },
  { name: "2025", target: 1400, actual: 1420 }
];

export default function GovEmissionOverview() {
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
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">Government Emission Dashboard</h1>
              <p className="text-muted-foreground">{formatDate(currentTime)}</p>
            </header>

            <section>
              <h2 className="text-xl font-semibold mb-4">Emission Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Total CO2e"
                  value="15,420 tons"
                  description="Year to date"
                  icon={Factory}
                  trend="down"
                  trendValue="-8% from last year"
                />
                <StatCard
                  title="Facilities"
                  value="28"
                  description="Being monitored"
                  icon={Building}
                  trend="up"
                  trendValue="+2 new facilities"
                />
                <StatCard
                  title="Fleet Emissions"
                  value="3,250 tons"
                  description="From government vehicles"
                  icon={Truck}
                  trend="down"
                  trendValue="-5% from last year"
                />
                <StatCard
                  title="Carbon Intensity"
                  value="85 g/kWh"
                  description="Government operations"
                  icon={Loader2}
                  trend="down"
                  trendValue="-3 g/kWh from last year"
                />
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <DataChart
                title="Greenhouse Gas Emissions (2025)"
                description="Monthly breakdown by gas type (tons)"
                data={emissionData}
                type="line"
                dataKeys={["co2", "ch4", "n2o"]}
                colors={["#6B7280", "#4B5563", "#374151"]}
              />
              <DataChart
                title="Facility Emissions"
                description="Top emitting government facilities"
                data={facilityData}
                type="bar"
                dataKeys={["emissions"]}
                colors={["#6B7280"]}
              />
            </section>

            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Reduction Targets</h2>
                <button className="text-ems-blue-600 text-sm font-medium flex items-center hover:text-ems-blue-800">
                  View full report <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DataChart
                  title="Emission Reduction Progress"
                  description="Target vs. actual emissions (tons CO2e)"
                  data={reductionData}
                  type="bar"
                  dataKeys={["target", "actual"]}
                  colors={["#4B5563", "#6B7280"]}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
