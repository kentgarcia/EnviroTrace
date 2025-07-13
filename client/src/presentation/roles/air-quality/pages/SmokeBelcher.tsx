import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/shared/ui/card";
import { Button } from "../../../components/shared/ui/button";
import { Input } from "../../../components/shared/ui/input";
import { Label } from "../../../components/shared/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/shared/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/shared/ui/tabs";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";

const VIOLATION_SAMPLE = {
  offenseLevel: "1st Offense",
  lastDateApprehended: "2017-11-06",
};

const SEARCH_RESULTS_SAMPLE = [
  {
    plateNumber: "ABC1234",
    vehicleType: "Sedan",
    operatorName: "Juan Dela Cruz",
  },
  {
    plateNumber: "XYZ5678",
    vehicleType: "Truck",
    operatorName: "Maria Santos",
  },
];

const SmokeBelcher: React.FC = () => {
  const [plateNumber, setPlateNumber] = useState("");
  const [record, setRecord] = useState<any | null>(null);
  const [tab, setTab] = useState<"violations" | "history">("violations");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = () => {
    // TODO: Replace with actual search logic
    setSearchResults(SEARCH_RESULTS_SAMPLE);
    setRecord(null);
  };

  const handleSelectRecord = (row: any) => {
    setRecord({
      ...row,
      operatorAddress: "123 Main St, City",
      status: "NEW",
      ...VIOLATION_SAMPLE,
    });
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="air-quality" />
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            Smoke Belcher
          </h1>
        </div>
        {/* Body Section */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
          <div className="px-6">
            <ColorDivider />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Search & Results */}
            <Card className="col-span-1 flex flex-col h-full">
              <CardHeader>
                <CardTitle>Search Vehicle</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="plateNumber">Enter Plate Number</Label>
                  <Input
                    id="plateNumber"
                    placeholder="e.g. ABC1234"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleSearch} className="w-full">
                  SEARCH
                </Button>
                <div className="text-xs text-muted-foreground mb-2">
                  F1 = View Single OOP Ctrl No. ; F2 = View Batch Ctrl No.
                </div>
                <div className="flex-1 min-h-[200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plate No.</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Operator</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-muted-foreground py-8"
                          >
                            No results.
                          </TableCell>
                        </TableRow>
                      ) : (
                        searchResults.map((row) => (
                          <TableRow
                            key={row.plateNumber}
                            className={`cursor-pointer ${
                              record?.plateNumber === row.plateNumber
                                ? "bg-blue-50"
                                : ""
                            }`}
                            onClick={() => handleSelectRecord(row)}
                          >
                            <TableCell>{row.plateNumber}</TableCell>
                            <TableCell>{row.vehicleType}</TableCell>
                            <TableCell>{row.operatorName}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            {/* Record Details */}
            <Card className="col-span-2 flex flex-col h-full">
              <CardHeader>
                <CardTitle>Record Information</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <Label>Plate Number</Label>
                    <Input
                      value={record?.plateNumber || ""}
                      readOnly
                      className="bg-muted"
                    />
                    <Label>Vehicle Type</Label>
                    <Input
                      value={record?.vehicleType || ""}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Operator Name</Label>
                    <Input
                      value={record?.operatorName || ""}
                      readOnly
                      className="bg-muted"
                    />
                    <Label>Operator Address</Label>
                    <Input
                      value={record?.operatorAddress || ""}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="flex flex-col gap-2 justify-end">
                    <Label>Record Status</Label>
                    <div className="rounded-md bg-muted text-foreground font-semibold text-center py-2">
                      {record?.status || "NEW"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary">ADD TO CEC QUEUE</Button>
                  <Button variant="secondary">OPEN PRINT CLEARANCE</Button>
                </div>
                <Tabs
                  value={tab}
                  onValueChange={(value) =>
                    setTab(value as "violations" | "history")
                  }
                >
                  <TabsList>
                    <TabsTrigger value="violations">VIOLATIONS</TabsTrigger>
                    <TabsTrigger value="history">RECORD HISTORY</TabsTrigger>
                  </TabsList>
                  <TabsContent value="violations">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                      <div>
                        <Label>Operator Offense Level</Label>
                        <div className="rounded-md bg-muted text-foreground font-medium text-center py-2">
                          {record?.offenseLevel || ""}
                        </div>
                      </div>
                      <div>
                        <Label>Last Date Apprehended</Label>
                        <div className="rounded-md bg-muted text-foreground font-medium text-center py-2">
                          {record?.lastDateApprehended || ""}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      F1 = View Ctrl No. ; F2 = Open OOP Vehicle Ctrl No. ; F3 =
                      Open OOP Driver Ctrl No.
                    </div>
                    <div className="rounded-md bg-primary text-white flex items-center justify-center min-h-[120px] font-medium my-2">
                      {/* Violation details would go here */}
                      <em>No violation details loaded.</em>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="secondary">ORDER OF PAYMENT</Button>
                      <Button variant="secondary">VIOLATION SUMMARY</Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="history">
                    <div className="my-4">
                      <em>No record history found.</em>
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="flex flex-col md:flex-row gap-2 mt-4">
                  <Button variant="secondary" className="w-full md:w-auto">
                    RECORDS AND FILE
                  </Button>
                  <Button variant="secondary" className="w-full md:w-auto">
                    GARAGE TESTING
                  </Button>
                  <Button variant="secondary" className="w-full md:w-auto">
                    DRIVER QUERY
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmokeBelcher;
