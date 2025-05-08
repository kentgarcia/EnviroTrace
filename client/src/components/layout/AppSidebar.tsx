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
import { Link, useMatchRoute } from "@tanstack/react-router";
import {
  BarChart2,
  Building,
  Car,
  ClipboardList,
  FileStack,
  Leaf,
  Settings,
  Calendar,
  Users,
  Activity,
  Shield,
  Database,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

interface SidebarProps {
  dashboardType:
    | "air-quality"
    | "tree-management"
    | "government-emission"
    | "admin";
}

export function AppSidebar({ dashboardType }: SidebarProps) {
  const matchRoute = useMatchRoute();
  const { userData } = useAuth();

  const getMenuItems = () => {
    const basePath = `/${dashboardType}`;

    if (dashboardType === "admin") {
      return [
        {
          title: "Overview",
          icon: BarChart2,
          path: `${basePath}/overview`,
        },
        {
          title: "User Management",
          icon: Users,
          path: `${basePath}/user-management`,
        },
        {
          title: "Settings",
          icon: Settings,
          path: `${basePath}/settings`,
        },
        {
          title: "Activity Logs",
          icon: Activity,
          path: `${basePath}/logs`,
        },
        {
          title: "Security",
          icon: Shield,
          path: `${basePath}/security`,
        },
        {
          title: "Data Management",
          icon: Database,
          path: `${basePath}/data`,
        },
      ];
    } else if (dashboardType === "government-emission") {
      return [
        {
          title: "Dashboard",
          icon: BarChart2,
          path: `${basePath}/overview`,
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
          title: "Settings",
          icon: Settings,
          path: `${basePath}/settings`,
        },
      ];
    } else if (dashboardType === "tree-management") {
      return [
        {
          title: "Dashboard",
          icon: BarChart2,
          path: `${basePath}/overview`,
        },
        {
          title: "Seedling Requests",
          icon: ClipboardList,
          path: `${basePath}/seedling-requests`,
        },
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
      },
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
      case "admin":
        return "Admin Dashboard";
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
                <SidebarMenuItem key={item.title} className="pl-2 pr-2 py-1">
                  <SidebarMenuButton
                    asChild
                    isActive={!!matchRoute({ to: item.path, fuzzy: false })}
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
