
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Leaf, Wind, TreePine, Factory, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function DashboardSelection() {
  const navigate = useNavigate();
  const [availableDashboards, setAvailableDashboards] = useState<string[]>([]);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const authData = localStorage.getItem("ems-auth");
    if (!authData) {
      navigate("/");
      return;
    }

    const { email, isAuthenticated, role } = JSON.parse(authData);
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    setUser({ email });
    setAvailableDashboards(role);
  }, [navigate]);

  const handleDashboardSelect = (dashboardType: string) => {
    navigate(`/${dashboardType}/overview`);
  };

  const handleSignOut = () => {
    localStorage.removeItem("ems-auth");
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ems-green-50 to-ems-blue-50">
      <header className="border-b bg-white py-4 px-6">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Environmental Management System</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-1">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">Welcome, {user?.email}</h2>
            <p className="text-muted-foreground">
              Select a dashboard to access environmental data and management tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {availableDashboards.includes("air-quality") && (
              <DashboardCard
                title="Air Quality"
                description="Monitor air quality metrics, pollution levels, and compliance data"
                icon={Wind}
                onClick={() => handleDashboardSelect("air-quality")}
                className="border-ems-blue-200 hover:border-ems-blue-400"
              />
            )}
            
            {availableDashboards.includes("tree-management") && (
              <DashboardCard
                title="Tree Management"
                description="Track afforestation efforts, tree health data, and forest coverage"
                icon={TreePine}
                onClick={() => handleDashboardSelect("tree-management")}
                className="border-ems-green-200 hover:border-ems-green-400"
              />
            )}
            
            {availableDashboards.includes("government-emission") && (
              <DashboardCard
                title="Government Emission"
                description="Analyze emission data from government facilities and public transportation"
                icon={Factory}
                onClick={() => handleDashboardSelect("government-emission")}
                className="border-ems-gray-200 hover:border-ems-gray-400"
              />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-4 px-6">
        <div className="max-w-screen-xl mx-auto text-center text-sm text-muted-foreground">
          Environmental Management System &copy; 2025
        </div>
      </footer>
    </div>
  );
}
