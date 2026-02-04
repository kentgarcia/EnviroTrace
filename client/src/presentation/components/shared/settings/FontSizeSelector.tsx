import { useSettingsStore } from "@/core/hooks/useSettingsStore";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export function FontSizeSelector() {
  const { fontSize, setFontSize } = useSettingsStore();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Font Size</h3>
        <p className="text-sm text-muted-foreground">
          Adjust the text size throughout the application
        </p>
      </div>

      <RadioGroup value={fontSize} onValueChange={setFontSize}>
        <div className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="small" id="small" />
          <Label
            htmlFor="small"
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <div className="flex-1">
              <div className="font-medium">Small</div>
              <div className="text-xs text-muted-foreground">
                Compact text for more content
              </div>
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              Preview: Aa
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="medium" id="medium" />
          <Label
            htmlFor="medium"
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <div className="flex-1">
              <div className="font-medium">Medium</div>
              <div className="text-sm text-muted-foreground">
                Default comfortable reading size
              </div>
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Preview: Aa
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="large" id="large" />
          <Label
            htmlFor="large"
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <div className="flex-1">
              <div className="font-medium">Large</div>
              <div className="text-base text-muted-foreground">
                Easier to read, better accessibility
              </div>
            </div>
            <div className="text-base font-medium text-muted-foreground">
              Preview: Aa
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
