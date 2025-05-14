import { useState } from "react";
import { AppSidebar } from "@/presentation/components/shared/layout/AppSidebar";
import { SidebarProvider } from "@/presentation/components/shared/ui/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Switch } from "@/presentation/components/shared/ui/switch";
import { useToast } from "@/hooks/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    systemName: "Eco Dash Navigator",
    maintenanceMode: false,
    dataRetentionDays: "90",
    maxFileSize: "10",
    defaultLanguage: "en",
    enableNotifications: true,
    enableAuditLogs: true,
  });

  const handleSave = () => {
    // TODO: Implement settings save functionality
    toast({
      title: "Settings saved",
      description: "Your system settings have been updated successfully.",
    });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar dashboardType="air-quality" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground mt-2">
              Configure your system preferences and settings
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="systemName">System Name</Label>
                  <Input
                    id="systemName"
                    value={settings.systemName}
                    onChange={(e) =>
                      setSettings({ ...settings, systemName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Select
                    value={settings.defaultLanguage}
                    onValueChange={(value) =>
                      setSettings({ ...settings, defaultLanguage: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, maintenanceMode: checked })
                    }
                  />
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataRetentionDays">
                    Data Retention (Days)
                  </Label>
                  <Input
                    id="dataRetentionDays"
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        dataRetentionDays: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) =>
                      setSettings({ ...settings, maxFileSize: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableNotifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enableNotifications: checked })
                    }
                  />
                  <Label htmlFor="enableNotifications">
                    Enable Notifications
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableAuditLogs"
                    checked={settings.enableAuditLogs}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enableAuditLogs: checked })
                    }
                  />
                  <Label htmlFor="enableAuditLogs">Enable Audit Logs</Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
