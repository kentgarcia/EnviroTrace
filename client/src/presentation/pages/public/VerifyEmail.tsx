import { useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/presentation/components/shared/ui/input-otp";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "/verify-email" });
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState((searchParams as any)?.email || sessionStorage.getItem('signup_email') || "");
  const [password, setPassword] = useState(sessionStorage.getItem('signup_password') || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Clear stored password on successful verification or unmount
  useEffect(() => {
    return () => {
      // Don't clear on unmount - user might navigate back
    };
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (!email || otp.length < 6) {
      toast.error("Please enter your email and verification code");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Verification failed");
      }

      // Check if account needs approval
      if (data.message && data.message.includes("pending admin approval")) {
        // Clear stored credentials after successful verification
        sessionStorage.removeItem('signup_password');
        sessionStorage.removeItem('signup_email');
        toast.success("Email verified successfully!");
        navigate({ to: "/pending-approval", search: { email } });
      } else {
        // Clear stored credentials after successful verification
        sessionStorage.removeItem('signup_password');
        sessionStorage.removeItem('signup_email');
        // Super admin or pre-approved account - redirect to dashboard
        toast.success("Email verified! You can now sign in.");
        navigate({ to: "/", search: { email } });
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsResending(true);

    try {
      const requestBody: any = { email };
      
      // Include password if available (enables automatic signup retry)
      if (password) {
        requestBody.password = password;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to resend code");
      }

      toast.success(data.message || "Verification code sent to your email!");
      setCanResend(false);
      setCountdown(60);
    } catch (error: any) {
      console.error("Resend error:", error);
      toast.error(error.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg_login.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-ems-green-900/40 via-ems-blue-900/30 to-black/50" />
      
      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          {/* Branding header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">EnviroTrace</h1>
            <p className="text-white/80 text-sm">Environmental Management System</p>
          </div>
          
          {/* Verify email form */}
          <Card className="w-full backdrop-blur-sm bg-white/95">
            <CardHeader className="space-y-3 pb-4">
              <div className="flex justify-center mb-2">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                Verify Your Email
              </CardTitle>
              <CardDescription className="text-center text-base">
                Enter the 6-digit code sent to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isVerifying}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-center block">
                  Verification Code
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={8}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={isVerifying}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                      <InputOTPSlot index={6} />
                      <InputOTPSlot index={7} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Check your email inbox and spam folder
                </p>
              </div>

              <Button 
                onClick={handleVerify} 
                className="w-full" 
                disabled={isVerifying || otp.length < 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResend}
                  disabled={!canResend || isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {canResend ? "Resend Code" : `Resend in ${countdown}s`}
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate({ to: "/" })}
                  disabled={isVerifying}
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Footer tagline */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-xs">
              © 2025 Environmental Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
