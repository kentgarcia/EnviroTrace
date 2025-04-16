import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataChart } from "@/components/dashboard/DataChart";
import { AlertCircle, ArrowRight, Cloud, CloudLightning, CloudRain, Droplets, Thermometer } from "lucide-react";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";

const airQualityData = [
  { name: "Jan", pm25: 35, pm10: 50, no2: 40 },
  { name: "Feb", pm25: 28, pm10: 48, no2: 38 },
  { name: "Mar", pm25: 42, pm10: 61, no2: 52 },
  { name: "Apr", pm25: 30, pm10: 55, no2: 45 },
  { name: "May", pm25: 25, pm10: 40, no2: 32 },
  { name: "Jun", pm25: 22, pm10: 38, no2: 30 },
  { name: "Jul", pm25: 20, pm10: 37, no2: 28 },
  { name: "Aug", pm25: 24, pm10: 40, no2: 31 },
  { name: "Sep", pm25: 28, pm10: 45, no2: 36 },
  { name: "Oct", pm25: 32, pm10: 50, no2: 41 },
  { name: "Nov", pm25: 38, pm10: 57, no2: 46 },
  { name: "Dec", pm25: 40, pm10: 59, no2: 48 }
];

const hourlyData = [
  { name: "00:00", aqi: 32 },
  { name: "02:00", aqi: 30 },
  { name: "04:00", aqi: 26 },
  { name: "06:00", aqi: 28 },
  { name: "08:00", aqi: 45 },
  { name: "10:00", aqi: 55 },
  { name: "12:00", aqi: 58 },
  { name: "14:00", aqi: 52 },
  { name: "16:00", aqi: 48 },
  { name: "18:00", aqi: 50 },
  { name: "20:00", aqi: 42 },
  { name: "22:00", aqi: 38 }
];

const stationData = [
  { name: "Downtown", avg: 58, max: 72 },
  { name: "Suburbs", avg: 42, max: 55 },
  { name: "Industrial", avg: 65, max: 80 },
  { name: "Waterfront", avg: 38, max: 50 },
  { name: "Airport", avg: 60, max: 75 }
];

export default function AirQualityOverview() {
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
        <AppSidebar dashboardType="air-quality" />
        <div className="flex-1 overflow-auto">
        <DashboardNavbar dashboardTitle="Air Quality Dashboard" />
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">Air Quality Dashboard</h1>
              <p className="text-muted-foreground">{formatDate(currentTime)}</p>
            </header>

            <section>
              <h2 className="text-xl font-semibold mb-4">Current Air Quality Status</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Air Quality Index"
                  value="58"
                  description="Moderate"
                  icon={Cloud}
                  trend="up"
                  trendValue="+3 from yesterday"
                />
                <StatCard
                  title="PM2.5"
                  value="35 μg/m³"
                  description="Above WHO guidelines"
                  icon={AlertCircle}
                  trend="down"
                  trendValue="-2 from yesterday"
                />
                <StatCard
                  title="Temperature"
                  value="26°C"
                  description="Feeling warmer"
                  icon={Thermometer}
                  trend="up"
                  trendValue="+2°C from yesterday"
                />
                <StatCard
                  title="Humidity"
                  value="65%"
                  description="Moderate humidity"
                  icon={Droplets}
                  trend="neutral"
                  trendValue="Same as yesterday"
                />
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <DataChart
                title="Pollutant Trends (2025)"
                description="Monthly average concentrations in μg/m³"
                data={airQualityData}
                type="line"
                dataKeys={["pm25", "pm10", "no2"]}
              />
              <DataChart
                title="Today's Air Quality Index"
                description="Hourly readings for the past 24 hours"
                data={hourlyData}
                type="bar"
                dataKeys={["aqi"]}
                colors={["#2E88C0"]}
              />
            </section>

            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Monitoring Stations</h2>
                <button className="text-ems-blue-600 text-sm font-medium flex items-center hover:text-ems-blue-800">
                  View all stations <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DataChart
                  title="Station AQI Comparison"
                  description="Average and peak values"
                  data={stationData}
                  type="bar"
                  dataKeys={["avg", "max"]}
                  colors={["#2E88C0", "#E53E3E"]}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
