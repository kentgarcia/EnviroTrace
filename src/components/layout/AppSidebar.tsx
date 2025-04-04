
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart2, Car, ClipboardList, FileStack, Leaf, LogOut, Settings, User, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/lib/auth";

interface SidebarProps {
  dashboardType: "air-quality" | "tree-management" | "government-emission";
}

export function AppSidebar({ dashboardType }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const getMenuItems = () => {
    const basePath = `/${dashboardType}`;
    
    if (dashboardType === "government-emission") {
      return [
        {
          title: "Dashboard",
          icon: BarChart2,
          path: `${basePath}/overview`,
        },
        {
          title: "Records",
          icon: ClipboardList,
          path: `${basePath}/records`,
        },
        {
          title: "Vehicles",
          icon: Car,
          path: `${basePath}/vehicles`,
        },
        {
          title: "Quarterly Testing",
          icon: Calendar,
          path: `${basePath}/quarterly-testing`,
        },
        {
          title: "Reports",
          icon: FileStack,
          path: `${basePath}/reports`,
        },
        {
          title: "Settings",
          icon: Settings,
          path: `${basePath}/settings`,
        }
      ];
    }
    
    const commonItems = [
      {
        title: "Dashboard",
        icon: BarChart2,
        path: `${basePath}/overview`,
      },
      {
        title: "Records",
        icon: ClipboardList,
        path: `${basePath}/records`,
      },
      {
        title: "Reports",
        icon: FileStack,
        path: `${basePath}/reports`,
      },
      {
        title: "Settings",
        icon: Settings,
        path: `${basePath}/settings`,
      }
    ];

    return commonItems;
  };

  const getDashboardTitle = () => {
    switch (dashboardType) {
      case "air-quality":
        return "Air Quality";
      case "tree-management":
        return "Tree Management";
      case "government-emission":
        return "Government Emission";
      default:
        return "Dashboard";
    }
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">{getDashboardTitle()}</h3>
        </div>
        <SidebarTrigger className="mb-0" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userData?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <div className="font-medium">{userData?.email || "User"}</div>
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs text-muted-foreground"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => navigate("/dashboard-selection")}
            title="Switch Dashboard"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
