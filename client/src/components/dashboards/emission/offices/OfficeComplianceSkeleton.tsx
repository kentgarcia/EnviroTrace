import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface OfficeComplianceSkeletonProps {
    rowCount: number;
}

export function OfficeComplianceSkeleton({ rowCount }: OfficeComplianceSkeletonProps) {
    return (
        <>
            {Array.from({ length: rowCount }).map((_, index) => (
                <TableRow key={index}>
                    <TableCell>
                        <Skeleton className="h-5 w-[180px]" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-5 w-[40px]" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-5 w-[40px]" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-5 w-[40px]" />
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-[40px]" />
                                <Skeleton className="h-5 w-[50px]" />
                            </div>
                            <Skeleton className="h-2 w-full" />
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}