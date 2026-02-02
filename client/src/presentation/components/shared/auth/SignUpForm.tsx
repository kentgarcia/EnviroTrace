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
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useRegister } from "@/core/api/auth-service";
import { useForm } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import {
  Alert,
  AlertDescription,
} from "@/presentation/components/shared/ui/alert";

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignUpForm() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>();

  const password = watch("password");

  const onSignUp = async (data: SignUpFormData) => {
    // Clear any previous errors
    setAuthError(null);

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      setAuthError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      // Registration successful - redirect to verify email page
      toast.success("Registration successful! Please check your email for verification code.");

      // Store password temporarily for resend functionality (sessionStorage cleared on tab close)
      sessionStorage.setItem('signup_password', data.password);
      sessionStorage.setItem('signup_email', data.email);

      setTimeout(() => {
        navigate({ 
          to: "/verify-email", 
          search: { email: data.email } 
        });
      }, 1000);
    } catch (error: any) {
      console.error("Registration error:", error);

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
      let errorMessage = "Failed to register. Please try again.";

      // Check for network errors
      if (error?.code === "ERR_NETWORK" || error?.message?.includes("Network Error")) {
        errorMessage = "Cannot connect to the backend server. Please make sure the server is running.";
      }
      // Check for duplicate email
      else if (errorDetail.includes("already exists") || errorDetail.includes("duplicate") || error?.response?.status === 409) {
        // If verification expired, tell user to retry signup
        if (errorDetail.includes("verification expired") || errorDetail.includes("sign up again")) {
          errorMessage = errorDetail;  // Use backend's exact message
        }
        // If user already verified and in system, tell them to sign in
        else if (errorDetail.includes("already exists in the system") || errorDetail.includes("Please sign in instead")) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
        } 
        // Otherwise, retry signup
        else {
          errorMessage = errorDetail || "Please try signing up again.";
        }
      }
      // Check for validation errors
      else if (error?.response?.status === 422) {
        errorMessage = "Invalid email or password format. Password must be at least 8 characters.";
      }
      // Use backend error message if available
      else if (errorDetail) {
        errorMessage = errorDetail;
      }

      setAuthError(errorMessage);
      toast.error(errorMessage);
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
          Create Account
        </CardTitle>
        <CardDescription className="text-center text-base">
          Sign up for EnviroTrace to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        {authError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSignUp)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={registerMutation.isPending}
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
                placeholder="Create a strong password"
                autoComplete="new-password"
                disabled={registerMutation.isPending}
                className="pr-10"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: "Password must contain uppercase, lowercase, and number",
                  },
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={registerMutation.isPending}
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
            <p className="text-xs text-muted-foreground">
              At least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={registerMutation.isPending}
                className="pr-10"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={registerMutation.isPending}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 pt-6 border-t">
        <div className="text-sm text-center">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
        <div className="text-xs text-center text-muted-foreground leading-relaxed">
          By signing up, you agree to our{" "}
          <Link
            to="/terms"
            className="text-primary hover:underline font-medium"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
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
