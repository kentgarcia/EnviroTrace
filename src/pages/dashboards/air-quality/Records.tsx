
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RecordTable } from "@/components/dashboard/RecordTable";

const airQualityRecords = [
  {
    id: "AQ001",
    name: "Downtown Air Quality Monitor",
    date: "2025-04-02",
    location: "Downtown",
    status: "active" as const,
    level: "Good (45 AQI)",
    updated: "2 hours ago"
  },
  {
    id: "AQ002",
    name: "Industrial Zone Monitor",
    date: "2025-04-02",
    location: "Industrial Zone",
    status: "active" as const,
    level: "Moderate (82 AQI)",
    updated: "3 hours ago"
  },
  {
    id: "AQ003",
    name: "Residential Area Monitor",
    date: "2025-04-01",
    location: "North Residential",
    status: "active" as const,
    level: "Good (38 AQI)",
    updated: "1 day ago"
  },
  {
    id: "AQ004",
    name: "School Zone Monitor",
    date: "2025-03-30",
    location: "Education District",
    status: "completed" as const,
    level: "Good (32 AQI)",
    updated: "3 days ago"
  },
  {
    id: "AQ005",
    name: "Park Area Monitor",
    date: "2025-03-25",
    location: "Central Park",
    status: "pending" as const,
    level: "Maintenance Required",
    updated: "1 week ago"
  },
];

const airQualityColumns = [
  { key: "id", title: "ID" },
  { key: "name", title: "Monitor Name" },
  { key: "date", title: "Reading Date" },
  { key: "location", title: "Location" },
  { key: "status", title: "Status" },
  { key: "level", title: "Air Quality Level" },
  { key: "updated", title: "Last Updated" }
];

export default function AirQualityRecords() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="air-quality" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">Air Quality Records</h1>
              <p className="text-muted-foreground">View and manage air quality monitoring records</p>
            </header>

            <section className="mb-8">
              <RecordTable 
                title="Air Quality Monitors" 
                records={airQualityRecords} 
                columns={airQualityColumns} 
              />
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
