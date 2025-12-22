import { Button } from "@/presentation/components/shared/ui/button";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Leaf, ArrowLeft, Home, Search } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const { location } = useRouterState();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-500 to-primary" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 md:p-10 text-center relative z-10"
      >
        <div className="mb-8 relative inline-block">
          <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto rotate-6">
            <div className="relative">
              <Search className="w-12 h-12 text-emerald-600 -rotate-6" />
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold text-slate-800">Page Not Found</h2>
          <p className="text-slate-500 leading-relaxed">
            The page you are looking for doesn't exist or has been moved to a new location.
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full h-11 font-semibold">
            <button onClick={() => navigate({ to: "/dashboard-selection" })}>
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </button>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full h-11 border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-widest">
            <Leaf className="h-3 w-3 text-emerald-500" />
            EnviroTrace Navigator
          </div>
        </div>
      </motion.div>

      <p className="mt-8 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} Environmental Management System
      </p>
    </div>
  );
};

export default NotFound;
