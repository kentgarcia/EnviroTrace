import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/core/utils/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/presentation/components/shared/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/presentation/components/shared/ui/popover";
import { Button } from "@/presentation/components/shared/ui/button";
import { Badge } from "@/presentation/components/shared/ui/badge";

export interface MultiSelectItem {
    value: string;
    label: string;
}

interface MultiSelectProps {
    items: MultiSelectItem[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    className?: string;
    maxDisplayItems?: number;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
    (
        {
            items,
            selectedValues,
            onChange,
            placeholder = "Select items...",
            emptyMessage = "No items found.",
            disabled,
            className,
            maxDisplayItems = 3
        },
        ref
    ) => {
        const [open, setOpen] = React.useState(false);

        const selectedItems = React.useMemo(
            () => items.filter((item) => selectedValues.includes(item.value)),
            [items, selectedValues]
        );

        const handleSelect = (value: string) => {
            if (selectedValues.includes(value)) {
                onChange(selectedValues.filter((v) => v !== value));
            } else {
                onChange([...selectedValues, value]);
            }
        };

        const handleRemove = (value: string, e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onChange(selectedValues.filter((v) => v !== value));
        };

        const displayText = React.useMemo(() => {
            if (selectedItems.length === 0) {
                return placeholder;
            }

            if (selectedItems.length === 1) {
                return selectedItems[0].label;
            }

            if (selectedItems.length <= maxDisplayItems) {
                return selectedItems.map(item => item.label).join(", ");
            }

            return `${selectedItems.length} items selected`;
        }, [selectedItems, placeholder, maxDisplayItems]);

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("w-full justify-between", className)}
                        disabled={disabled}
                        ref={ref}
                    >
                        <div className="flex flex-wrap gap-1 flex-1 text-left">
                            {selectedItems.length === 0 && (
                                <span className="text-muted-foreground">{placeholder}</span>
                            )}
                            {selectedItems.length > 0 && selectedItems.length <= maxDisplayItems && (
                                <div className="flex flex-wrap gap-1">
                                    {selectedItems.map((item) => (
                                        <Badge
                                            key={item.value}
                                            variant="secondary"
                                            className="text-xs px-2 py-0.5"
                                        >
                                            {item.label}
                                            <button
                                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleRemove(item.value, e as any);
                                                    }
                                                }}
                                                onMouseDown={(e) => handleRemove(item.value, e)}
                                                onClick={(e) => handleRemove(item.value, e)}
                                            >
                                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            {selectedItems.length > maxDisplayItems && (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                    {selectedItems.length} selected
                                </Badge>
                            )}
                        </div>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search items..." />
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={handleSelect}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedValues.includes(item.value) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    }
);

MultiSelect.displayName = "MultiSelect";
