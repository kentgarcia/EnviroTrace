import {
  Card,
  CardContent,
  CardHeader,
} from "@/presentation/components/shared/ui/card";
import { Skeleton } from "@/presentation/components/shared/ui/skeleton";

interface SkeletonCardProps {
  hasHeader?: boolean;
  headerHeight?: number;
  contentHeight?: number;
  className?: string;
}

export function SkeletonCard({
  hasHeader = true,
  headerHeight = 24,
  contentHeight = 100,
  className,
}: SkeletonCardProps) {
  return (
    <Card className={className}>
      {hasHeader && (
        <CardHeader className="pb-2">
          <Skeleton className={`h-${headerHeight} w-1/2`} />
        </CardHeader>
      )}
      <CardContent>
        <Skeleton className={`h-${contentHeight} w-full`} />
      </CardContent>
    </Card>
  );
}
