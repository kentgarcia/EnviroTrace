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
  FileText,
  Cloud,
  Wallet,
  UserCircle,
  Receipt,
  TreePine,
} from "lucide-react";
import { useAuth } from "@/core/api/auth";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { toast } from "sonner";
import TopNavBar, { NavItem } from "./TopNavBar";
import React from "react";

interface TopNavBarContainerProps {
  dashboardType:
  | "air-quality"
  | "urban-greening"
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
        path: `/air-quality/overview`,
      },
      {
        label: "Smoke Belcher",
        icon: <Cloud className="w-4 h-4 mr-1" />,
        path: `/air-quality/smoke-belcher`,
        children: [
          {
            label: "Driver Query",
            icon: <Users className="w-4 h-4 mr-1" />,
            path: `/air-quality/driver-query`,
          },
        ],
      },
      {
        label: "Order of Payment",
        icon: <FileStack className="w-4 h-4 mr-1" />,
        path: `/air-quality/order-of-payment`,
      },
      {
        label: "Fee Control",
        icon: <Wallet className="w-4 h-4 mr-1" />,
        path: `/air-quality/fee-control`,
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
    ];
  } else if (dashboardType === "urban-greening") {
    return [
      {
        label: "Dashboard",
        icon: <BarChart2 className="w-4 h-4 mr-1" />,
        path: `${basePath}/overview`,
      },
      {
        label: "Monitoring Requests",
        icon: <FileText className="w-4 h-4 mr-1" />,
        path: `${basePath}/monitoring-requests`,
      },
      {
        label: "Tree Management",
        icon: <TreePine className="w-4 h-4 mr-1" />,
        path: `${basePath}/tree-management`,
      },
      {
        label: "Planting Records",
        icon: <TreePine className="w-4 h-4 mr-1" />,
        path: `${basePath}/planting-records`,
      },
      {
        label: "Fee Records",
        icon: <Receipt className="w-4 h-4 mr-1" />,
        path: `${basePath}/fee-records`,
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
  ];
}

export default function TopNavBarContainer({
  dashboardType,
}: TopNavBarContainerProps) {
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  // Use separate selectors to avoid infinite re-render
  const clearToken = useAuthStore(state => state.clearToken);
  const roles = useAuthStore(state => state.roles);

  const handleSignOut = async () => {
    await signOut();
    clearToken();
    toast.success("Signed out successfully");
    navigate({ to: "/" });
  };

  // --- Dashboard Switch Dropdown Logic ---
  const dashboardRoleMap = [
    { role: "admin", label: "Admin Dashboard", path: "/admin/overview" },
    {
      role: "air_quality",
      label: "Air Quality",
      path: "/air-quality/overview",
    },
    {
      role: "tree_management",
      label: "Urban Greening",
      path: "/urban-greening/overview",
    },
    {
      role: "government_emission",
      label: "Government Emission",
      path: "/government-emission/overview",
    },
  ];

  // Determine dashboards based on persisted auth store roles
  // Use persisted auth store roles for switch dashboard
  // Build switch dashboard dropdown only when user has roles
  const userRoles: string[] = roles || [];
  // Remove debug log
  // console.log("Auth store roles:", userRoles);

  let switchDashboardDropdown: NavItem | null = null;

  if (userRoles.length > 0) {
    const userDashboards = dashboardRoleMap.filter(d => userRoles.includes(d.role));
    // For admin, all dashboards; else only userDashboards
    const dashboardsToShow = userRoles.includes("admin") ? dashboardRoleMap : userDashboards;
    // Determine current dashboard
    const current = dashboardRoleMap.find(d => d.path.includes(`/${dashboardType}`));

    switchDashboardDropdown = {
      label: (
        <span className="flex items-center">
          <Building className="w-4 h-4 mr-1" />
          Switch Dashboard
        </span>
      ),
      onClick: () => navigate({ to: "/dashboard-selection" }),
      children: dashboardsToShow.map(d => (
        <button
          key={d.role}
          className="block w-full text-left px-4 py-2 hover:bg-gray-600 uppercase"
          onClick={() => navigate({ to: d.path })}
        >
          {d.label}
        </button>
      )),
    };
  }

  const menuItems: NavItem[] = getMenuItems(dashboardType, matchRoute).map(
    (item) => {
      if (item.children) {
        // If children exist, map them to buttons for dropdown
        return {
          label: (
            <span className="flex items-center">
              {item.icon}
              {item.label}
            </span>
          ),
          active: !!matchRoute({ to: item.path, fuzzy: false }),
          onClick: () => navigate({ to: item.path }),
          children: item.children.map((child: any) => (
            <button
              key={child.path}
              className="block w-full text-left px-4 py-2 hover:bg-gray-600 uppercase"
              onClick={() => navigate({ to: child.path })}
            >
              <span className="flex items-center">
                {child.icon}
                {child.label}
              </span>
            </button>
          )),
        };
      }
      return {
        label: (
          <span className="flex items-center">
            {item.icon}
            {item.label}
          </span>
        ),
        active: !!matchRoute({ to: item.path, fuzzy: false }),
        onClick: () => navigate({ to: item.path }),
      };
    }
  );

  // Don't add switch dashboard to main menu items
  const allMenuItems: NavItem[] = menuItems;

  // Remove debug logs
  // console.log("Switch dashboard dropdown:", switchDashboardDropdown);
  // console.log("All menu items:", allMenuItems);

  // Account actions (right-aligned) - include switch dashboard if available
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
    // Add switch dashboard to account items if it exists
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
      <TopNavBar items={allMenuItems} className="flex-1" />
      <TopNavBar items={accountItems} className="justify-end flex-1" />
    </div>
  );
}
