import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";

type RefreshButtonProps = {
  onClick: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  className?: string;
};

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  label = "Refresh",
  size = "sm",
  variant = "outline",
  className,
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={className}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      {label}
    </Button>
  );
};
