import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Theme</h3>
        <p className="text-sm text-muted-foreground">
          Choose how the application looks to you
        </p>
      </div>
      
      <RadioGroup value={theme} onValueChange={setTheme}>
        <div className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="light" id="light" />
          <Label
            htmlFor="light"
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <Sun className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Light</div>
              <div className="text-sm text-muted-foreground">
                Bright and clear interface
              </div>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="dark" id="dark" />
          <Label
            htmlFor="dark"
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <Moon className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Dark</div>
              <div className="text-sm text-muted-foreground">
                Easy on the eyes in low light
              </div>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="system" id="system" />
          <Label
            htmlFor="system"
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <Monitor className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">System</div>
              <div className="text-sm text-muted-foreground">
                Match your device settings
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
