import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { useLogin } from "@/core/api/auth-service";
import { useForm } from "react-hook-form";
import {
  Alert,
  AlertDescription,
} from "@/presentation/components/shared/ui/alert";

interface SignInFormData {
  email: string;
  password: string;
}

export function SignInForm() {
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>();
  const onSignIn = async (data: SignInFormData) => {
    // Clear any previous errors
    setAuthError(null);

    try {
      const result = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password
      });

      if (result && result.access_token) {
        toast.success("Signed in successfully!");

        // Small delay before navigation to allow the toast to be seen
        setTimeout(() => {
          navigate({ to: "/dashboard-selection" });
        }, 300);
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error: unknown) {
      console.error("Authentication error:", error);

      // Set a user-friendly error message
      let errorMessage = "Failed to sign in. Please check your credentials.";
      if (error instanceof Error) {
        if (error.message.includes("Network Error")) {
          errorMessage = "Cannot connect to the backend server. Please make sure the server is running at http://localhost:8000.";
        } else if (error.message.includes("401")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setAuthError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <img
            src="/images/logo_munti.png"
            alt="Logo 1"
            className="h-16 w-16 rounded-md"
          />
          <img
            src="/images/logo_epnro.png"
            alt="Logo 2"
            className="h-16 w-16 rounded-md"
          />
        </div>
        <CardTitle className="text-2xl text-center">
          Environmental Management System
        </CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        {authError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSignIn)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com" autoComplete="email"
              disabled={loginMutation.isPending}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password" placeholder="Password"
              autoComplete="current-password"
              disabled={loginMutation.isPending}
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>Sign in</>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground mt-2">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </CardFooter>
    </Card>
  );
}
