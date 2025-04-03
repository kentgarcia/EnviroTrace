
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RecordTable } from "@/components/dashboard/RecordTable";

const airQualityRecords = [
  {
    id: "AQR001",
    name: "Downtown Air Quality Report",
    date: "2025-04-01",
    location: "Downtown",
    status: "active",
    level: "Moderate",
    updated: "2 hours ago"
  },
  {
    id: "AQR002",
    name: "Industrial Zone Monitoring",
    date: "2025-03-30",
    location: "Industrial Park",
    status: "active",
    level: "Unhealthy",
    updated: "1 day ago"
  },
  {
    id: "AQR003",
    name: "Suburban Area Assessment",
    date: "2025-03-28",
    location: "North Suburbs",
    status: "completed",
    level: "Good",
    updated: "3 days ago"
  },
  {
    id: "AQR004",
    name: "School Zone Air Quality",
    date: "2025-03-25",
    location: "School District",
    status: "pending",
    level: "Moderate",
    updated: "1 week ago"
  },
  {
    id: "AQR005",
    name: "Hospital Area Analysis",
    date: "2025-03-20",
    location: "Medical Center",
    status: "completed",
    level: "Good",
    updated: "2 weeks ago"
  },
];

const airQualityColumns = [
  { key: "id", title: "ID" },
  { key: "name", title: "Name" },
  { key: "date", title: "Date" },
  { key: "location", title: "Location" },
  { key: "status", title: "Status" },
  { key: "level", title: "AQ Level" },
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
              <p className="text-muted-foreground">Manage and view air quality data records</p>
            </header>

            <section className="mb-8">
              <RecordTable 
                title="Air Quality Reports" 
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
