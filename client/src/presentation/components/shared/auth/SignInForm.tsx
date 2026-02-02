import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import { toast } from "sonner";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/core/api/auth-service";
import { useForm } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import {
  Alert,
  AlertDescription,
} from "@/presentation/components/shared/ui/alert";

interface SignInFormData {
  email: string;
  password: string;
  rememberEmail: boolean;
}

export function SignInForm() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignInFormData>({
    defaultValues: {
      rememberEmail: true,
    },
  });

  const rememberEmail = watch("rememberEmail");

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setValue("email", rememberedEmail);
      setValue("rememberEmail", true);
    }
  }, [setValue]);
  const onSignIn = async (data: SignInFormData) => {
    // Clear any previous errors
    setAuthError(null);

    // Handle email remembering
    if (data.rememberEmail) {
      localStorage.setItem("rememberedEmail", data.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

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
    } catch (error: any) {
      console.error("Authentication error:", error);

      // Extract error detail from backend response
      let errorDetail = "";
      if (error?.response?.data?.detail) {
        errorDetail = typeof error.response.data.detail === "string" 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      } else if (error?.message) {
        errorDetail = error.message;
      }

      // Set a user-friendly error message
      let errorMessage = "Failed to sign in. Please check your credentials.";
      let shouldRedirect = false;
      let redirectPath = "";
      let redirectEmail = data.email;

      // Check for network errors
      if (error?.code === "ERR_NETWORK" || error?.message?.includes("Network Error")) {
        errorMessage = "Cannot connect to the backend server. Please make sure the server is running.";
      }
      // Check for EMAIL_NOT_VERIFIED (403 with specific error code)
      else if (errorDetail.includes("EMAIL_NOT_VERIFIED")) {
        shouldRedirect = true;
        redirectPath = "/verify-email";
        toast.info("Please verify your email address");
      }
      // Check for PENDING_APPROVAL (403 with specific error code)
      else if (errorDetail.includes("PENDING_APPROVAL")) {
        shouldRedirect = true;
        redirectPath = "/pending-approval";
        toast.info("Your account is pending admin approval");
      }
      // Check for 401 Unauthorized
      else if (error?.response?.status === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      }
      // Check for 404 Not Found (user doesn't exist)
      else if (error?.response?.status === 404) {
        errorMessage = "User not found. Please complete registration.";
      }
      // Use backend error message if available
      else if (errorDetail) {
        // Clean up error message (remove error code prefixes)
        errorMessage = errorDetail
          .replace("EMAIL_NOT_VERIFIED:", "")
          .replace("PENDING_APPROVAL:", "")
          .trim();
      }

      if (shouldRedirect && redirectPath) {
        // Redirect to appropriate page
        setTimeout(() => {
          navigate({ to: redirectPath, search: { email: redirectEmail } });
        }, 500);
      } else {
        setAuthError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/95">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img
            src="/images/logo_munti.png"
            alt="Muntinlupa Logo"
            className="h-14 w-14 rounded-lg"
          />
          <img
            src="/images/logo_epnro.png"
            alt="EPNRO Logo"
            className="h-14 w-14 rounded-lg"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center text-base">
          Sign in to access your environmental dashboard
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                disabled={loginMutation.isPending}
                className="pr-10"
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="password"
                {...register("password", { required: "Password is required" })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loginMutation.isPending}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberEmail"
              checked={rememberEmail}
              onCheckedChange={(checked) => setValue("rememberEmail", !!checked)}
              disabled={loginMutation.isPending}
            />
            <Label htmlFor="rememberEmail" className="text-sm font-normal cursor-pointer">
              Remember my email
            </Label>
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
      <CardFooter className="flex flex-col space-y-3 pt-6 border-t">
        <div className="text-sm text-center">
          Don't have an account?{" "}
          <Link
            to="/sign-up"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>
        <div className="text-xs text-center text-muted-foreground leading-relaxed">
          By signing in, you agree to our{" "}
          <Link
            to="/terms"
            className="text-primary hover:underline font-medium"
          >
            Terms of Service
          </Link>
          {" "}and{" "}
          <Link
            to="/privacy"
            className="text-primary hover:underline font-medium"
          >
            Privacy Policy
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
