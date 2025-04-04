
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Mail, ShieldCheck, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    } else if (user && userData) {
      fetchProfileData();
    }
  }, [user, userData, loading, navigate]);

  const fetchProfileData = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfileData({
        fullName: data?.full_name || "",
        email: user.email || "",
        avatarUrl: "",
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.fullName,
          updated_at: new Date(),
        })
        .eq("id", user.id);

      if (error) throw error;

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
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'air-quality':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'tree-management':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'government-emission':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ems-green-50 to-ems-blue-50">
      <header className="border-b bg-white py-4 px-6 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Placeholder for logos */}
            <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
              Logo 1
            </div>
            <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
              Logo 2
            </div>
            <h1 className="text-xl font-semibold">Environmental Management System</h1>
          </div>
          
          <Button variant="outline" onClick={() => navigate("/dashboard-selection")}>
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
                    {profileData.fullName.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <h3 className="font-medium text-xl">{profileData.fullName || "User"}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>

                <div className="w-full">
                  <Separator className="my-4" />
                  <h4 className="font-semibold mb-2 flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-1" /> Roles
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {userData?.roles.map((role, index) => (
                      <Badge key={index} variant="outline" className={getRoleColor(role)}>
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
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center">
                      <User className="h-4 w-4 mr-2" /> Full Name
                    </Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, fullName: e.target.value })
                      }
                      placeholder="Enter your full name"
                    />
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

                  <Button type="submit" className="w-full" disabled={isUpdating}>
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
