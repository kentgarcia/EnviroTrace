import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/core/utils/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/presentation/components/shared/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/presentation/components/shared/ui/popover";
import { Button } from "@/presentation/components/shared/ui/button";

export interface ComboboxItem {
  value: string;
  label: string;
}

interface CreatableComboboxProps {
  items: ComboboxItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  onCreate?: (value: string) => void;
}

export const CreatableCombobox = React.forwardRef<HTMLButtonElement, CreatableComboboxProps>(
  (
    { items, value, onChange, placeholder, emptyMessage, disabled, className, onCreate },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    // Find if the current value matches an item, or if it's a custom value
    const selectedItem = items.find((item) => item.value === value);
    const displayValue = selectedItem ? selectedItem.label : value;

    // Filter items based on input if CommandList doesn't do it automatically or if we want custom filtering
    // cmkd handles filtering usually, but we need to know if we should show the "Create" option
    // Actually, CommandEmpty shows when no items match.

    const handleSelect = (selectedValue: string) => {
      onChange(selectedValue);
      setOpen(false);
    };

    const handleCreate = () => {
      if (inputValue) {
        if (onCreate) {
          onCreate(inputValue);
        }
        onChange(inputValue);
        setOpen(false);
      }
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground",
              className
            )}
            disabled={disabled}
            ref={ref}
          >
            {displayValue || placeholder || "Select or enter..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search or enter new..." 
              onValueChange={setInputValue}
              value={inputValue}
            />
            <CommandList>
              <CommandEmpty className="py-2 px-2 text-sm">
                 <div className="flex flex-col gap-2">
                    <p className="text-muted-foreground text-center">{emptyMessage || "No items found."}</p>
                    {inputValue && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start h-auto py-1.5 px-2"
                            onClick={handleCreate}
                        >
                            <Plus className="mr-2 h-3 w-3" />
                            Create "{inputValue}"
                        </Button>
                    )}
                 </div>
              </CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.label} // Use label for searching
                    onSelect={() => handleSelect(item.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

CreatableCombobox.displayName = "CreatableCombobox";
