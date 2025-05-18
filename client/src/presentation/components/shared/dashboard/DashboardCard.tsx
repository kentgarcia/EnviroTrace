import React from "react";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import { cn } from "@/lib/utils/utils";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon | string; // Can be either a LucideIcon or an image URL
  className?: string;
  contentClassName?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export function DashboardCard({
  title,
  description,
  icon,
  className,
  contentClassName,
  iconClassName,
  onClick,
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:-translate-y-1",
        className
      )}
      onClick={onClick}
    >
      <CardContent
        className={cn(
          "p-6 flex flex-col items-center text-center",
          contentClassName
        )}
      >
        {typeof icon === "string" ? (
          <div
            className={cn(
              "w-full h-40 mb-4 overflow-hidden rounded-md",
              iconClassName
            )}
          >
            <img
              src={icon}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={cn("p-3 rounded-full bg-accent mb-4", iconClassName)}>
            {React.createElement(icon, { className: "h-8 w-8 text-primary" })}
          </div>
        )}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
