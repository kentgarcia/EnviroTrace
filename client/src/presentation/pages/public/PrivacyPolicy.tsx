import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { ArrowLeft, Database, Lock, Share2, ShieldCheck, Eye } from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Database,
      title: "1. Information We Collect",
      content: "We collect account information (email, name, role assignments), operational logs (login times, session data, IP addresses), and environmental records (vehicle emissions, tree management data, air quality measurements) necessary for EMS functionality. All data collection is limited to what is essential for providing our services."
    },
    {
      icon: Eye,
      title: "2. How We Use Your Data",
      content: "Your data is used to provide and maintain the EMS platform, authenticate users and manage access, generate reports and analytics, monitor system performance and security, and comply with legal and regulatory requirements. We do not use your data for marketing purposes or sell it to third parties."
    },
    {
      icon: Share2,
      title: "3. Data Sharing and Disclosure",
      content: "We do not sell personal data. Information may be shared with authorized government offices for environmental compliance and regulatory purposes, and with service providers who assist in platform operation under strict confidentiality agreements. We only disclose data when required by law or to protect system security."
    },
    {
      icon: Lock,
      title: "4. Data Security",
      content: "We implement industry-standard technical and organizational security measures including encrypted data transmission (HTTPS/TLS), secure password hashing and authentication, role-based access controls, regular security audits and updates, and automated backup systems. However, no method of transmission over the internet is 100% secure."
    },
    {
      icon: ShieldCheck,
      title: "5. Your Rights and Controls",
      content: "You have the right to access your personal data, request corrections to inaccurate information, request data deletion (subject to legal retention requirements), and opt-out of certain data processing activities. Contact your system administrator to exercise these rights or for any privacy-related concerns."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ems-green-50 via-white to-ems-blue-50">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
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
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how the Environmental Management System
            collects, uses, and protects your personal information.
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            Last updated: December 21, 2025
          </div>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Important:</strong> This Privacy Policy applies to all users of the Environmental Management System.
              By using EMS, you consent to the data practices described in this policy. If you do not agree with our policies and practices,
              please do not use the platform.
            </p>
          </CardContent>
        </Card>

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

        {/* Contact Section */}
        <div className="mt-12">
          <Card className="bg-gradient-to-br from-ems-green-50 to-ems-blue-50">
            <CardHeader>
              <CardTitle>Questions About Privacy?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have questions or concerns about this Privacy Policy or our data practices,
                please contact your system administrator or the Environmental Protection and Natural Resources Office (EPNRO).
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