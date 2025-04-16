import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Badge } from "../ui/badge";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  iconClassName?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className={cn("rounded-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && (
          <div className={cn("h-10 w-10 rounded-md text-white flex items-center justify-center", iconClassName)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {(description || trendValue) && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {trend && (
              <span
                className={cn(
                  "mr-1",
                  trend === "up" && "text-ems-green-500", 
                  trend === "down" && "text-destructive",
                  trend === "neutral" && "text-muted-foreground"
                )}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
              </span>
            )}
            {trendValue && <span className="mr-1">{trendValue}</span>}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
