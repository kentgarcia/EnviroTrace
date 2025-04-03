
import { SignInForm } from "@/components/auth/SignInForm";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";

export default function SignIn() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const authData = localStorage.getItem("ems-auth");
    if (authData) {
      const { isAuthenticated } = JSON.parse(authData);
      if (isAuthenticated) {
        navigate("/dashboard-selection");
      }
    }
  }, [navigate]);

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
