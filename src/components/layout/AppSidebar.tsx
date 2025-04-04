
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
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { BarChart2, Car, ClipboardList, FileStack, Leaf, Settings, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";

interface SidebarProps {
  dashboardType: "air-quality" | "tree-management" | "government-emission";
}

export function AppSidebar({ dashboardType }: SidebarProps) {
  const location = useLocation();
  const { userData } = useAuth();
  
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
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userData?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs">
            <div className="font-medium truncate">{userData?.email || "User"}</div>
            <div className="text-muted-foreground">Signed in</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
