import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/presentation/components/shared/ui/button";
import { FloatingAppearanceSettings } from "@/presentation/components/shared/settings/FloatingAppearanceSettings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import {
  Avatar,
  AvatarFallback,
} from "@/presentation/components/shared/ui/avatar";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { useAuth } from "@/core/api/auth";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { toast } from "sonner";
import {
  Loader2,
  User,
  Mail,
  ShieldCheck,
  Save,
  Briefcase,
  Phone,
  ArrowLeft,
  Building2,
} from "lucide-react";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Separator } from "@/presentation/components/shared/ui/separator";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { useMyProfile, useUpdateProfile } from "@/core/api/profile-service";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    jobTitle: "",
    department: "",
    phoneNumber: "",
  });
  // Use the profile query hook
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError
  } = useMyProfile();

  // Use the update profile mutation hook
  const updateProfileMutation = useUpdateProfile();

  // Update profile data when the profile is loaded
  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.firstName || profile.first_name || "",
        lastName: profile.lastName || profile.last_name || "",
        email: user?.email || "",
        bio: profile.bio || "",
        jobTitle: profile.jobTitle || profile.job_title || "",
        department: profile.department || "",
        phoneNumber: profile.phoneNumber || profile.phone_number || "",
      });
    } else if (user) {
      setProfileData(prev => ({
        ...prev,
        email: user.email || "",
      }));
    }
  }, [profile, user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/" });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfileMutation.mutateAsync({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio,
        jobTitle: profileData.jobTitle,
        department: profileData.department,
        phoneNumber: profileData.phoneNumber,
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(`Failed to update profile: ${errorMessage}`);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border-red-200 dark:border-red-800";
      case "urban_greening":
        return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800";
      case "government_emission":
        return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-800";
      default:
        return "bg-slate-50 dark:bg-gray-900/30 text-slate-700 dark:text-gray-200 border-slate-200 dark:border-gray-700";
    }
  };

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground dark:text-gray-400 animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    if (profileData.firstName && profileData.lastName) {
      return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-900 flex flex-col overflow-y-auto">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-3 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img
                src="/images/logo_munti.png"
                alt="Muntinlupa Logo"
                className="h-10 w-10 rounded-full border-2 border-white"
              />
              <img
                src="/images/logo_epnro.png"
                alt="EPNRO Logo"
                className="h-10 w-10 rounded-full border-2 border-white"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-900 dark:text-gray-100 leading-tight">
                EnviroTrace
              </h1>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-slate-600 dark:text-gray-300 hover:text-primary hover:bg-primary/5 dark:hover:bg-gray-800"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
      </header>

      <div className="relative h-32 md:h-48 bg-slate-900 dark:bg-gray-950 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 dark:opacity-30"
          style={{ 
            backgroundImage: "url('/images/bg_login.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50" />
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 -mt-16 md:-mt-24 pb-20 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-slate-200 dark:border-gray-700 overflow-hidden">
              <div className="h-24 bg-slate-100 dark:bg-gray-800 relative">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardContent className="pt-16 pb-6 text-center">
                <h3 className="font-bold text-xl text-slate-900 dark:text-gray-100">
                  {profileData.firstName || profileData.lastName
                    ? `${profileData.firstName} ${profileData.lastName}`
                    : "User Account"}
                </h3>
                <p className="text-slate-500 dark:text-gray-400 text-sm mb-4">{user?.email}</p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {(() => {
                    const userRoles = user?.assigned_roles || user?.roles || [];
                    if (Array.isArray(userRoles) && userRoles.length > 0) {
                      return userRoles.map((role, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={`${getRoleColor(role)} font-medium px-2.5 py-0.5`}
                        >
                          {role.replace('_', ' ')}
                        </Badge>
                      ));
                    }
                    return <Badge variant="outline" className="text-slate-400">No Roles</Badge>;
                  })()}
                </div>

                <Separator className="my-4 opacity-50" />
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300">
                    <Briefcase className="h-4 w-4 text-slate-400 dark:text-gray-500" />
                    <span>{profileData.jobTitle || "No job title set"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300">
                    <Building2 className="h-4 w-4 text-slate-400 dark:text-gray-500" />
                    <span>{profileData.department || "No department set"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="border-slate-200 dark:border-gray-700">
              <CardHeader className="border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-gray-100">Profile Settings</CardTitle>
                <CardDescription className="dark:text-gray-400">Manage your personal information and how it appears to others.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-slate-700 dark:text-gray-300 font-medium">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
                        <Input
                          id="firstName"
                          className="pl-10 border-slate-200 dark:border-gray-700 focus:border-primary focus:ring-primary/10"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          placeholder="John"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-slate-700 dark:text-gray-300 font-medium">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
                        <Input
                          id="lastName"
                          className="pl-10 border-slate-200 dark:border-gray-700 focus:border-primary focus:ring-primary/10"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-gray-300 font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
                      <Input
                        id="email"
                        value={profileData.email}
                        disabled
                        className="pl-10 bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-gray-500 italic">Email address is managed by the system administrator.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-slate-700 dark:text-gray-300 font-medium">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      className="min-h-[120px] border-slate-200 dark:border-gray-700 focus:border-primary focus:ring-primary/10 resize-none"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder="Briefly describe your role and responsibilities..."
                    />
                  </div>

                  <Separator className="opacity-50" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle" className="text-slate-700 dark:text-gray-300 font-medium">Job Title</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
                        <Input
                          id="jobTitle"
                          className="pl-10 border-slate-200 dark:border-gray-700 focus:border-primary focus:ring-primary/10"
                          value={profileData.jobTitle}
                          onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                          placeholder="Environmental Officer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-slate-700 dark:text-gray-300 font-medium">Department</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
                        <Input
                          id="department"
                          className="pl-10 border-slate-200 dark:border-gray-700 focus:border-primary focus:ring-primary/10"
                          value={profileData.department}
                          onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                          placeholder="EPNRO"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-gray-300 font-medium">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
                      <Input
                        id="phoneNumber"
                        className="pl-10 border-slate-200 dark:border-gray-700 focus:border-primary focus:ring-primary/10"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                        placeholder="+63 900 000 0000"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="px-8 font-semibold"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

      {/* Floating Appearance Settings */}
      <FloatingAppearanceSettings />
    </div>
  );
}
