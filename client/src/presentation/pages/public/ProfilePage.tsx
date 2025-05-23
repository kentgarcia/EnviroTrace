import { useState, useEffect, useCallback } from "react";
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
import { fetchMyProfile, updateProfile } from "@/core/api/profile-api";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    jobTitle: "",
    department: "",
    phoneNumber: "",
  });

  // Memoize fetchProfileData to prevent unnecessary re-renders
  const fetchProfileData = useCallback(async () => {
    try {
      if (!user) return;

      setProfileLoading(true);

      // First set the email which we already have from auth
      setProfileData((prev) => ({
        ...prev,
        email: user.email || "",
      }));

      // Then fetch the profile data from GraphQL
      const profile = await fetchMyProfile();

      if (profile) {
        setProfileData((prev) => ({
          ...prev,
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          bio: profile.bio || "",
          jobTitle: profile.jobTitle || "",
          department: profile.department || "",
          phoneNumber: profile.phoneNumber || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/" });
    } else if (user && userData) {
      fetchProfileData();
    }
  }, [user, userData, loading, navigate, fetchProfileData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      if (!user) return;

      // Update profile with GraphQL
      await updateProfile({
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
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
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

  if (loading || profileLoading) {
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
                </div>

                <div className="w-full">
                  <Separator className="my-4" />
                  <h4 className="font-semibold mb-2 flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-1" /> Roles
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {userData?.roles.map((role, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={getRoleColor(role)}
                      >
                        {role}
                      </Badge>
                    ))}
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
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
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
