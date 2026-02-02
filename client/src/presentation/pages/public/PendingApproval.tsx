import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import { Clock, CheckCircle2, Mail, Home } from "lucide-react";

export default function PendingApproval() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "/pending-approval" });
  const email = searchParams?.email || "";

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
          
          {/* Pending approval card */}
          <Card className="w-full backdrop-blur-sm bg-white/95">
            <CardHeader className="space-y-3 pb-4">
              <div className="flex justify-center mb-2">
                <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                Account Pending Approval
              </CardTitle>
              <CardDescription className="text-center text-base">
                Your email has been verified successfully!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status steps */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Email Verified</p>
                    <p className="text-xs text-muted-foreground">
                      {email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Awaiting Admin Approval</p>
                    <p className="text-xs text-muted-foreground">
                      Your account is being reviewed by an administrator
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-50">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                    <Home className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Access Granted</p>
                    <p className="text-xs text-muted-foreground">
                      You'll be able to sign in once approved
                    </p>
                  </div>
                </div>
              </div>

              {/* Information box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">
                      What happens next?
                    </p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      An administrator will review your account and send you an email notification once approved. 
                      This typically takes 1-2 business days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate({ to: "/" })}
                >
                  Back to Sign In
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  You can close this page. We'll email you when your account is ready.
                </p>
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
