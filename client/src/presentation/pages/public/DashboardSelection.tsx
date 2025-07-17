import { DashboardCard } from "@/presentation/components/shared/dashboard/DashboardCard";
import { Button } from "@/presentation/components/shared/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, Loader2, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/core/api/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/presentation/components/shared/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
} from "@/presentation/components/shared/ui/avatar";
import { UserRole } from "@/integrations/types/userData";
import { useMyProfile } from "@/core/api/profile-service";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";

export default function DashboardSelection() {
  const navigate = useNavigate();
  const { user, loading, signOut: authSignOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  // Debug logging for user data
  console.log("User data in DashboardSelection:", user);
  console.log("User roles:", user?.roles);
  console.log("User assigned_roles:", user?.assigned_roles);

  const handleDashboardSelect = (dashboardType: string) => {
    navigate({ to: `/${dashboardType}/overview` });
  };

  const handleSignOut = async () => {
    try {
      await authSignOut();
      toast.success("Signed out successfully");
      navigate({ to: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };
  const hasRole = (role: UserRole) => {
    // Check both assigned_roles and roles properties of the user object
    const hasDirectRole =
      user?.assigned_roles?.includes(role) ||
      user?.assigned_roles?.includes("admin") ||
      user?.roles?.includes(role) ||
      user?.roles?.includes("admin");

    if (hasDirectRole) {
      return true;
    }

    // Fall back to checking the auth store if no roles directly on user object
    const { roles } = useAuthStore.getState();
    return roles.includes(role) || roles.includes("admin");
  };
  // Get user display name
  const getDisplayName = () => {
    if (profile?.fullName) {
      return profile.fullName;
    } else if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    } else if (profile?.firstName) {
      return profile.firstName;
    } else if (profile?.lastName) {
      return profile.lastName;
    }
    return user?.email || "User";
  };

  // Get initials for avatar
  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(
        0
      )}`.toUpperCase();
    } else if (profile?.firstName) {
      return profile.firstName.charAt(0).toUpperCase();
    } else if (profile?.lastName) {
      return profile.lastName.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  // Debug log to see what roles we have right before rendering
  const storeRoles = useAuthStore.getState().roles;
  console.log("Auth store roles:", storeRoles);
  console.log("Admin role check:", hasRole("admin"));
  console.log("Air quality role check:", hasRole("air_quality"));
  console.log("Urban greening role check:", hasRole("urban_greening"));
  console.log(
    "Government emission role check:",
    hasRole("government_emission")
  );

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-ems-green-50 to-ems-blue-50">
      <header className="border-b bg-white py-4 px-6">
        <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="/images/logo_munti.png"
              alt="Logo 1"
              className="h-16 w-16 rounded-md"
            />
            <img
              src="/images/logo_epnro.png"
              alt="Logo 2"
              className="h-16 w-16 rounded-md"
            />
            <h1 className="text-xl font-semibold">
              Environmental Management System
            </h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm text-left hidden md:block">
                  <div className="font-medium">{getDisplayName()}</div>
                  <div className="text-xs text-muted-foreground">
                    User Profile
                  </div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate({ to: "/profile" })}
              >
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div
        className="py-16 px-6 bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/images/bg_login.png')" }}
      >
        <div className="max-w-(--breakpoint-xl) mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome, {getDisplayName()}!
          </h2>
          <p className="text-xl max-w-2xl">
            Select a dashboard to access environmental data and management tools
            for sustainable development
          </p>
        </div>
      </div>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-(--breakpoint-xl) mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {hasRole("admin") && (
              <DashboardCard
                title="Admin Dashboard"
                description="Manage system settings and configurations"
                icon="/images/bg_govemissions.jpg"
                onClick={() => handleDashboardSelect("admin")}
                className="border-ems-red-200 hover:border-ems-red-400"
              />
            )}

            {hasRole("air_quality") && (
              <DashboardCard
                title="Anti-Smoke Belching Testing"
                description="Monitor and evaluate smoke emissions from vehicles"
                icon="/images/bg_asbu.jpg"
                onClick={() => handleDashboardSelect("air-quality")}
                className="border-ems-blue-200 hover:border-ems-blue-400"
              />
            )}

            {hasRole("urban_greening") && (
              <DashboardCard
                title="Urban Greening"
                description="Track afforestation efforts, tree health data, and forest coverage"
                icon="/images/bg_envicompliance.jpg"
                onClick={() => handleDashboardSelect("urban-greening")}
                className="border-ems-green-200 hover:border-ems-green-400"
              />
            )}

            {hasRole("government_emission") && (
              <DashboardCard
                title="Government Fleet Emmission Testing"
                description="Evaluate and optimize emissions from government-operated vehicles"
                icon="/images/bg_govemissions.jpg"
                onClick={() => handleDashboardSelect("government-emission")}
                className="border-ems-gray-200 hover:border-ems-gray-400"
              />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-4 px-6">
        <div className="max-w-(--breakpoint-xl) mx-auto text-center text-sm text-muted-foreground">
          Environmental Management System &copy; 2025
        </div>
      </footer>
    </div>
  );
}
