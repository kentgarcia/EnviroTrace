
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // This is a mock authentication - in a real app, this would connect to a backend
      // For demonstration, we'll simulate different user roles
      const role = determineUserRole(email);
      
      // Save the authentication state
      localStorage.setItem("ems-auth", JSON.stringify({ 
        email, 
        isAuthenticated: true,
        role: role
      }));
      
      toast.success("Signed in successfully!");
      
      // Navigate to the dashboard selection page
      navigate("/dashboard-selection");
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock function to determine user role based on email
  const determineUserRole = (email: string): string[] => {
    const domain = email.split("@")[1]?.toLowerCase();
    
    if (email.includes("admin")) {
      return ["air-quality", "tree-management", "government-emission"];
    } else if (email.includes("air") || domain === "airquality.org") {
      return ["air-quality"];
    } else if (email.includes("tree") || domain === "forestry.org") {
      return ["tree-management"];
    } else if (email.includes("gov") || domain === "government.org") {
      return ["government-emission"];
    }
    
    // Default role if none of the above match
    return ["air-quality"];
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="bg-primary rounded-full p-2">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Sign in to EMS</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm text-ems-blue-600 hover:text-ems-blue-500">
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-gray-500 mt-2">
          Demo credentials for testing:
        </div>
        <div className="text-xs text-center text-gray-500">
          <div>admin@example.com (All access)</div>
          <div>air@airquality.org (Air Quality)</div>
          <div>tree@forestry.org (Tree Management)</div>
          <div>gov@government.org (Government Emission)</div>
          <div>Password: any password will work</div>
        </div>
      </CardFooter>
    </Card>
  );
}
