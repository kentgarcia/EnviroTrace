
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";

type FormMode = 'sign-in' | 'sign-up';

interface SignInFormData {
  email: string;
  password: string;
}

interface SignUpFormData extends SignInFormData {
  fullName: string;
  confirmPassword: string;
}

export function SignInForm() {
  const [mode, setMode] = useState<FormMode>('sign-in');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const {
    register: registerSignIn,
    handleSubmit: handleSubmitSignIn,
    formState: { errors: errorsSignIn }
  } = useForm<SignInFormData>();

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: { errors: errorsSignUp },
    watch: watchSignUp
  } = useForm<SignUpFormData>();

  const password = watchSignUp ? watchSignUp("password") : "";

  const onSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    
    try {
      await signIn(data.email, data.password);
      toast.success("Signed in successfully!");
      navigate("/dashboard-selection");
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    
    try {
      await signUp(data.email, data.password, data.fullName);
      toast.success("Account created! Please check your email for verification.");
      setMode('sign-in');
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
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
        <CardTitle className="text-2xl text-center">Environmental Management System</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitSignIn(onSignIn)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...registerSignIn("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />
            {errorsSignIn.email && (
              <p className="text-sm text-destructive">{errorsSignIn.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              {...registerSignIn("password", { required: "Password is required" })}
            />
            {errorsSignIn.password && (
              <p className="text-sm text-destructive">{errorsSignIn.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : "Sign in"}
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
