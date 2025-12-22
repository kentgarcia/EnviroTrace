import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { ArrowLeft, FileText, Shield, Users, AlertCircle } from "lucide-react";

export default function TermsOfService() {
  const sections = [
    {
      icon: Shield,
      title: "1. Access and Use",
      content: "Access to the Environmental Management System (EMS) is limited to authorized users only. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account."
    },
    {
      icon: FileText,
      title: "2. Data and Privacy",
      content: "EMS processes environmental and operational data necessary for system functionality. We collect and process data in accordance with applicable data protection laws. Please refer to our Privacy Policy for detailed information on how your data is collected, used, and protected."
    },
    {
      icon: AlertCircle,
      title: "3. Acceptable Use",
      content: "You agree not to misuse the EMS platform or attempt to disrupt its operation. Prohibited activities include unauthorized access attempts, data manipulation, sharing of credentials, and any actions that could compromise system security or integrity. Violations may result in account termination."
    },
    {
      icon: Users,
      title: "4. Changes to Terms",
      content: "We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of EMS after changes are posted constitutes acceptance of the modified terms. We recommend reviewing these terms periodically."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ems-green-50 via-white to-ems-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using the Environmental Management System.
            By accessing or using EMS, you agree to be bound by these Terms of Service.
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            Last updated: December 21, 2025
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-ems-green-50 to-ems-blue-50">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xl">{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact your system administrator.
              </p>
              <Link to="/">
                <Button className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Return to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}