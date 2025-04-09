
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RecordTable } from "@/components/dashboard/RecordTable";

const treeRecords = [
  {
    id: "TR001",
    name: "Northern Forest Inventory",
    date: "2025-04-01",
    location: "Northern Region",
    status: "active" as const,
    trees: "12,450",
    updated: "1 day ago"
  },
  {
    id: "TR002",
    name: "Oak Planting Project",
    date: "2025-03-28",
    location: "Eastern Zone",
    status: "active" as const,
    trees: "850",
    updated: "3 days ago"
  },
  {
    id: "TR003",
    name: "Urban Tree Health Assessment",
    date: "2025-03-25",
    location: "Downtown Area",
    status: "completed" as const,
    trees: "320",
    updated: "1 week ago"
  },
  {
    id: "TR004",
    name: "Park Reforestation",
    date: "2025-03-20",
    location: "Central Park",
    status: "pending" as const,
    trees: "500",
    updated: "10 days ago"
  },
  {
    id: "TR005",
    name: "School Campus Greening",
    date: "2025-03-15",
    location: "University Campus",
    status: "completed" as const,
    trees: "125",
    updated: "2 weeks ago"
  },
];

const treeColumns = [
  { key: "id", title: "ID" },
  { key: "name", title: "Project Name" },
  { key: "date", title: "Date" },
  { key: "location", title: "Location" },
  { key: "status", title: "Status" },
  { key: "trees", title: "Tree Count" },
  { key: "updated", title: "Last Updated" }
];

export default function TreeManagementRecords() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="tree-management" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">Tree Management Records</h1>
              <p className="text-muted-foreground">Manage and view tree planting and inventory records</p>
            </header>

            <section className="mb-8">
              <RecordTable 
                title="Tree Management Projects" 
                records={treeRecords} 
                columns={treeColumns} 
              />
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
