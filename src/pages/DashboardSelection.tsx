
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronDown, Leaf, Loader2, LogOut, TreePine, Wind, Factory, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth, UserRole } from "@/lib/auth";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DashboardSelection() {
  const navigate = useNavigate();
  const { user, userData, loading, signOut: authSignOut } = useAuth();
  
  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleDashboardSelect = (dashboardType: string) => {
    navigate(`/${dashboardType}/overview`);
  };

  const handleSignOut = async () => {
    try {
      await authSignOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ems-green-50 to-ems-blue-50">
      <header className="border-b bg-white py-4 px-6">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Placeholder for the first logo */}
            <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
              Logo 1
            </div>
            {/* Placeholder for the second logo */}
            <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
              Logo 2
            </div>
            <h1 className="text-xl font-semibold">Environmental Management System</h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userData?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm text-left hidden md:block">
                  <div className="font-medium">{userData?.email}</div>
                  <div className="text-xs text-muted-foreground">User Profile</div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div 
        className="py-16 px-6 bg-cover bg-center text-white"
        style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=80')" }}
      >
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome, {userData?.email}</h2>
          <p className="text-xl max-w-2xl">
            Select a dashboard to access environmental data and management tools for sustainable development
          </p>
        </div>
      </div>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {userData?.roles.includes('admin' as UserRole) || userData?.roles.includes('air-quality' as UserRole) ? (
              <DashboardCard
                title="Air Quality"
                description="Monitor air quality metrics, pollution levels, and compliance data"
                icon="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&q=80"
                onClick={() => handleDashboardSelect("air-quality")}
                className="border-ems-blue-200 hover:border-ems-blue-400"
              />
            ) : null}
            
            {userData?.roles.includes('admin' as UserRole) || userData?.roles.includes('tree-management' as UserRole) ? (
              <DashboardCard
                title="Tree Management"
                description="Track afforestation efforts, tree health data, and forest coverage"
                icon="https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=600&q=80"
                onClick={() => handleDashboardSelect("tree-management")}
                className="border-ems-green-200 hover:border-ems-green-400"
              />
            ) : null}
            
            {userData?.roles.includes('admin' as UserRole) || userData?.roles.includes('government-emission' as UserRole) ? (
              <DashboardCard
                title="Government Emission"
                description="Analyze emission data from government facilities and public transportation"
                icon="https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?auto=format&fit=crop&w=600&q=80"
                onClick={() => handleDashboardSelect("government-emission")}
                className="border-ems-gray-200 hover:border-ems-gray-400"
              />
            ) : null}
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
