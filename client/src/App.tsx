import { Toaster } from "@/presentation/components/shared/ui/toaster";
import { Toaster as Sonner } from "@/presentation/components/shared/ui/sonner";
import { TooltipProvider } from "@/presentation/components/shared/ui/tooltip";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./presentation/routeTree";
import { QueryProvider } from "./core/api/query-provider";

const App = () => (
  <QueryProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryProvider>
);

export default App;
