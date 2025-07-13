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
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";

const SEARCH_SAMPLE = [
  {
    plateNo: "ABC-123",
    transportGroup: "SAN PEDRO LANGGAM",
    operator: "JUAN DELA CRUZ",
    offense: 1,
  },
  {
    plateNo: "XYZ-456",
    transportGroup: "SAN PEDRO LANGGAM",
    operator: "MARIA SANTOS",
    offense: 0,
  },
  {
    plateNo: "LMN-789",
    transportGroup: "SAN PEDRO LANGGAM",
    operator: "PEDRO PENDUKO",
    offense: 2,
  },
];

const ORDER_SAMPLE: any[] = [];

const GarageTesting: React.FC = () => {
  const [vehicleName, setVehicleName] = useState("");
  const [transportGroup, setTransportGroup] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>(SEARCH_SAMPLE);
  const [orderList, setOrderList] = useState<any[]>(ORDER_SAMPLE);
  const [operatorName, setOperatorName] = useState("");
  const [testingOfficer, setTestingOfficer] = useState("");
  const [testingDate, setTestingDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  // --- Search Logic (Mock) ---
  const handleSearch = () => {
    setSearchResults(
      SEARCH_SAMPLE.filter(
        (v) =>
          v.plateNo.toLowerCase().includes(vehicleName.toLowerCase()) &&
          v.transportGroup.toLowerCase().includes(transportGroup.toLowerCase())
      )
    );
  };

  // --- Add/Remove Logic ---
  const handleAdd = (vehicle: any) => {
    setOrderList((prev) => [
      ...prev,
      {
        ...vehicle,
        payment: vehicle.offense > 0 ? 190 : 120,
        orNo: "",
        testResult: "",
        passFail: "",
      },
    ]);
    setSearchResults((prev) =>
      prev.filter((v) => v.plateNo !== vehicle.plateNo)
    );
  };
  const handleAddAll = () => {
    setOrderList((prev) => [
      ...prev,
      ...searchResults.map((vehicle) => ({
        ...vehicle,
        payment: vehicle.offense > 0 ? 190 : 120,
        orNo: "",
        testResult: "",
        passFail: "",
      })),
    ]);
    setSearchResults([]);
  };
  const handleRemove = (plateNo: string) => {
    const vehicle = orderList.find((v) => v.plateNo === plateNo);
    if (vehicle) {
      setSearchResults((prev) => [...prev, vehicle]);
      setOrderList((prev) => prev.filter((v) => v.plateNo !== plateNo));
    }
  };
  const handleRemoveAll = () => {
    setSearchResults((prev) => [...prev, ...orderList]);
    setOrderList([]);
  };

  // --- Totals ---
  const totalVehicles = orderList.length;
  const totalAmount = orderList.reduce((sum, v) => sum + (v.payment || 0), 0);

  // --- UI ---
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="air-quality" />
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            GARAGE TESTING
          </h1>
          <span className="bg-green-500 text-white px-3 py-1 rounded font-bold text-sm ml-4">
            NEW
          </span>
        </div>
        {/* Search & Order Info */}
        <div className="flex justify-between items-end px-6 pt-6 gap-6">
          <div className="flex gap-4">
            <div>
              <Label>Enter Vehicle Name</Label>
              <Input
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                placeholder="Vehicle Name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Enter Transport Group</Label>
              <Input
                value={transportGroup}
                onChange={(e) => setTransportGroup(e.target.value)}
                placeholder="Transport Group"
                className="mt-1"
              />
            </div>
            <Button onClick={handleSearch} className="h-10 mt-6">
              SEARCH
            </Button>
          </div>
          <div className="flex gap-4">
            <div>
              <Label>Operator/Payor Name</Label>
              <Input
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Operator/Payor Name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Testing Officer</Label>
              <Input
                value={testingOfficer}
                onChange={(e) => setTestingOfficer(e.target.value)}
                placeholder="Testing Officer"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Testing Date</Label>
              <Input
                type="date"
                value={testingDate}
                onChange={(e) => setTestingDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
        <div className="px-6 mt-4">
          <ColorDivider />
        </div>
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 px-6">
          {/* Search Table (Left) */}
          <Card className="col-span-1 flex flex-col h-full">
            <CardHeader>
              <CardTitle>Search Table</CardTitle>
              <div className="text-xs text-muted-foreground mt-1">
                F2: Add Selected &nbsp;|&nbsp; F3: Add All
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate No</TableHead>
                    <TableHead>Transport Group</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Offense</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  ) : (
                    searchResults.map((row) => (
                      <TableRow key={row.plateNo}>
                        <TableCell>{row.plateNo}</TableCell>
                        <TableCell>{row.transportGroup}</TableCell>
                        <TableCell>{row.operator}</TableCell>
                        <TableCell>{row.offense}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => handleAdd(row)}>
                            ADD
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAddAll}
                  disabled={searchResults.length === 0}
                >
                  F3: Add All
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Order Table (Right) */}
          <Card className="col-span-1 flex flex-col h-full">
            <CardHeader>
              <CardTitle>Order Table</CardTitle>
              <div className="text-xs text-muted-foreground mt-1">
                F5: Remove Selected &nbsp;|&nbsp; F6: Remove All
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate No</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>OR No.</TableHead>
                    <TableHead>Test Result</TableHead>
                    <TableHead>Pass/Fail</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No vehicles in order.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orderList.map((row) => (
                      <TableRow key={row.plateNo}>
                        <TableCell>{row.plateNo}</TableCell>
                        <TableCell>{row.payment?.toFixed(2)}</TableCell>
                        <TableCell>{row.orNo}</TableCell>
                        <TableCell>{row.testResult}</TableCell>
                        <TableCell>{row.passFail}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemove(row.plateNo)}
                          >
                            REMOVE
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleRemoveAll}
                  disabled={orderList.length === 0}
                >
                  F6: Remove All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Footer Actions and Totals */}
        <div className="flex justify-between items-center px-6 py-6 mt-6 border-t bg-white">
          <div className="flex gap-2">
            <Button>Save Batch Record</Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="secondary">Print CEC</Button>
            <Button variant="secondary">Print Batch Order of Payment</Button>
          </div>
          <div className="flex flex-col items-end">
            <div className="font-semibold">
              Total No. of Vehicles: {totalVehicles}
            </div>
            <div className="font-semibold text-lg">
              Pay Amount: P {totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarageTesting;
