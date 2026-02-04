import { useState } from "react";
import { Sun, Moon, Monitor, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useSettingsStore } from "@/core/hooks/useSettingsStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/presentation/components/shared/ui/popover";
import { Button } from "@/presentation/components/shared/ui/button";
import { Label } from "@/presentation/components/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/shared/ui/radio-group";
import { Separator } from "@/presentation/components/shared/ui/separator";

export function FloatingAppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useSettingsStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="h-16 w-16 rounded-full bg-white dark:bg-gray-800 shadow-2xl border-4 border-blue-500 dark:border-blue-400 flex items-center justify-center hover:scale-110 transition-all duration-200 hover:shadow-blue-500/50 focus:outline-none"
            title="Appearance Settings"
          >
            {/* Appearance icon - Paint palette */}
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          align="end" 
          side="top" 
          className="w-80 p-4 mb-2"
          sideOffset={8}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-1">Appearance</h4>
              <p className="text-xs text-muted-foreground">
                Customize your viewing experience
              </p>
            </div>

            <Separator />

            {/* Theme Selector */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">Theme</Label>
              <RadioGroup value={theme} onValueChange={setTheme} className="space-y-2">
                <div className="flex items-center space-x-2 rounded-md border border-gray-200 dark:border-gray-700 p-2 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="light" id="float-light" />
                  <Label
                    htmlFor="float-light"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <Sun className="h-4 w-4 text-amber-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Light</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-md border border-gray-200 dark:border-gray-700 p-2 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="dark" id="float-dark" />
                  <Label
                    htmlFor="float-dark"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <Moon className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Dark</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-md border border-gray-200 dark:border-gray-700 p-2 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="system" id="float-system" />
                  <Label
                    htmlFor="float-system"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <Monitor className="h-4 w-4 text-slate-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">System</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Font Size Selector */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">Text Size</Label>
              <RadioGroup value={fontSize} onValueChange={setFontSize} className="space-y-2">
                <div className="flex items-center space-x-2 rounded-md border border-gray-200 dark:border-gray-700 p-2 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="small" id="float-small" />
                  <Label
                    htmlFor="float-small"
                    className="flex items-center justify-between cursor-pointer flex-1"
                  >
                    <span className="text-sm font-medium">Small</span>
                    <span className="text-xs text-muted-foreground">Aa</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-md border border-gray-200 dark:border-gray-700 p-2 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="medium" id="float-medium" />
                  <Label
                    htmlFor="float-medium"
                    className="flex items-center justify-between cursor-pointer flex-1"
                  >
                    <span className="text-sm font-medium">Medium</span>
                    <span className="text-sm text-muted-foreground">Aa</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-md border border-gray-200 dark:border-gray-700 p-2 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="large" id="float-large" />
                  <Label
                    htmlFor="float-large"
                    className="flex items-center justify-between cursor-pointer flex-1"
                  >
                    <span className="text-sm font-medium">Large</span>
                    <span className="text-base text-muted-foreground">Aa</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
