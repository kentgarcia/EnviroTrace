import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { SidebarTrigger } from "@/presentation/components/shared/ui/sidebar";
import { Button } from "@/presentation/components/shared/ui/button";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
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
import { useAuthStore } from "@/hooks/auth/useAuthStore";
import { useState, useEffect } from "react";
import { fetchMyProfile } from "@/lib/profile-api";

export function DashboardNavbar({
  dashboardTitle = "Environmental Management System",
}) {
  const navigate = useNavigate();
  const { userData, signOut } = useAuth();
  const clearToken = useAuthStore((state) => state.clearToken);
  const [profile, setProfile] = useState<{
    firstName?: string;
    lastName?: string;
  } | null>(null);

  useEffect(() => {
    // Fetch user profile data when component mounts
    const getProfileData = async () => {
      try {
        const profileData = await fetchMyProfile();
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    getProfileData();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      clearToken();
      toast.success("Signed out successfully");
      navigate({ to: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  // Get user display name
  const getDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    } else if (profile?.firstName) {
      return profile.firstName;
    } else if (profile?.lastName) {
      return profile.lastName;
    }
    return userData?.email || "User";
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
    return userData?.email?.charAt(0).toUpperCase() || "U";
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
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-left">
              <div className="font-medium">{getDisplayName()}</div>
              <div className="text-xs text-muted-foreground">User Profile</div>
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
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigate({ to: "/dashboard-selection" })}
          >
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
