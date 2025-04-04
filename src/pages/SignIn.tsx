
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
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2000&q=80')" }}
    >
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Placeholder for the first logo */}
              <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                Logo 1
              </div>
              {/* Placeholder for the second logo */}
              <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                Logo 2
              </div>
            </div>
            
            <div className="bg-primary rounded-full p-4 mb-3">
              <Leaf className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-center">Environmental Management System</h1>
          </div>
          
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
