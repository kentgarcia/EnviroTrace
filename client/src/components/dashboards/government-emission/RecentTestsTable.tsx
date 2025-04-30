
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface VehicleData {
  plate_number: string;
  office_name: string;
  vehicle_type: string;
  engine_type: string;
}

interface TestData {
  id: string;
  test_date: string;
  result: boolean;
  vehicle?: VehicleData;
}

interface RecentTestsTableProps {
  recentTests: TestData[];
}

export function RecentTestsTable({ recentTests: initialTests }: RecentTestsTableProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter recent tests by search term
  const filteredRecentTests = initialTests.filter(test => 
    test.vehicle?.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.vehicle?.office_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Tests</h2>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plate or office"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="default" 
            className="flex items-center" 
            onClick={() => navigate("/government-emission/records")}
          >
            View all records <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Plate Number</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Engine</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecentTests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No recent tests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecentTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    {new Date(test.test_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {test.vehicle?.plate_number}
                  </TableCell>
                  <TableCell>{test.vehicle?.office_name}</TableCell>
                  <TableCell>{test.vehicle?.vehicle_type}</TableCell>
                  <TableCell>{test.vehicle?.engine_type}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        test.result
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {test.result ? "Pass" : "Fail"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
