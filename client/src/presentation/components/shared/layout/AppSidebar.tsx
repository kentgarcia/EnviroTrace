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
} from "@/presentation/components/shared/ui/sidebar";
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
  Cloud,
  Wallet,
  UserCircle,
  LogOut,
  User,
  ChevronDown,
  PanelLeft,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth";
import { useAuthStore } from "@/hooks/auth/useAuthStore";
import { useState, useEffect } from "react";
import { fetchMyProfile } from "@/lib/api/profile-api";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

interface SidebarProps {
  dashboardType:
    | "air-quality"
    | "tree-management"
    | "government-emission"
    | "admin"
    | "smoke-belching";
}

export function AppSidebar({ dashboardType }: SidebarProps) {
  const matchRoute = useMatchRoute();
  const { userData, signOut } = useAuth();
  const clearToken = useAuthStore((state) => state.clearToken);
  const [profile, setProfile] = useState<{
    firstName?: string;
    lastName?: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
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

  const getMenuItems = () => {
    const basePath = `/${dashboardType}`;

    if (dashboardType === "smoke-belching") {
      return [
        {
          title: "Overview",
          icon: BarChart2,
          path: `${basePath}/overview`,
        },
        {
          title: "Smoke Belcher",
          icon: Cloud,
          path: `${basePath}/smoke-belcher`,
        },
        {
          title: "Order of Payments",
          icon: FileStack,
          path: `${basePath}/order-of-payments`,
        },
        {
          title: "Account Control",
          icon: UserCircle,
          path: `${basePath}/account-control`,
        },
        {
          title: "Fee Control",
          icon: Wallet,
          path: `${basePath}/fee-control`,
        },
        {
          title: "Reports",
          icon: FileStack,
          path: `${basePath}/reports`,
        },
      ];
    } else if (dashboardType === "admin") {
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

  const menuItems = getMenuItems();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-end w-full">
          <SidebarTrigger
            className="mr-0 ml-auto text-white hover:bg-gray-100 hover:text-[#22305a] h-12 w-12"
            style={{ boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)" }}
          >
            <span className="flex items-center justify-center w-full h-full">
              <PanelLeft className="h-8 w-8" />
            </span>
          </SidebarTrigger>
        </div>
        <div className="flex items-center justify-center gap-2 pt-4 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:pt-2">
          {/* First logo */}
          <img
            src="/images/logo_munti.png"
            alt="Logo 1"
            className="h-16 w-16 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:mb-1"
          />
          {/* Second logo */}
          <img
            src="/images/logo_epnro.png"
            alt="Logo 2"
            className="h-16 w-16 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
          />
        </div>
        <div className="flex items-center justify-center gap-2 group-data-[collapsible=icon]:hidden">
          <h3 className="font-semibold text-lg text-center text-[#FFBF00]">
            EPNRO Management System
          </h3>
        </div>
      </SidebarHeader>

      <SidebarContent className="text-white bg-sidebar px-2 pb-2 pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="pl-2 pr-2 py-1">
                <div className="text-sm font-medium text-gray-400 px-3 py-2 group-data-[collapsible=icon]:hidden">
                  Menu
                </div>
              </SidebarMenuItem>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} className="pl-2 pr-2 py-1">
                  <SidebarMenuButton
                    asChild
                    isActive={!!matchRoute({ to: item.path, fuzzy: false })}
                    className="
                      data-[active=true]:bg-[#22305a]
                      data-[active=true]:font-semibold
                      data-[active=true]:text-white
                      hover:bg-[#2d406e]
                      hover:text-white
                      focus:bg-[#2d406e]
                      focus:text-white
                      active:bg-[#22305a]
                      active:text-white
                      group-data-[collapsible=icon]:justify-center
                      group-data-[collapsible=icon]:w-12
                      group-data-[collapsible=icon]:h-12
                      group-data-[collapsible=icon]:p-0
                      group-data-[collapsible=icon]:mx-auto
                      rounded-md transition-all flex items-center
                    "
                  >
                    <Link
                      to={item.path}
                      className="flex items-center gap-3 w-full justify-start group-data-[collapsible=icon]:justify-center"
                    >
                      <item.icon className="shrink-0 h-7 w-7 text-white group-data-[active=true]:text-[#FFBF00] group-data-[collapsible=icon]:mx-auto" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem className="pl-2 pr-2 py-1">
                <div className="text-sm font-medium text-gray-400 px-3 py-2 group-data-[collapsible=icon]:hidden">
                  Account
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem className="pl-2 pr-2 py-1">
                <SidebarMenuButton
                  asChild
                  isActive={false}
                  className="
                  data-[active=true]:bg-[#22305a]
                  data-[active=true]:font-semibold
                  data-[active=true]:text-white
                  hover:bg-[#2d406e]
                  hover:text-white
                  focus:bg-[#2d406e]
                  focus:text-white
                  active:bg-[#22305a]
                  active:text-white
                  group-data-[collapsible=icon]:justify-center
                  group-data-[collapsible=icon]:w-12
                  group-data-[collapsible=icon]:h-12
                  group-data-[collapsible=icon]:p-0
                  group-data-[collapsible=icon]:mx-auto
                  rounded-md transition-all flex items-center
                "
                >
                  <Link
                    to={"/profile"}
                    className="flex items-center gap-3 w-full justify-start group-data-[collapsible=icon]:justify-center"
                  >
                    <User className="shrink-0 h-7 w-7 text-white group-data-[active=true]:text-[#FFBF00] group-data-[collapsible=icon]:mx-auto" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      My Profile
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="pl-2 pr-2 py-1">
                <SidebarMenuButton
                  asChild
                  isActive={false}
                  className="
                  data-[active=true]:bg-[#22305a]
                  data-[active=true]:font-semibold
                  data-[active=true]:text-white
                  hover:bg-[#2d406e]
                  hover:text-white
                  focus:bg-[#2d406e]
                  focus:text-white
                  active:bg-[#22305a]
                  active:text-white
                  group-data-[collapsible=icon]:justify-center
                  group-data-[collapsible=icon]:w-12
                  group-data-[collapsible=icon]:h-12
                  group-data-[collapsible=icon]:p-0
                  group-data-[collapsible=icon]:mx-auto
                  rounded-md transition-all flex items-center
                "
                >
                  <Link
                    to={"/dashboard-selection"}
                    className="flex items-center gap-3 w-full justify-start group-data-[collapsible=icon]:justify-center"
                  >
                    <ChevronDown className="shrink-0 h-7 w-7 text-white group-data-[active=true]:text-[#FFBF00] group-data-[collapsible=icon]:mx-auto" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Switch Dashboard
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="pl-2 pr-2 py-1">
                <SidebarMenuButton
                  isActive={false}
                  className="
                  data-[active=true]:bg-[#22305a]
                  data-[active=true]:font-semibold
                  data-[active=true]:text-white
                  hover:bg-[#2d406e]
                  hover:text-white
                  focus:bg-[#2d406e]
                  focus:text-white
                  active:bg-[#22305a]
                  active:text-white
                  group-data-[collapsible=icon]:justify-center
                  group-data-[collapsible=icon]:w-12
                  group-data-[collapsible=icon]:h-12
                  group-data-[collapsible=icon]:p-0
                  group-data-[collapsible=icon]:mx-auto
                  rounded-md transition-all flex items-center
                "
                  onClick={handleSignOut}
                  tooltip="Sign Out"
                >
                  <LogOut className="shrink-0 h-7 w-7 text-white group-data-[active=true]:text-[#FFBF00] group-data-[collapsible=icon]:mx-auto" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Sign Out
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
