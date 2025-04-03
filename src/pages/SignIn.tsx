
import { SignInForm } from "@/components/auth/SignInForm";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function SignIn() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard-selection");
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-ems-green-100 to-ems-blue-100 p-4">
      <div className="w-full max-w-md mb-8 flex flex-col items-center animate-fade-in">
        <div className="bg-primary rounded-full p-4 mb-3">
          <Leaf className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Environmental Management System</h1>
        <p className="text-muted-foreground mt-2 text-center">
          Monitor and manage environmental metrics for sustainable development
        </p>
      </div>
      <div className="w-full max-w-md animate-fade-in">
        <SignInForm />
      </div>
    </div>
  );
}
