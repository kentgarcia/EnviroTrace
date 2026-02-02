import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import {
  LogOut,
  User,
  Building,
} from "lucide-react";
import { useAuth } from "@/core/api/auth";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { toast } from "sonner";
import TopNavBar, { NavItem } from "./TopNavBar";
import React from "react";

interface TopNavBarContainerProps {
  dashboardType:
  | "urban-greening"
  | "government-emission"
  | "admin"
  ;
}

interface MenuItem {
  label: string;
  path: string;
  children?: { label: string; path: string }[];
}

function getMenuItems(
  dashboardType: TopNavBarContainerProps["dashboardType"],
  matchRoute: ReturnType<typeof useMatchRoute>
): MenuItem[] {
  const basePath = `/${dashboardType}`;
  if (dashboardType === "admin") {
    return [
      {
        label: "Overview",
        path: `${basePath}/overview`,
      },
      {
        label: "Users",
        path: `${basePath}/user-management`,
      },
      {
        label: "Sessions",
        path: `${basePath}/session-management`,
      },
    ];
  } else if (dashboardType === "government-emission") {
    return [
      {
        label: "Dashboard",
        path: `${basePath}/overview`,
      },
      {
        label: "Vehicles",
        path: `${basePath}/vehicles`,
      },
      {
        label: "Testing",
        path: `${basePath}/quarterly-testing`,
      },
      {
        label: "Offices",
        path: `${basePath}/offices`,
      },
      {
        label: "Reports",
        path: `${basePath}/reports`,
      },
    ];
  } else if (dashboardType === "urban-greening") {
    return [
      {
        label: "Dashboard",
        path: `${basePath}/overview`,
      },
      {
        label: "Tree Inventory",
        path: `${basePath}/tree-inventory`,
      },
      {
        label: "Tree Requests",
        path: `${basePath}/tree-requests`,
      },
      {
        label: "Greening Projects",
        path: `${basePath}/greening-projects`,
      },
      {
        label: "Fees",
        path: `${basePath}/fee-records`,
      },
    ];
  }
  // Default/common items
  return [
    {
      label: "Dashboard",
      path: `${basePath}/overview`,
    },
    {
      label: "Records",
      path: `${basePath}/records`,
    },
    {
      label: "Reports",
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
  const clearToken = useAuthStore(state => state.clearToken);
  const roles = useAuthStore(state => state.roles);
  const isSuperAdmin = useAuthStore(state => state.isSuperAdmin);

  const handleSignOut = async () => {
    await signOut();
    clearToken();
    toast.success("Signed out successfully");
    navigate({ to: "/" });
  };

  const userRoles: string[] = roles || [];

  const dashboardRoleMap = [
    { role: "admin", label: "Admin Dashboard", path: "/admin/overview" },
    {
      role: "urban_greening",
      label: "Urban Greening",
      path: "/urban-greening/overview",
    },
    {
      role: "government_emission",
      label: "Government Emission",
      path: "/government-emission/overview",
    },
  ];

  const userDashboards = dashboardRoleMap.filter(d => userRoles.includes(d.role));
  // Super admins and admins see all dashboards, otherwise only user's assigned dashboards
  const dashboardsToShow = isSuperAdmin || userRoles.includes("admin") ? dashboardRoleMap : userDashboards;

  const menuItems: NavItem[] = getMenuItems(dashboardType, matchRoute).map(
    (item) => {
      if (item.children) {
        return {
          label: item.label,
          active: !!matchRoute({ to: item.path, fuzzy: true }),
          onClick: () => navigate({ to: item.path }),
          children: item.children.map((child) => (
            <button
              key={child.path}
              className="flex items-center w-full text-left px-4 py-2 hover:bg-slate-50 uppercase"
              onClick={() => navigate({ to: child.path })}
            >
              {child.label}
            </button>
          )),
        };
      }
      return {
        label: item.label,
        active: !!matchRoute({ to: item.path, fuzzy: true }),
        onClick: () => navigate({ to: item.path }),
      };
    }
  );

  const accountItems: NavItem[] = [
    ...(dashboardsToShow.length > 0 ? [
      {
        label: "Switch",
        onClick: () => navigate({ to: "/dashboard-selection" }),
        children: dashboardsToShow.map(d => (
          <button
            key={d.role}
            className="flex items-center w-full text-left px-5 py-3.5 text-[13px] font-black uppercase tracking-widest text-slate-800 hover:text-main hover:bg-slate-50 transition-all border-0"
            onClick={() => navigate({ to: d.path })}
          >
            <Building className="w-4 h-4 mr-3 text-main" />
            {d.label}
          </button>
        )),
      }
    ] : []),
    {
      label: "Account",
      children: [
        <button
          key="profile"
          className="flex items-center w-full text-left px-5 py-3.5 text-[13px] font-black uppercase tracking-widest text-slate-800 hover:text-main hover:bg-slate-50 transition-all border-0"
          onClick={() => navigate({ to: "/profile" })}
        >
          <User className="w-4 h-4 mr-3 text-main" />
          Profile
        </button>,
        <button
          key="logout"
          className="flex items-center w-full text-left px-5 py-3.5 text-[13px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-all border-0"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </button>
      ],
    },
  ];

  return (
    <header className="w-full bg-main border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4 min-h-[64px] sm:min-h-[80px] px-3 sm:px-6 py-2">
        <div className="hidden md:flex justify-start">
          <Link to="/dashboard-selection" className="flex items-center gap-2 sm:gap-3 group">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <img src="/images/logo_munti.png" alt="Muntinlupa Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              <img src="/images/logo_epnro.png" alt="EPNRO Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            </div>
            <div className="flex flex-col border-l border-white/20 pl-2 sm:pl-3">
              <span className="text-white font-black text-sm sm:text-base lg:text-lg leading-none tracking-tighter">ENVIROTRACE</span>
            </div>
          </Link>
        </div>
        
        <div className="flex justify-center order-3 w-full sm:order-2 sm:w-auto sm:flex-1">
          <TopNavBar items={menuItems} />
        </div>
        
        <div className="flex justify-end order-2 sm:order-3">
          <TopNavBar items={accountItems} />
        </div>
      </div>
    </header>
  );
}
