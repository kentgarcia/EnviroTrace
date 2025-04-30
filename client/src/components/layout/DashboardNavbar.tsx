import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  Settings,
  User
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/hooks/useAuthStore";

export function DashboardNavbar({ dashboardTitle = "Environmental Management System" }) {
  const navigate = useNavigate();
  const { userData, signOut } = useAuth();
  const clearToken = useAuthStore((state) => state.clearToken);

  const handleSignOut = async () => {
    try {
      await signOut();
      clearToken();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="h-14 border-b bg-white px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="mr-2" />
        <div className="text-sm font-medium">{dashboardTitle}</div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userData?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-left">
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
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/dashboard-selection')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Switch Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
