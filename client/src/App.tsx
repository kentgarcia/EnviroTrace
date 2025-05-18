import { Toaster } from "@/presentation/components/shared/ui/toaster";
import { Toaster as Sonner } from "@/presentation/components/shared/ui/sonner";
import { TooltipProvider } from "@/presentation/components/shared/ui/tooltip";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./presentation/routeTree";
import TitleBar from "./presentation/components/shared/layout/TitleBar";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <TitleBar />
    <div
      style={{
        paddingTop: 30,
        overflow: "auto",
        height: "100%",
      }}
    >
      <RouterProvider router={router} />
    </div>
  </TooltipProvider>
);

export default App;
