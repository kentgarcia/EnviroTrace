import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import {
  LogOut,
  User,
  ChevronDown,
  BarChart2,
  Users,
  Settings,
  Activity,
  Shield,
  Database,
  Car,
  Calendar,
  Building,
  ClipboardList,
  FileStack,
  Cloud,
  Wallet,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth";
import { useAuthStore } from "@/hooks/auth/useAuthStore";
import { toast } from "sonner";
import TopNavBar, { NavItem } from "./TopNavBar";
import React from "react";

interface TopNavBarContainerProps {
  dashboardType:
    | "air-quality"
    | "tree-management"
    | "government-emission"
    | "admin"
    | "smoke-belching";
}

function getMenuItems(
  dashboardType: TopNavBarContainerProps["dashboardType"],
  matchRoute: ReturnType<typeof useMatchRoute>
) {
  const basePath = `/${dashboardType}`;
  if (dashboardType === "air-quality") {
    return [
      {
        label: "Overview",
        icon: <BarChart2 className="w-4 h-4 mr-1" />,
        path: `/smoke-belching/overview`,
      },
      {
        label: "Smoke Belcher",
        icon: <Cloud className="w-4 h-4 mr-1" />,
        path: `/smoke-belching/smoke-belcher`,
      },
      {
        label: "Order of Payments",
        icon: <FileStack className="w-4 h-4 mr-1" />,
        path: `/smoke-belching/order-of-payments`,
      },
      {
        label: "Account Control",
        icon: <UserCircle className="w-4 h-4 mr-1" />,
        path: `/smoke-belching/account-control`,
      },
      {
        label: "Fee Control",
        icon: <Wallet className="w-4 h-4 mr-1" />,
        path: `/smoke-belching/fee-control`,
      },
      {
        label: "Reports",
        icon: <FileStack className="w-4 h-4 mr-1" />,
        path: `/smoke-belching/reports`,
      },
    ];
  } else if (dashboardType === "admin") {
    return [
      {
        label: "Overview",
        icon: <BarChart2 className="w-4 h-4 mr-1" />,
        path: `${basePath}/overview`,
      },
      {
        label: "User Management",
        icon: <Users className="w-4 h-4 mr-1" />,
        path: `${basePath}/user-management`,
      },
      {
        label: "Settings",
        icon: <Settings className="w-4 h-4 mr-1" />,
        path: `${basePath}/settings`,
      },
      {
        label: "Activity Logs",
        icon: <Activity className="w-4 h-4 mr-1" />,
        path: `${basePath}/logs`,
      },
      {
        label: "Security",
        icon: <Shield className="w-4 h-4 mr-1" />,
        path: `${basePath}/security`,
      },
      {
        label: "Data Management",
        icon: <Database className="w-4 h-4 mr-1" />,
        path: `${basePath}/data`,
      },
    ];
  } else if (dashboardType === "government-emission") {
    return [
      {
        label: "Dashboard",
        icon: <BarChart2 className="w-4 h-4 mr-1" />,
        path: `${basePath}/overview`,
      },
      {
        label: "Vehicles",
        icon: <Car className="w-4 h-4 mr-1" />,
        path: `${basePath}/vehicles`,
      },
      {
        label: "Quarterly Testing",
        icon: <Calendar className="w-4 h-4 mr-1" />,
        path: `${basePath}/quarterly-testing`,
      },
      {
        label: "Offices",
        icon: <Building className="w-4 h-4 mr-1" />,
        path: `${basePath}/offices`,
      },
      {
        label: "Settings",
        icon: <Settings className="w-4 h-4 mr-1" />,
        path: `${basePath}/settings`,
      },
    ];
  } else if (dashboardType === "tree-management") {
    return [
      {
        label: "Dashboard",
        icon: <BarChart2 className="w-4 h-4 mr-1" />,
        path: `${basePath}/overview`,
      },
      {
        label: "Seedling Requests",
        icon: <ClipboardList className="w-4 h-4 mr-1" />,
        path: `${basePath}/seedling-requests`,
      },
    ];
  }
  // Default/common items
  return [
    {
      label: "Dashboard",
      icon: <BarChart2 className="w-4 h-4 mr-1" />,
      path: `${basePath}/overview`,
    },
    {
      label: "Records",
      icon: <ClipboardList className="w-4 h-4 mr-1" />,
      path: `${basePath}/records`,
    },
    {
      label: "Reports",
      icon: <FileStack className="w-4 h-4 mr-1" />,
      path: `${basePath}/reports`,
    },
    {
      label: "Settings",
      icon: <Settings className="w-4 h-4 mr-1" />,
      path: `${basePath}/settings`,
    },
  ];
}

export default function TopNavBarContainer({
  dashboardType,
}: TopNavBarContainerProps) {
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const { signOut, userData } = useAuth();
  const clearToken = useAuthStore((state) => state.clearToken);

  const handleSignOut = async () => {
    await signOut();
    clearToken();
    toast.success("Signed out successfully");
    navigate({ to: "/" });
  };

  const menuItems: NavItem[] = getMenuItems(dashboardType, matchRoute).map(
    (item) => ({
      label: (
        <span className="flex items-center">
          {item.icon}
          {item.label}
        </span>
      ),
      active: !!matchRoute({ to: item.path, fuzzy: false }),
      onClick: () => navigate({ to: item.path }),
    })
  );

  // --- Dashboard Switch Dropdown Logic ---
  const dashboardRoleMap = [
    { role: "admin", label: "Admin Dashboard", path: "/admin/overview" },
    {
      role: "air_quality",
      label: "Air Quality",
      path: "/smoke-belching/overview",
    },
    {
      role: "tree_management",
      label: "Tree Management",
      path: "/tree-management/overview",
    },
    {
      role: "government_emission",
      label: "Government Emission",
      path: "/government-emission/overview",
    },
  ];
  const userDashboards = dashboardRoleMap.filter((d) =>
    (userData?.roles as any)?.includes(d.role)
  );

  // If user is admin, show all dashboards
  if (userData?.roles?.includes("admin")) {
    userDashboards.splice(0, userDashboards.length, ...dashboardRoleMap);
  }

  // Dropdown for switching dashboards (only if more than one dashboard)
  let switchDashboardDropdown: NavItem | null = null;
  if (userDashboards.length > 1) {
    switchDashboardDropdown = {
      label: <span className="flex items-center">Switch Dashboard</span>,
      onClick: () => navigate({ to: "/dashboard-selection" }),
      children: (
        <div className="absolute bg-white text-black rounded shadow mt-2 min-w-[180px] z-50">
          {userDashboards.map((d) => (
            <button
              key={d.role}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 uppercase"
              onClick={() => navigate({ to: d.path })}
            >
              {d.label}
            </button>
          ))}
        </div>
      ),
    };
  }

  // Account actions (right-aligned)
  const accountItems: NavItem[] = [
    {
      label: (
        <span className="flex items-center">
          <User className="w-4 h-4 mr-1" />
          My Profile
        </span>
      ),
      onClick: () => navigate({ to: "/profile" }),
    },
    // Only show switch dashboard dropdown if more than one dashboard
    ...(switchDashboardDropdown ? [switchDashboardDropdown] : []),
    {
      label: (
        <span className="flex items-center">
          <LogOut className="w-4 h-4 mr-1" />
          Sign Out
        </span>
      ),
      onClick: handleSignOut,
    },
  ];

  return (
    <div className="flex w-full bg-main">
      <TopNavBar items={menuItems} className="flex-1" />
      <TopNavBar items={accountItems} className="justify-end flex-1" />
    </div>
  );
}
