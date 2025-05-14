import React from "react";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  iconClassName?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl shadow-md bg-white p-4 flex items-center",
        className
      )}
    >
      {/* Icon on the left */}
      <div
        className={cn(
          "flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-amber-400 mr-4",
          iconClassName
        )}
      >
        {icon}
      </div>
      {/* Data on the right */}
      <CardContent className="p-0 flex-1">
        <div className="flex flex-col justify-center">
          <span className="text-xs text-gray-500 font-medium mb-1 truncate">
            {title}
          </span>
          <span className="text-2xl font-extrabold text-blue-600 mb-1">
            {value}
          </span>
          {trendValue && (
            <span
              className={`text-xs ${
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {trendValue}
            </span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground mt-1">
              {description}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
