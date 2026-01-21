import React from "react";
import { Outlet } from "@tanstack/react-router";
import SideNavBarContainer from "./SideNavBarContainer";
import { NetworkStatus } from "./NetworkStatus";

interface DashboardLayoutProps {
  dashboardType: "urban-greening" | "government-emission" | "admin";
}

export default function DashboardLayout({ dashboardType }: DashboardLayoutProps) {
  return (
    <div className="flex h-full w-full bg-[#F9FBFC]">
      <SideNavBarContainer dashboardType={dashboardType} className="shrink-0" />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Outlet />
        <NetworkStatus />
      </main>
    </div>
  );
}
