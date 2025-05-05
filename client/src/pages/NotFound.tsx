import { Button } from "@/components/ui/button";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Leaf } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-ems-green-100 to-ems-blue-100 p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-xs">
        <div className="flex justify-center mb-4">
          <div className="bg-primary rounded-full p-2">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-6">Page not found</p>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate({ to: "/" })}>Go to Sign In</Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
