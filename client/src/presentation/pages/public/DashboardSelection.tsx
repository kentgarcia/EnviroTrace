import { DashboardCard } from "@/presentation/components/shared/dashboard/DashboardCard";
import { Button } from "@/presentation/components/shared/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, Loader2, LogOut, User, LayoutDashboard, ShieldCheck, TreePine, Truck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/core/api/auth";
import { motion } from "framer-motion";
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
    const hasDirectRole =
      user?.assigned_roles?.includes(role) ||
      user?.assigned_roles?.includes("admin") ||
      user?.roles?.includes(role) ||
      user?.roles?.includes("admin");

    if (hasDirectRole) {
      return true;
    }

    const { roles } = useAuthStore.getState();
    return roles.includes(role) || roles.includes("admin");
  };

  const getDisplayName = () => {
    if (profile?.fullName) return profile.fullName;
    if (profile?.firstName && profile?.lastName) return `${profile.firstName} ${profile.lastName}`;
    return user?.email || "User";
  };

  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md py-3 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img
                src="/images/logo_munti.png"
                alt="Muntinlupa Logo"
                className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
              />
              <img
                src="/images/logo_epnro.png"
                alt="EPNRO Logo"
                className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                EnviroTrace
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Environmental Management System
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Avatar className="h-9 w-9 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm text-left hidden md:block">
                  <div className="font-semibold text-slate-900">{getDisplayName()}</div>
                  <div className="text-xs text-slate-500">Account Settings</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              <div className="px-2 py-1.5 mb-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-semibold truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer rounded-md py-2"
                onClick={() => navigate({ to: "/profile" })}
              >
                <User className="mr-2 h-4 w-4 text-slate-500" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer rounded-md py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: "url('/images/bg_login.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground text-xs font-bold uppercase tracking-widest mb-4">
              <LayoutDashboard className="h-3 w-3" />
              Workspace Selection
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Welcome back, <span className="text-primary-foreground">{getDisplayName().split(' ')[0]}</span>!
            </h2>
            <p className="text-base md:text-lg text-slate-200 leading-relaxed">
              Access your specialized environmental management tools and real-time data monitoring dashboards.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        <div className="flex flex-col items-center mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Available Dashboards</h3>
          <div className="h-1 w-16 bg-primary rounded-full" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"
        >
          {hasRole("admin") && (
            <motion.div variants={itemVariants} className="w-full max-w-sm">
              <DashboardCard
                title="System Administration"
                description="Full access to system configurations, user management, and audit logs."
                icon="/images/bg_govemissions.jpg"
                onClick={() => handleDashboardSelect("admin")}
                className="h-full border-slate-200 hover:border-primary transition-all duration-300"
              />
            </motion.div>
          )}

          {hasRole("urban_greening") && (
            <motion.div variants={itemVariants} className="w-full max-w-sm">
              <DashboardCard
                title="Urban Greening"
                description="Monitor tree health, track afforestation projects, and manage green spaces."
                icon="/images/bg_envicompliance.jpg"
                onClick={() => handleDashboardSelect("urban-greening")}
                className="h-full border-slate-200 hover:border-ems-green-500 transition-all duration-300"
              />
            </motion.div>
          )}

          {hasRole("government_emission") && (
            <motion.div variants={itemVariants} className="w-full max-w-sm">
              <DashboardCard
                title="Fleet Emissions"
                description="Manage government vehicle emission testing and environmental compliance."
                icon="/images/bg_govemissions.jpg"
                onClick={() => handleDashboardSelect("government-emission")}
                className="h-full border-slate-200 hover:border-ems-blue-500 transition-all duration-300"
              />
            </motion.div>
          )}
        </motion.div>

        {!hasRole("admin") && !hasRole("urban_greening") && !hasRole("government_emission") && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-slate-900">No Dashboards Available</h4>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Your account doesn't have any assigned dashboard roles. Please contact your administrator.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t bg-white py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
              <div className="h-4 w-4 bg-primary rounded-sm" />
            </div>
            <span className="font-bold text-slate-900">EnviroTrace</span>
          </div>
          <div className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Environmental Management System. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

