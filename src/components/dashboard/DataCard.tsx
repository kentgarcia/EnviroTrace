
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton-card";

interface DataCardProps {
  title: string;
  description?: string;
  isLoading: boolean;
  error?: Error | null;
  className?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  contentHeight?: number;
}

export function DataCard({
  title,
  description,
  isLoading,
  error,
  className,
  children,
  headerAction,
  contentHeight = 100
}: DataCardProps) {
  if (isLoading) {
    return <SkeletonCard headerHeight={6} contentHeight={contentHeight} className={className} />;
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            Error: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className={headerAction ? "flex flex-row items-center justify-between" : undefined}>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {headerAction}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
