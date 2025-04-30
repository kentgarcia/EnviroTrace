
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface OfficeComplianceData {
  officeName: string;
  vehicleCount: number;
  testedCount: number;
  passedCount: number;
  complianceRate: number;
}

interface OfficeComplianceTableProps {
  complianceData: OfficeComplianceData[];
}

export function OfficeComplianceTable({ complianceData }: OfficeComplianceTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-background p-4 border-b">
        <h3 className="text-lg font-medium">Office Compliance</h3>
        <p className="text-sm text-muted-foreground">
          Vehicle testing compliance by office department
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Office</TableHead>
              <TableHead className="text-right">Vehicles</TableHead>
              <TableHead className="text-right">Tested</TableHead>
              <TableHead className="text-right">Compliance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complianceData && complianceData.length > 0 ? (
              complianceData.map((office) => (
                <TableRow key={office.officeName}>
                  <TableCell className="font-medium">{office.officeName}</TableCell>
                  <TableCell className="text-right">{office.vehicleCount}</TableCell>
                  <TableCell className="text-right">{office.testedCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Progress
                        value={office.complianceRate}
                        className="h-2 w-16"
                      />
                      <span className="text-sm font-medium">
                        {office.complianceRate}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No compliance data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
