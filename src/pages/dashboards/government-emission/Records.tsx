
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RecordTable } from "@/components/dashboard/RecordTable";

const emissionRecords = [
  {
    id: "GE001",
    name: "City Hall Energy Audit",
    date: "2025-04-02",
    facility: "City Hall",
    status: "active",
    emissions: "450 tons",
    updated: "Today"
  },
  {
    id: "GE002",
    name: "Water Treatment Plant Emissions",
    date: "2025-03-28",
    facility: "Water Treatment Plant",
    status: "active",
    emissions: "830 tons",
    updated: "3 days ago"
  },
  {
    id: "GE003",
    name: "Fleet Vehicle Emissions Report",
    date: "2025-03-25",
    facility: "Transportation Dept",
    status: "completed",
    emissions: "680 tons",
    updated: "1 week ago"
  },
  {
    id: "GE004",
    name: "Power Plant Quarterly Assessment",
    date: "2025-03-20",
    facility: "Main Power Plant",
    status: "pending",
    emissions: "1250 tons",
    updated: "10 days ago"
  },
  {
    id: "GE005",
    name: "Waste Management Facility Review",
    date: "2025-03-15",
    facility: "Waste Management",
    status: "completed",
    emissions: "920 tons",
    updated: "2 weeks ago"
  },
];

const emissionColumns = [
  { key: "id", title: "ID" },
  { key: "name", title: "Report Name" },
  { key: "date", title: "Date" },
  { key: "facility", title: "Facility" },
  { key: "status", title: "Status" },
  { key: "emissions", title: "CO2e" },
  { key: "updated", title: "Last Updated" }
];

export default function GovernmentEmissionRecords() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">Government Emission Records</h1>
              <p className="text-muted-foreground">Manage and view emission reports from government facilities</p>
            </header>

            <section className="mb-8">
              <RecordTable 
                title="Emission Reports" 
                records={emissionRecords} 
                columns={emissionColumns} 
              />
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
