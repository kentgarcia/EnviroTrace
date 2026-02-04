import { useEffect } from "react";
import { Toaster } from "@/presentation/components/shared/ui/toaster";
import { Toaster as Sonner } from "@/presentation/components/shared/ui/sonner";
import { TooltipProvider } from "@/presentation/components/shared/ui/tooltip";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./presentation/routeTree";
import { QueryProvider } from "./core/api/query-provider";
import { useSettingsStore } from "./core/hooks/useSettingsStore";

const App = () => {
  const fontSize = useSettingsStore((state) => state.fontSize);

  useEffect(() => {
    document.documentElement.setAttribute("data-font-size", fontSize);
  }, [fontSize]);

  return (
    <QueryProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryProvider>
  );
};

export default App;
