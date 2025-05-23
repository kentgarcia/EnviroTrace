import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/core/api/auth";
import { SignInForm } from "@/presentation/components/shared/auth/SignInForm";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/images/bg_login.png')" }}
    >
      <div className="w-full max-w-md animate-fade-in">
        <SignInForm />
      </div>
    </div>
  );
}
