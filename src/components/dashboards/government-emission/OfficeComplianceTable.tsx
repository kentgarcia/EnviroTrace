
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ComplianceData {
  name: string;
  pass: number;
  fail: number;
  rate: number;
}

interface OfficeComplianceTableProps {
  complianceData: ComplianceData[];
  selectedYear: number;
}

export function OfficeComplianceTable({ complianceData, selectedYear }: OfficeComplianceTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Compliance by Office</CardTitle>
        </div>
        <CardDescription>Pass rate by office for {selectedYear}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Office</TableHead>
                <TableHead>Passed</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No data available for {selectedYear}
                  </TableCell>
                </TableRow>
              ) : (
                complianceData.map((office, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{office.name}</TableCell>
                    <TableCell>{office.pass}</TableCell>
                    <TableCell>{office.fail}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          office.rate >= 90
                            ? "bg-green-100 text-green-800"
                            : office.rate >= 70
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {office.rate}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
