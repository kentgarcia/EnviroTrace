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
import { BarChart2, Building, Car, ClipboardList, FileStack, Leaf, Settings, Calendar } from "lucide-react";
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
          title: "Offices",
          icon: Building,
          path: `${basePath}/offices`,
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
      <SidebarHeader className="px-4 py-3">
        <div className="flex items-center justify-center gap-2 pt-4">
          {/* First logo */}
          <img
            src="/images/logo_munti.png"
            alt="Logo 1"
            className="h-16 w-16"
          />
          {/* Second logo */}
          <img
            src="/images/logo_epnro.png"
            alt="Logo 2"
            className="h-16 w-16"
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          {/* <h3 className="font-semibold text-lg">{getDashboardTitle()}</h3> */}
          <h3 className="font-semibold text-lg text-center text-[#FFBF00]">
            EPNRO Management System
          </h3>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="text-white">
        <SidebarGroup>
          {/* <SidebarGroupLabel>Main Navigation</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem 
                  key={item.title}
                  className="pl-2 pr-2 py-1">
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    className="
                      data-[active=true]:bg-[#676782]
                      data-[active=true]:font-semibold
                      data-[active=true]:text-white
                      hover:bg-[#4e4e63]
                      hover:text-white 
                      focus:bg-[#4e4e63]
                      focus:text-white
                      active:bg-[#676782] 
                      active:text-white
                      "
                    >
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
    </Sidebar>
  );
}
