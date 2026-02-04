import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/core/api/auth";
import { SignInForm } from "@/presentation/components/shared/auth/SignInForm";
import { Shield } from "lucide-react";
import { FloatingAppearanceSettings } from "@/presentation/components/shared/settings/FloatingAppearanceSettings";

export default function SignIn() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate({ to: "/dashboard-selection" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ems-green-50 via-white to-ems-blue-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg_login.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-ems-green-900/40 via-ems-blue-900/30 to-black/50" />
      
      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          {/* Branding header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">EnviroTrace</h1>
            <p className="text-white/80 text-sm">Environmental Management System</p>
          </div>
          
          {/* Sign in form */}
          <SignInForm />
          
          {/* Footer tagline */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-xs">
              © 2025 Environmental Management System
            </p>
          </div>
        </div>
      </div>

      {/* Floating Appearance Settings */}
      <FloatingAppearanceSettings />
    </div>
  );
}
