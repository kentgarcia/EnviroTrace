
import { ReactNode, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { useNetworkStatus } from "@/hooks/utils/useNetworkStatus";

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
  const { isOffline } = useNetworkStatus();

  // Memoize the error message to avoid re-renders
  const errorComponent = useMemo(() => {
    if (!error) return null;

    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        Error: {isOffline ? "You are currently offline. Please check your connection." : error.message}
      </div>
    );
  }, [error, isOffline]);

  if (isLoading) {
    return <SkeletonCard headerHeight={6} contentHeight={contentHeight} className={className} />;
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
        {error ? errorComponent : children}
      </CardContent>
    </Card>
  );
}
