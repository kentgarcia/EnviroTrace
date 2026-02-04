import React, { useState, useEffect } from "react";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  History,
  Car,
  TestTube,
  Building2,
  FileText,
  Trees,
  ClipboardList,
  Sprout,
  Banknote,
  LogOut,
  User,
  ArrowRightLeft,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Info,
  HelpCircle,
  Leaf,
  Shield,
  KeyRound
} from "lucide-react";
import { useAuth } from "@/core/api/auth";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { useMyProfile } from "@/core/api/profile-service";
import { toast } from "sonner";
import SideNavBar, { NavItem } from "./SideNavBar";
import { cn } from "@/core/utils/utils";
import { PERMISSIONS } from "@/core/utils/permissions";

interface SideNavBarContainerProps {
  dashboardType:
  | "urban-greening"
  | "government-emission"
  | "admin";
  className?: string;
}

interface MenuItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: { label: string; path: string }[];
  permission?: string;
  hidden?: boolean;
}

function getMenuItems(
  dashboardType: SideNavBarContainerProps["dashboardType"],
  hasPermission: (permission: string) => boolean,
  isSuperAdmin: boolean = false
): MenuItem[] {
  const basePath = `/${dashboardType}`;
  
  if (dashboardType === "admin") {
    const adminMenuItems = [
      {
        label: "Overview",
        path: `${basePath}/overview`,
        icon: <LayoutDashboard size={18} />,
      },
      {
        label: "Users",
        path: `${basePath}/user-management`,
        icon: <Users size={18} />,
        permission: PERMISSIONS.USER_ACCOUNT.VIEW,
      },
      {
        label: "Permissions",
        path: `${basePath}/permission-management`,
        icon: <KeyRound size={18} />,
        hidden: !isSuperAdmin,
      },
      {
        label: "Sessions",
        path: `${basePath}/session-management`,
        icon: <History size={18} />,
        permission: PERMISSIONS.SESSION.VIEW,
      },
      {
        label: "Audit Logs",
        path: `${basePath}/audit-logs`,
        icon: <Shield size={18} />,
        permission: PERMISSIONS.AUDIT_LOG.VIEW,
      },
      {
        label: "Settings",
        path: `${basePath}/settings`,
        icon: <Settings size={18} />,
      },
    ];
    
    // Filter menu items based on permissions and hidden flag
    return adminMenuItems.filter(item => 
      (!item.permission || hasPermission(item.permission)) && 
      !item.hidden
    );
  } else if (dashboardType === "government-emission") {
    return [
      {
        label: "Dashboard",
        path: `${basePath}/overview`,
        icon: <LayoutDashboard size={18} />,
      },
      {
        label: "Vehicles",
        path: `${basePath}/vehicles`,
        icon: <Car size={18} />,
      },
      {
        label: "Testing",
        path: `${basePath}/quarterly-testing`,
        icon: <TestTube size={18} />,
      },
      {
        label: "Offices",
        path: `${basePath}/offices`,
        icon: <Building2 size={18} />,
      },
      {
        label: "Reports",
        path: `${basePath}/reports`,
        icon: <FileText size={18} />,
      },
      {
        label: "Settings",
        path: `${basePath}/settings`,
        icon: <Settings size={18} />,
      },
    ];
  } else if (dashboardType === "urban-greening") {
    return [
      {
        label: "Dashboard",
        path: `${basePath}/overview`,
        icon: <LayoutDashboard size={18} />,
      },
      {
        label: "Tree Inventory",
        path: `${basePath}/tree-inventory`,
        icon: <Trees size={18} />,
      },
      {
        label: "Tree Requests",
        path: `${basePath}/tree-requests`,
        icon: <ClipboardList size={18} />,
      },
      {
        label: "Greening Projects",
        path: `${basePath}/greening-projects`,
        icon: <Sprout size={18} />,
      },
      {
        label: "Species Management",
        path: `${basePath}/species`,
        icon: <Leaf size={18} />,
      },
      {
        label: "Fees",
        path: `${basePath}/fee-records`,
        icon: <Banknote size={18} />,
      },
      {
        label: "Reports",
        path: `${basePath}/reports`,
        icon: <FileText size={18} />,
      },
      {
        label: "Settings",
        path: `${basePath}/settings`,
        icon: <Settings size={18} />,
      },
    ];
  }
  // Default/common items
  return [
    {
      label: "Dashboard",
      path: `${basePath}/overview`,
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Records",
      path: `${basePath}/records`,
      icon: <ClipboardList size={18} />,
    },
    {
      label: "Reports",
      path: `${basePath}/reports`,
      icon: <FileText size={18} />,
    },
  ];
}

export default function SideNavBarContainer({
  dashboardType,
  className
}: SideNavBarContainerProps) {
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const clearToken = useAuthStore(state => state.clearToken);
  const roles = useAuthStore(state => state.roles);
  const isSuperAdmin = useAuthStore(state => state.isSuperAdmin);
  const hasPermission = useAuthStore(state => state.hasPermission);
  const { data: profile } = useMyProfile();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

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

  const menuItems: NavItem[] = getMenuItems(dashboardType, hasPermission, isSuperAdmin).map(
    (item) => ({
      label: item.label,
      icon: item.icon,
      active: !!matchRoute({ to: item.path, fuzzy: true }),
      onClick: () => navigate({ to: item.path }),
      children: item.children?.map((child) => (
        <button
          key={child.path}
          onClick={() => navigate({ to: child.path })}
        >
          {child.label}
        </button>
      )),
    })
  );

  const bottomItems: NavItem[] = [
    ...(dashboardsToShow.length > 0 ? [{
      label: "Switch Dashboard",
      icon: <ArrowRightLeft size={18} />,
      children: dashboardsToShow.map(d => (
        <button
          key={d.role}
          onClick={() => navigate({ to: d.path })}
        >
          {d.label}
        </button>
      ))
    }] : []),
    {
      label: "Profile",
      icon: <User size={18} />,
      onClick: () => navigate({ to: "/profile" })
    },
    {
      label: "Logout",
      icon: <LogOut size={18} />,
      onClick: handleSignOut
    }
  ];

  return (
    <aside className={cn(
      "bg-[#0f172a] border-r border-slate-800 flex flex-col h-full text-white transition-all duration-100 ease-in-out relative group/sidebar",
      isCollapsed ? "w-[72px]" : "w-64",
      className
    )}>
      {/* Collapse Toggle - Moved inside sidebar */}
      <div className={cn(
          "h-14 flex items-center px-4 w-full cursor-pointer hover:bg-white/5 transition-colors border-b border-slate-800",
           isCollapsed ? "justify-center" : "justify-between"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {!isCollapsed && (
          <div className="flex flex-col">
             <span className="font-bold text-sm tracking-tight text-white/90 truncate max-w-[180px]">
               {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : 'EnviroTrace'}
             </span>
             {profile?.jobTitle && (
               <span className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">
                 {profile.jobTitle}
               </span>
             )}
          </div>
        )}
        <button
          className="text-slate-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-6 pt-4">
        <div>
           {!isCollapsed && (
            <h3 className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Menu
            </h3>
          )}
          <SideNavBar 
            items={menuItems} 
            variant="dark" 
            isCollapsed={isCollapsed}
            onExpand={() => setIsCollapsed(false)}
          />
        </div>
      </div>

      <div className="p-3 border-t border-slate-800 bg-[#0f172a]">
        <SideNavBar 
          items={bottomItems} 
          variant="dark" 
          isCollapsed={isCollapsed} 
          onExpand={() => setIsCollapsed(false)}
        />
      </div>
    </aside>
  );
}
