import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./lib/router";

// Lazy loaded components
const NetworkStatus = lazy(() => import("./components/layout/NetworkStatus").then(module => ({
  default: module.NetworkStatus
})));

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <RouterProvider router={router} />
    <Suspense fallback={null}>
      <NetworkStatus />
    </Suspense>
  </TooltipProvider>
);

export default App;
