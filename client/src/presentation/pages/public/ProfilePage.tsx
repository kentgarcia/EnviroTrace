import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/presentation/components/shared/ui/button";
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
} from "lucide-react";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Separator } from "@/presentation/components/shared/ui/separator";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { useMyProfile, useUpdateProfile } from "@/core/api/profile-service";

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
    console.log("Profile data in component:", profile);
    // Debug log to see the user object structure
    console.log("User data in component:", user);

    if (profile) {
      setProfileData({
        // Handle both camelCase and snake_case field names from backend
        firstName: profile.firstName || profile.first_name || "",
        lastName: profile.lastName || profile.last_name || "",
        email: user?.email || "",
        bio: profile.bio || "",
        jobTitle: profile.jobTitle || profile.job_title || "",
        department: profile.department || "",
        phoneNumber: profile.phoneNumber || profile.phone_number || "",
      });

      console.log("Profile data updated in state");
    } else if (user) {
      setProfileData(prev => ({
        ...prev,
        email: user.email || "",
      }));
    }
  }, [profile, user]);
  // Check for roles specifically
  useEffect(() => {
    if (user) {
      console.log("Full user object:", user);
      console.log("User roles property:", user.roles);
      console.log("User assigned_roles property:", user.assigned_roles);

      const userRoles = user.assigned_roles || user.roles || [];
      console.log("Combined user roles:", userRoles);
      console.log("Is array?", Array.isArray(userRoles));

      // Also check the auth store directly
      const { roles } = useAuthStore.getState();
      console.log("Roles in auth store:", roles);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/" });
    }
  }, [user, authLoading, navigate]);
  // Show error toast if profile fetch fails
  useEffect(() => {
    if (profileError) {
      toast.error("Failed to load profile data. You may need to create a profile first.");
      console.error("Error fetching profile data:", profileError);

      // Even if there's an error, we can still populate with user data
      if (user) {
        setProfileData(prev => ({
          ...prev,
          email: user.email || "",
          // Initialize other fields as empty so the form still works
          firstName: prev.firstName || "",
          lastName: prev.lastName || "",
        }));
      }
    }
  }, [profileError, user]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Ensure we pass data in the format expected by our mutation hook
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
        return "bg-red-100 text-red-800 border-red-300";
      case "air_quality":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "tree_management":
        return "bg-green-100 text-green-800 border-green-300";
      case "government_emission":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get initial for avatar
  const getInitials = () => {
    if (profileData.firstName && profileData.lastName) {
      return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(
        0
      )}`.toUpperCase();
    } else if (profileData.firstName) {
      return profileData.firstName.charAt(0).toUpperCase();
    } else if (profileData.lastName) {
      return profileData.lastName.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-ems-green-50 to-ems-blue-50">
      <header className="border-b bg-white py-4 px-6 shadow-xs">
        <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
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
            <h1 className="text-xl font-semibold">
              Environmental Management System
            </h1>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate({ to: "/dashboard-selection" })}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <h3 className="font-medium text-xl">
                    {profileData.firstName || profileData.lastName
                      ? `${profileData.firstName} ${profileData.lastName}`
                      : "User"}
                  </h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  {profileData.jobTitle && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {profileData.jobTitle}
                    </p>
                  )}
                </div>                <div className="w-full">                  <Separator className="my-4" />
                  <h4 className="font-semibold mb-2 flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-1" /> Roles
                  </h4>                  <div className="flex flex-wrap gap-2 mt-1">
                    {(() => {
                      // Determine which roles array to use
                      const userRoles = user?.assigned_roles || user?.roles || [];

                      if (Array.isArray(userRoles) && userRoles.length > 0) {
                        return userRoles.map((role, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className={getRoleColor(role)}
                          >
                            {role}
                          </Badge>
                        ));
                      } else {
                        // Fallback to auth store roles if needed
                        const { roles } = useAuthStore.getState();
                        if (Array.isArray(roles) && roles.length > 0) {
                          return roles.map((role, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={getRoleColor(role)}
                            >
                              {role}
                            </Badge>
                          ));
                        } else {
                          return <p className="text-sm text-muted-foreground">No roles assigned</p>;
                        }
                      }
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="flex items-center">
                        <User className="h-4 w-4 mr-2" /> First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Enter your first name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="flex items-center">
                        <User className="h-4 w-4 mr-2" /> Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            lastName: e.target.value,
                          })
                        }
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" /> Email Address
                    </Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-muted-foreground">
                      Email address cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center">
                      <User className="h-4 w-4 mr-2" /> Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle" className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" /> Job Title
                      </Label>
                      <Input
                        id="jobTitle"
                        value={profileData.jobTitle}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            jobTitle: e.target.value,
                          })
                        }
                        placeholder="Your job title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" /> Department
                      </Label>
                      <Input
                        id="department"
                        value={profileData.department}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            department: e.target.value,
                          })
                        }
                        placeholder="Your department"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" /> Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="Your phone number"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}